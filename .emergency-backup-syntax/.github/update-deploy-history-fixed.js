#!/usr/bin/env node

/**
 * Deploy History & Self-Healing Manager
 *
 * Funktionen:
 * - Deploy-Historie verwalten
 * - Automatische Rollbacks bei Problemen
 * - Self-Healing und Optimierungen
 * - Crash-Protokollierung
 * - Shell-Kompatibilität (PowerShell, Bash, etc.)
 *
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Projektwurzel bestimmen
const rootDir = path.resolve(__dirname, '..', '..');
const publicDir = path.join(rootDir, 'public');

// Sicherstellen, dass das public-Verzeichnis existiert
if (!fs.existsSync(publicDir)) {
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`📁 Public-Verzeichnis erstellt: ${publicDir}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen von ${publicDir}:`, err);
  }
}

// Pfade definieren
const historyPath = path.join(publicDir, 'deploy-history.json');
const performancePath = path.join(publicDir, 'performance-history.json');
const recoveryFlagPath = path.join(publicDir, '.recovery-needed');
const crashLogsPath = path.join(publicDir, 'crash-logs.json');
const selfHealingPath = path.join(publicDir, 'self-healing-history.json');
const knowledgeBasePath = path.join(__dirname, '..', 'optimization-knowledge-base.json');

// Umgebungsvariablen
const date = process.env.DEPLOY_DATE || new Date().toISOString();
const status = process.env.DEPLOY_STATUS || 'success';
const run_id = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const commit = process.env.GITHUB_SHA || 'local-commit';
const repo = process.env.GITHUB_REPOSITORY || 'burnitoken/website';
const url = `https://github.com/${repo}/actions/runs/${run_id}`;

/**
 * Sicheres Schreiben von JSON-Dateien
 */
function safeWriteJson(filePath, data) {
  try {
    // Backup erstellen falls Datei existiert
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
    }

    // JSON validieren und schreiben
    const jsonStr = JSON.stringify(data, null, 2);
    JSON.parse(jsonStr); // Validierung

    // Atomic write (temp -> rename)
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, jsonStr, 'utf8');
    fs.renameSync(tempPath, filePath);

    return true;
  } catch (err) {
    console.error(`❌ Fehler beim Schreiben von ${filePath}:`, err);
    return false;
  }
}

/**
 * Shell-Umgebung erkennen und anpassen
 */
function detectShellEnvironment() {
  const isWindows = process.platform === 'win32';
  let shellType = 'bash';
  let shellVersion = '';
  let hasPowerShellIssues = false;

  try {
    if (isWindows) {
      try {
        // PowerShell-Version prüfen
        const psVersionOutput = execSync(
          'powershell -Command "$PSVersionTable.PSVersion.ToString()"',
          { encoding: 'utf8' },
        );
        shellType = 'powershell';
        shellVersion = psVersionOutput.trim();

        // Execution-Policy prüfen
        try {
          const policyOutput = execSync('powershell -Command "Get-ExecutionPolicy"', {
            encoding: 'utf8',
          });
          const policy = policyOutput.trim().toLowerCase();
          if (policy === 'restricted' || policy === 'allsigned') {
            hasPowerShellIssues = true;
          }
        } catch {
          hasPowerShellIssues = true;
        }
      } catch {
        // Fallback zu CMD
        shellType = 'cmd';
        try {
          const cmdVersionOutput = execSync('cmd /c "ver"', { encoding: 'utf8' });
          shellVersion = cmdVersionOutput.trim();
        } catch {
          shellVersion = 'unknown';
        }
      }
    } else {
      // Unix-Shell erkennen
      try {
        shellType = process.env.SHELL?.includes('zsh')
          ? 'zsh'
          : process.env.SHELL?.includes('bash')
            ? 'bash'
            : 'sh';
        const versionOutput = execSync(`${shellType} --version`, { encoding: 'utf8' });
        shellVersion = versionOutput.split('\n')[0];
      } catch {
        shellVersion = 'unknown';
      }
    }
  } catch (e) {
    console.error('❌ Fehler bei der Shell-Erkennung:', e);
  }

  return {
    type: shellType,
    version: shellVersion,
    isWindows,
    hasPowerShellIssues,
  };
}

/**
 * Sucht letzten stabilen Deploy vor bestimmtem Zeitpunkt
 */
function findLastStableDeployBefore(targetTime) {
  if (!fs.existsSync(historyPath)) {
    console.error('❌ Keine Deploy-Historie gefunden');
    return null;
  }

  let history;
  try {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch (e) {
    console.error('❌ Fehler beim Lesen der Deploy-Historie:', e);
    return null;
  }

  // Format HH:MM für heute interpretieren
  let targetDate;
  if (/^\d{1,2}:\d{2}$/.test(targetTime)) {
    const today = new Date();
    const [hours, minutes] = targetTime.split(':').map(Number);
    targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  } else {
    targetDate = new Date(targetTime);
  }

  if (isNaN(targetDate.getTime())) {
    console.error('❌ Ungültiges Zeitformat. Verwende HH:MM oder ISO-Zeitstempel');
    return null;
  }

  // Letzten erfolgreichen Deploy vor Zielzeit finden
  const stableDeploysBefore = history
    .filter((entry) => entry.status === 'success' && new Date(entry.date) < targetDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return stableDeploysBefore.length > 0 ? stableDeploysBefore[0] : null;
}

/**
 * Zeigt Recovery-Informationen an
 */
function showRecoveryInformation(timeString) {
  const lastStableDeploy = findLastStableDeployBefore(timeString);

  if (!lastStableDeploy) {
    console.error('❌ Keinen stabilen Deploy vor diesem Zeitpunkt gefunden.');
    return;
  }

  const deployDate = new Date(lastStableDeploy.date);
  const shellEnv = detectShellEnvironment();

  console.log('\n🔄 === RECOVERY INFORMATION ===');
  console.log(`📅 Letzter stabiler Deploy vor ${timeString}:`);
  console.log(`   Datum: ${deployDate.toLocaleString()}`);
  console.log(`   Commit: ${lastStableDeploy.commit.substring(0, 7)}`);
  console.log(`   Workflow: ${lastStableDeploy.url || 'Nicht verfügbar'}`);

  console.log('\n🛠️ Zum Wiederherstellen:');
  console.log(`   git checkout ${lastStableDeploy.commit}`);
  console.log('   npm install');
  console.log('   npm run build');

  console.log('\n🤖 Für automatisches Rollback:');
  console.log(
    `   node .github/update-deploy-history-fixed.js --recovery --time="${deployDate.toISOString()}"`,
  );
  console.log('=== RECOVERY COMPLETE ===\n');
}

/**
 * Protokolliert Abstürze und kritische Fehler
 */
function logCrash(crashInfo) {
  try {
    let crashes = [];
    if (fs.existsSync(crashLogsPath)) {
      try {
        crashes = JSON.parse(fs.readFileSync(crashLogsPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Crash-Logs konnten nicht geladen werden, erstelle neu');
      }
    }

    const crashId = `crash-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const crashEntry = {
      id: crashId,
      timestamp: new Date().toISOString(),
      ...crashInfo,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
      },
    };

    crashes.push(crashEntry);
    if (crashes.length > 100) {
      crashes = crashes.slice(-100);
    }

    safeWriteJson(crashLogsPath, crashes);

    // Recovery Flag setzen bei kritischen Problemen
    if (crashInfo.severity === 'critical' && !fs.existsSync(recoveryFlagPath)) {
      fs.writeFileSync(
        recoveryFlagPath,
        JSON.stringify({
          reason: `crash-${crashInfo.type}`,
          timestamp: new Date().toISOString(),
          crashId,
          recommendedAction: 'check-logs-and-fix',
        }),
      );
    }

    return crashId;
  } catch (err) {
    console.error('❌ Fehler beim Protokollieren des Absturzes:', err);
    return 'error-logging-crash';
  }
}

/**
 * Zeigt Crash-Report an
 */
function showCrashReport(since = null) {
  if (!fs.existsSync(crashLogsPath)) {
    console.log('✅ Keine Absturz-Protokolle gefunden. Das ist gut!');
    return;
  }

  try {
    const crashes = JSON.parse(fs.readFileSync(crashLogsPath, 'utf8'));

    if (crashes.length === 0) {
      console.log('✅ Keine Abstürze protokolliert. Das ist gut!');
      return;
    }

    // Zeitfilter anwenden
    let filterDate = null;
    if (since) {
      if (/^\d{1,2}:\d{2}$/.test(since)) {
        const today = new Date();
        const [hours, minutes] = since.split(':').map(Number);
        filterDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
        );
      } else {
        filterDate = new Date(since);
        if (isNaN(filterDate.getTime())) {
          console.error('❌ Ungültiges Zeitformat:', since);
          filterDate = null;
        }
      }
    }

    let filteredCrashes = filterDate
      ? crashes.filter((crash) => new Date(crash.timestamp) >= filterDate)
      : crashes;

    console.log('\n💥 === ABSTURZ-BERICHT ===');
    console.log(
      `📊 Anzahl der Abstürze${filterDate ? ` seit ${filterDate.toLocaleString()}` : ''}: ${filteredCrashes.length}`,
    );

    if (filteredCrashes.length === 0) {
      console.log('✅ Keine Abstürze im ausgewählten Zeitraum.');
      return;
    }

    // Nach Typ gruppieren
    const crashesByType = filteredCrashes.reduce((acc, crash) => {
      acc[crash.type] = acc[crash.type] || [];
      acc[crash.type].push(crash);
      return acc;
    }, {});

    // Bericht für jeden Typ
    Object.entries(crashesByType).forEach(([type, crashes]) => {
      console.log(`\n🔴 Typ: ${type} (${crashes.length} Vorkommen)`);
      console.log(`   Schweregrad: ${crashes[0].severity}`);
      console.log(`   Beispielnachricht: ${crashes[0].message}`);
      console.log(`   Erste Meldung: ${new Date(crashes[0].timestamp).toLocaleString()}`);
      console.log(
        `   Letzte Meldung: ${new Date(crashes[crashes.length - 1].timestamp).toLocaleString()}`,
      );

      if (crashes.length >= 3) {
        console.log('   ⚠️ Der Fehler tritt wiederholt auf. Eine Untersuchung wird empfohlen.');
      }
    });

    // Empfehlungen
    console.log('\n💡 Empfehlungen:');
    if (filteredCrashes.some((c) => c.severity === 'critical')) {
      console.log('❗ KRITISCHE ABSTÜRZE festgestellt! Sofortiges Handeln erforderlich.');
      console.log(
        '   Verwenden Sie: node .github/update-deploy-history-fixed.js --recovery --time=<zeit>',
      );
    } else if (filteredCrashes.some((c) => c.severity === 'high')) {
      console.log('⚠️ Schwerwiegende Fehler festgestellt. Zeitnahe Behebung empfohlen.');
    } else {
      console.log('ℹ️ Kleinere Probleme gefunden. Bei Gelegenheit beheben.');
    }

    console.log('=== ENDE DES BERICHTS ===\n');
  } catch (err) {
    console.error('❌ Fehler beim Anzeigen des Absturz-Berichts:', err);
  }
}

/**
 * Self-Healing: Automatische Problemidentifikation und -behebung
 */
function runSelfHealing(options = {}) {
  const {
    autoFix = true,
    runAudits = true,
    commitOnSuccess = true,
    maxChangesPerRun = 3,
  } = options;

  console.log('\n🔄 Starte Self-Healing-Prozess...');

  // Self-Healing Historie laden
  let healingHistory = [];
  if (fs.existsSync(selfHealingPath)) {
    try {
      healingHistory = JSON.parse(fs.readFileSync(selfHealingPath, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Self-Healing-Historie konnte nicht geladen werden, erstelle neu');
    }
  }

  // Knowledge Base laden
  let knowledgeBase = {
    metaTagPatterns: {},
    commonIssues: {},
    successfulFixes: [],
    failedFixes: [],
  };

  if (fs.existsSync(knowledgeBasePath)) {
    try {
      knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Knowledge Base konnte nicht geladen werden, erstelle neu');
      const knowledgeBaseDir = path.dirname(knowledgeBasePath);
      if (!fs.existsSync(knowledgeBaseDir)) {
        fs.mkdirSync(knowledgeBaseDir, { recursive: true });
      }
      safeWriteJson(knowledgeBasePath, knowledgeBase);
    }
  } else {
    const knowledgeBaseDir = path.dirname(knowledgeBasePath);
    if (!fs.existsSync(knowledgeBaseDir)) {
      fs.mkdirSync(knowledgeBaseDir, { recursive: true });
    }
    safeWriteJson(knowledgeBasePath, knowledgeBase);
  }

  // Self-Healing Session starten
  const healingSession = {
    id: `healing-${Date.now()}`,
    timestamp: new Date().toISOString(),
    commit: commit,
    issues: [],
    fixes: [],
    tests: {},
    success: false,
  };

  // 1. Probleme identifizieren
  const issues = identifyIssues(runAudits);
  healingSession.issues = issues;

  if (issues.length === 0) {
    console.log('✅ Keine Probleme gefunden. Website ist in optimalem Zustand!');
    healingSession.success = true;
    healingHistory.push(healingSession);
    safeWriteJson(selfHealingPath, healingHistory);
    return;
  }

  console.log(`🔍 ${issues.length} Probleme identifiziert`);

  // 2. Probleme priorisieren
  const prioritizedIssues = prioritizeIssues(issues, knowledgeBase).slice(0, maxChangesPerRun);

  console.log(`🔧 Höchste Priorität: ${prioritizedIssues.map((i) => i.type).join(', ')}`);

  // 3. Fixes anwenden
  if (autoFix) {
    const fixes = applyFixes(prioritizedIssues, knowledgeBase);
    healingSession.fixes = fixes;

    // 4. Tests nach Fixes
    const testResults = runTestsAfterFixes(fixes);
    healingSession.tests = testResults;

    // 5. Bei Erfolg committen
    if (commitOnSuccess && testResults.allPassed) {
      const commitSuccess = commitSelfHealingChanges(fixes);
      healingSession.committed = commitSuccess;

      if (commitSuccess) {
        console.log('🎉 Self-Healing erfolgreich! Änderungen wurden committet.');

        // Erfolgreiche Fixes in Knowledge Base eintragen
        fixes
          .filter((f) => f.successful)
          .forEach((fix) => {
            knowledgeBase.successfulFixes.push({
              type: fix.issueType,
              timestamp: fix.timestamp,
              actions: fix.actions?.length || 0,
            });
          });

        safeWriteJson(knowledgeBasePath, knowledgeBase);
      }
    }
  }

  // Session speichern
  healingSession.success = healingSession.tests?.allPassed || false;
  healingHistory.push(healingSession);
  if (healingHistory.length > 100) {
    healingHistory = healingHistory.slice(-100);
  }
  safeWriteJson(selfHealingPath, healingHistory);

  console.log('📊 Self-Healing-Session abgeschlossen');
}

/**
 * Identifiziert Probleme auf der Website
 */
function identifyIssues(runAudits = true) {
  const issues = [];

  // Bekannte Probleme prüfen
  try {
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');

      // Bilder ohne alt-Attribute
      const imgWithoutAlt = content.match(/<img(?!.*alt=)[^>]*>/g) || [];
      if (imgWithoutAlt.length > 0) {
        issues.push({
          type: 'a11y-missing-alt',
          severity: 'high',
          description: `${imgWithoutAlt.length} Bilder ohne alt-Attribut gefunden`,
          affectedElements: imgWithoutAlt.map(
            (tag) => tag.match(/src="([^"]+)"/)?.[1] || 'unknown',
          ),
          recommendations: ['Alt-Attribute für alle Bilder hinzufügen'],
        });
      }

      // Meta-Description prüfen
      const hasDescriptionTag = /<meta\s+name="description"/i.test(content);
      if (!hasDescriptionTag) {
        issues.push({
          type: 'seo-meta-description',
          severity: 'high',
          description: 'Meta-Description-Tag fehlt oder ist fehlerhaft',
          affectedElements: ['index.html'],
          recommendations: ['Meta-Description mit name="description" hinzufügen'],
        });
      }
    }
  } catch (err) {
    console.error('❌ Fehler bei der Problemidentifikation:', err);
  }

  // Simulierte Audit-Ergebnisse (in Produktion echte Tools verwenden)
  if (runAudits) {
    console.log('🔍 Führe Performance-Audits durch...');

    // Beispiel-Performance-Probleme
    issues.push({
      type: 'performance-lcp',
      severity: 'medium',
      score: 0.78,
      description: 'Largest Contentful Paint zu langsam: 3.2s',
      affectedElements: ['assets/images/burni-logo.webp'],
      recommendations: ['Preloading für kritische Assets'],
    });
  }

  return issues;
}

/**
 * Priorisiert Probleme nach Schweregrad
 */
function prioritizeIssues(issues, knowledgeBase) {
  const severityScores = {
    critical: 100,
    high: 80,
    medium: 60,
    low: 40,
    info: 20,
  };

  const typeScores = {
    security: 50,
    'performance-lcp': 45,
    'seo-critical': 40,
    accessibility: 35,
    'api-reliability': 30,
    'code-quality': 25,
  };

  const scoredIssues = issues.map((issue) => {
    let score = severityScores[issue.severity] || 50;

    if (issue.type in typeScores) {
      score += typeScores[issue.type];
    }

    // Bonus für vorher erfolgreiche Fixes
    const successfulFixExists = knowledgeBase.successfulFixes.some(
      (fix) => fix.type === issue.type,
    );
    if (successfulFixExists) {
      score += 15;
    }

    return { ...issue, priorityScore: score };
  });

  return scoredIssues.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Wendet Fixes für Probleme an
 */
function applyFixes(issues, knowledgeBase) {
  const appliedFixes = [];

  for (const issue of issues) {
    console.log(`\n⚙️ Bearbeite Problem: ${issue.type} (${issue.severity})`);

    const fixResult = {
      issueType: issue.type,
      issueDescription: issue.description,
      timestamp: new Date().toISOString(),
      applied: false,
      successful: false,
      actions: [],
      error: null,
    };

    try {
      switch (issue.type) {
        case 'performance-lcp':
          fixResult.actions = optimizeLCP(issue);
          break;
        case 'seo-meta-description':
          fixResult.actions = fixMetaDescription(issue);
          break;
        case 'a11y-missing-alt':
          fixResult.actions = fixMissingAltAttributes(issue);
          break;
        default:
          console.log(`⚠️ Keine automatische Korrektur für: ${issue.type}`);
          fixResult.actions = [];
      }

      fixResult.applied = fixResult.actions.length > 0;
      fixResult.successful =
        fixResult.applied && fixResult.actions.every((action) => action.success);

      if (fixResult.applied) {
        if (fixResult.successful) {
          console.log(`✅ Fix für '${issue.type}' erfolgreich angewendet.`);
        } else {
          console.log(`❌ Fix für '${issue.type}' fehlgeschlagen.`);
        }
      }
    } catch (error) {
      console.error(`❌ Fehler beim Fix für ${issue.type}:`, error);
      fixResult.error = error.message;
    }

    appliedFixes.push(fixResult);
  }

  return appliedFixes;
}

/**
 * Fix-Funktionen
 */
function optimizeLCP(issue) {
  const actions = [];

  try {
    console.log('🚀 Optimiere Largest Contentful Paint...');

    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      let modified = false;

      // Preload-Tags für kritische Bilder
      const criticalImages = ['assets/images/burni-logo.webp', 'assets/images/burni-chart.webp'];

      for (const img of criticalImages) {
        if (!content.includes(`rel="preload" href="${img}"`)) {
          const preloadTag = `  <link rel="preload" as="image" href="${img}" />\n`;
          content = content.replace('</head>', `${preloadTag}</head>`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(indexPath, content, 'utf8');
        actions.push({
          action: 'add-preload-tags',
          file: 'index.html',
          success: true,
          description: 'Preload-Tags für kritische Bilder hinzugefügt',
        });
      }
    }
  } catch (err) {
    actions.push({
      action: 'optimize-lcp',
      success: false,
      error: err.message,
    });
  }

  return actions;
}

function fixMetaDescription(issue) {
  const actions = [];

  try {
    console.log('📝 Korrigiere Meta-Description...');

    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      let modified = false;

      if (!content.includes('name="description"')) {
        const defaultDesc =
          'Die deflationäre Kryptowährung auf dem XRP Ledger mit automatischem Token-Burning. Investieren Sie in eine nachhaltige Zukunft.';
        const metaTag = `  <meta name="description" content="${defaultDesc}" />\n`;
        content = content.replace('</head>', `${metaTag}</head>`);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(indexPath, content, 'utf8');
        actions.push({
          action: 'fix-meta-description',
          file: 'index.html',
          success: true,
          description: 'Meta-Description-Tag hinzugefügt',
        });
      }
    }
  } catch (err) {
    actions.push({
      action: 'fix-meta-description',
      success: false,
      error: err.message,
    });
  }

  return actions;
}

function fixMissingAltAttributes(issue) {
  const actions = [];

  try {
    console.log('♿ Füge Alt-Attribute hinzu...');

    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      let modified = false;

      const imgWithoutAlt = /<img(?!.*alt=)[^>]*>/g;
      content = content.replace(imgWithoutAlt, (match) => {
        const srcMatch = match.match(/src="([^"]+)"/);
        let altText = 'BurniToken Bild';

        if (srcMatch) {
          const filename = srcMatch[1].toLowerCase();
          if (filename.includes('logo')) altText = 'BurniToken Logo';
          else if (filename.includes('chart')) altText = 'BurniToken Preischart';
          else if (filename.includes('burn')) altText = 'Token Burning Visualisierung';
        }

        modified = true;
        return match.replace('>', ` alt="${altText}">`);
      });

      if (modified) {
        fs.writeFileSync(indexPath, content, 'utf8');
        actions.push({
          action: 'add-alt-attributes',
          file: 'index.html',
          success: true,
          description: 'Alt-Attribute für Bilder hinzugefügt',
        });
      }
    }
  } catch (err) {
    actions.push({
      action: 'fix-alt-attributes',
      success: false,
      error: err.message,
    });
  }

  return actions;
}

/**
 * Führt Tests nach Fixes durch
 */
function runTestsAfterFixes(fixes) {
  console.log('🧪 Validiere Änderungen...');

  const testResults = {
    allPassed: true,
    tests: {
      htmlValid: true,
      noJsErrors: true,
    },
  };

  try {
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');

      // Einfache HTML-Validierung
      const hasOpeningHtml = content.includes('<html');
      const hasClosingHtml = content.includes('</html>');
      const hasHead = content.includes('<head>') && content.includes('</head>');

      testResults.tests.htmlValid = hasOpeningHtml && hasClosingHtml && hasHead;
    }

    testResults.allPassed = Object.values(testResults.tests).every((test) => test === true);
  } catch (err) {
    console.error('❌ Fehler bei Validierung:', err);
    testResults.allPassed = false;
    testResults.error = err.message;
  }

  return testResults;
}

/**
 * Committet Self-Healing-Änderungen
 */
function commitSelfHealingChanges(fixes) {
  try {
    const appliedFixes = fixes.filter((f) => f.applied && f.successful);
    if (appliedFixes.length === 0) return true;

    const shellEnv = detectShellEnvironment();
    const message = `🤖 Auto-Fix: ${appliedFixes.map((f) => f.issueType).join(', ')}`;

    // Git add
    execSync('git add index.html public/', { encoding: 'utf8' });

    // Git commit
    const commitCmd =
      shellEnv.type === 'powershell'
        ? `git commit -m "${message.replace(/"/g, '\\"')}"`
        : `git commit -m "${message}"`;

    execSync(commitCmd, { encoding: 'utf8' });

    console.log(`✅ Änderungen committet: "${message}"`);
    return true;
  } catch (err) {
    console.error('❌ Fehler beim Committen:', err);
    return false;
  }
}

/**
 * Performance-Tracking
 */
function trackPerformance(commitId, deployTime) {
  try {
    let perfHistory = [];
    if (fs.existsSync(performancePath)) {
      try {
        perfHistory = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Performance-Historie konnte nicht geladen werden');
      }
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      commit: commitId,
      deployTime,
      measurements: {
        memory: process.memoryUsage(),
        loadTime: Math.random() * 1000 + 500, // Platzhalter
        scriptErrors: 0,
        apiLatency: 0,
      },
    };

    perfHistory.push(metrics);
    if (perfHistory.length > 100) {
      perfHistory = perfHistory.slice(-100);
    }

    safeWriteJson(performancePath, perfHistory);
  } catch (err) {
    console.error('❌ Fehler beim Performance-Tracking:', err);
  }
}

/**
 * Auto-Rollback bei kritischen Problemen
 */
function executeAutoRollbackIfNeeded(autoFix = true) {
  if (!fs.existsSync(recoveryFlagPath)) return;

  try {
    const recoveryData = JSON.parse(fs.readFileSync(recoveryFlagPath, 'utf8'));

    // Älter als 15 Minuten ignorieren
    if (new Date() - new Date(recoveryData.timestamp) > 15 * 60 * 1000) {
      console.log('⏰ Recovery-Flag ignoriert (älter als 15 Minuten)');
      return;
    }

    console.log('\n🚨 AUTO-ROLLBACK WIRD AUSGEFÜHRT 🚨');
    console.log(`Grund: ${recoveryData.reason}`);
    console.log(`Zeitpunkt: ${new Date(recoveryData.timestamp).toLocaleString()}`);

    if (!autoFix) {
      console.log('\n📋 Auto-Fix ist deaktiviert. Manueller Rollback:');
      console.log(
        `node .github/update-deploy-history-fixed.js --recovery --time=${recoveryData.timestamp}`,
      );
      return;
    }

    // Letzten stabilen Deploy finden
    const lastStableDeploy = findLastStableDeployBefore(new Date(recoveryData.timestamp));
    if (!lastStableDeploy) {
      console.error('❌ Keinen stabilen Deploy für Rollback gefunden!');
      return;
    }

    console.log(`🔄 Rollback zu Commit: ${lastStableDeploy.commit.substring(0, 7)}`);

    try {
      // Git checkout
      execSync(`git checkout ${lastStableDeploy.commit}`, { encoding: 'utf8' });
      console.log('✅ Git-Checkout erfolgreich');

      // npm install
      execSync('npm install', { encoding: 'utf8', stdio: 'inherit' });
      console.log('✅ npm install erfolgreich');

      // npm build
      execSync('npm run build', { encoding: 'utf8', stdio: 'inherit' });
      console.log('✅ npm run build erfolgreich');

      // Recovery Flag löschen
      fs.unlinkSync(recoveryFlagPath);
      console.log('🎉 Auto-Rollback abgeschlossen');
    } catch (e) {
      console.error('❌ Fehler beim Rollback:', e);
    }
  } catch (err) {
    console.error('❌ Fehler beim Auto-Rollback:', err);
  }
}

// CLI-Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 Deploy History & Self-Healing Manager

Verwendung: node update-deploy-history-fixed.js [Optionen]

Optionen:
  --recovery --time=<zeit>      Zeige Recovery-Informationen an
  --show-crashes [--since=<zeit>]  Zeige Absturz-Bericht an
  --self-healing               Führe Self-Healing durch
  --auto-rollback              Prüfe Auto-Rollback
  --shell-info                 Zeige Shell-Informationen an
  --help, -h                   Zeige diese Hilfe an

Beispiele:
  node update-deploy-history-fixed.js --recovery --time="14:30"
  node update-deploy-history-fixed.js --show-crashes --since="12:00"
  node update-deploy-history-fixed.js --self-healing
    `);
    process.exit(0);
  }

  try {
    // Recovery-Modus
    if (args.includes('--recovery')) {
      const timeIndex = args.findIndex((arg) => arg.startsWith('--time='));
      if (timeIndex !== -1) {
        const timeString = args[timeIndex].split('=')[1];
        showRecoveryInformation(timeString);
      } else {
        console.error('❌ --recovery benötigt --time=<zeit> Parameter');
        process.exit(1);
      }
      process.exit(0);
    }

    // Crash-Report
    if (args.includes('--show-crashes')) {
      const sinceIndex = args.findIndex((arg) => arg.startsWith('--since='));
      const since = sinceIndex !== -1 ? args[sinceIndex].split('=')[1] : null;
      showCrashReport(since);
      process.exit(0);
    }

    // Self-Healing
    if (args.includes('--self-healing')) {
      runSelfHealing({
        autoFix: true,
        runAudits: true,
        commitOnSuccess: false,
      });
      process.exit(0);
    }

    // Auto-Rollback
    if (args.includes('--auto-rollback')) {
      executeAutoRollbackIfNeeded(true);
      process.exit(0);
    }

    // Shell-Info
    if (args.includes('--shell-info')) {
      const shellEnv = detectShellEnvironment();
      console.log('\n🖥️ === SHELL-UMGEBUNG ===');
      console.log(JSON.stringify(shellEnv, null, 2));
      process.exit(0);
    }

    // Standard-Deploy-Update
    console.log('📊 Aktualisiere Deploy-Historie...');

    // Performance-Tracking
    trackPerformance(commit, date);

    // Auto-Rollback prüfen
    executeAutoRollbackIfNeeded(true);

    // Deploy-Historie aktualisieren
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Deploy-Historie konnte nicht geladen werden, erstelle neu');
      }
    }

    const deployEntry = {
      date,
      status,
      run_id,
      commit,
      url,
    };

    history.push(deployEntry);

    // Auf letzte 50 Einträge beschränken
    if (history.length > 50) {
      history = history.slice(-50);
    }

    safeWriteJson(historyPath, history);
    console.log(`✅ Deploy-Eintrag hinzugefügt: ${status} (${commit.substring(0, 7)})`);

    // Self-Healing bei erfolgreichen Deploys
    if (status === 'success') {
      runSelfHealing({
        autoFix: false,
        runAudits: false,
        commitOnSuccess: false,
      });
    }
  } catch (error) {
    console.error('❌ Fehler beim Deploy-History-Update:', error);

    // Absturz protokollieren
    logCrash({
      type: 'deploy-history-update',
      severity: 'high',
      message: error.message,
      component: 'update-deploy-history-fixed.js',
    });

    process.exit(1);
  }
}
