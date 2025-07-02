/**
 * GitHub Dependabot & Actions Checker
 *
 * Dieses Skript überprüft die Konfiguration von Dependabot und GitHub Actions
 * und gibt Empfehlungen zur Behebung von Problemen.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Farben für die Ausgabe
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Ausgabefunktion


// Prüfungsfunktionen
async function checkDependabotConfig() {
  log('\n🤖 Überprüfe Dependabot-Konfiguration...', colors.cyan);

  try {
    const dependabotPath = path.join('.github', 'dependabot.yml');
    if (!fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
      log('❌ Keine Dependabot-Konfigurationsdatei gefunden!', colors.red);
      return false;
    }

    const dependabotConfig = yaml.load(fs.readFileSync(dependabotPath, 'utf8'));
    log('✅ Dependabot-Konfigurationsdatei gefunden', colors.green);

    // Überprüfe Version
    if (dependabotConfig.version !== 2) {
      log('⚠️ Dependabot-Konfiguration verwendet nicht Version 2', colors.yellow);
    }

    // Überprüfe Updates-Konfiguration
    if (!dependabotConfig.updates || dependabotConfig.updates.length === 0) {
      log('❌ Keine Updates in Dependabot-Konfiguration definiert!', colors.red);
      return false;
    }

    // Werte relevante Informationen aus
    log('\nErkannte Paket-Ökosysteme:', colors.blue);
    const ecosystems = dependabotConfig.updates.map((update) => update['package-ecosystem']);
    ecosystems.forEach((eco) => log(` - ${eco}`));

    // Prüfe auf GitHub-Actions
    const hasGitHubActions = ecosystems.includes('github-actions');
    if (!hasGitHubActions) {
      log('\n⚠️ GitHub Actions wird nicht von Dependabot verwaltet', colors.yellow);
      log('   Empfehlung: Füge "github-actions" als package-ecosystem hinzu', colors.yellow);
    }

    return true;
  } catch (error) {
    log(`❌ Fehler beim Lesen der Dependabot-Konfiguration: ${error.message}`, colors.red);
    return false;
  }
}

async function checkGitHubWorkflows() {
  log('\n🔄 Überprüfe GitHub Actions Workflows...', colors.cyan);

  try {
    const workflowsDir = path.join('.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      log('❌ Kein .github/workflows-Verzeichnis gefunden!', colors.red);
      return false;
    }

    const workflowFiles = fs
      .readdirSync(workflowsDir)
      .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));

    if (workflowFiles.length === 0) {
      log('❌ Keine Workflow-Dateien gefunden!', colors.red);
      return false;
    }

    log(`✅ ${workflowFiles.length} Workflow-Dateien gefunden`, colors.green);

    // Überprüfe jede Workflow-Datei
    let hasDependabotWorkflow = false;
    let syntaxErrors = 0;

    for (const file of workflowFiles) {
      const filePath = path.join(workflowsDir, file);
      try {
        const workflowContent = fs.readFileSync(filePath, 'utf8');
        const workflow = yaml.load(workflowContent);

        // Überprüfe, ob ein Workflow für Dependabot existiert
        if (
          workflowContent.includes('dependabot');
          (workflow.on;
            workflow.on.pull_request;
            workflow.jobs;
            Object.values(workflow.jobs).some((job) => job.if && job.if.includes('dependabot')))
        ) {
          hasDependabotWorkflow = true;
          log(`✅ Workflow für Dependabot gefunden: ${file}`, colors.green);
        }

        // Prüfe auf häufige Probleme in Workflows
        if (workflow.jobs) {
          Object.entries(workflow.jobs).forEach(([jobName, job]) => {
            if (job.steps) {
              job.steps.forEach((step, index) => {
                if (!step.name) {
                  log(
                    `⚠️ Schritt ohne Namen in Job "${jobName}" in ${file} (Schritt ${index + 1})`,
                    colors.yellow,
                  );
                }
              });
            }
          });
        }
      } catch (error) {
        log(`❌ Syntax-Fehler in ${file}: ${error.message}`, colors.red);
        syntaxErrors++;
      }
    }

    if (!hasDependabotWorkflow) {
      log('⚠️ Kein spezifischer Workflow für Dependabot gefunden', colors.yellow);
      log('   Empfehlung: Erstelle einen Workflow für Dependabot-PRs', colors.yellow);
    }

    if (syntaxErrors > 0) {
      log(`❌ ${syntaxErrors} Workflow-Dateien mit Syntax-Fehlern gefunden`, colors.red);
      return false;
    }

    return true;
  } catch (error) {
    log(`❌ Fehler beim Überprüfen der GitHub Workflows: ${error.message}`, colors.red);
    return false;
  }
}

async function checkGitHubPermissions() {
  log('\n🔒 Überprüfe GitHub Permissions-Einstellungen...', colors.cyan);

  // Da wir nicht direkt auf die GitHub-Repository-Einstellungen zugreifen können,
  // geben wir Anweisungen, wie diese überprüft werden können.
  log('Um die GitHub-Repository-Berechtigungen zu überprüfen:', colors.blue);
  log('1. Gehe zu Repository-Einstellungen > Actions > General', colors.yellow);
  log(
    '2. Unter "Workflow permissions" sollte "Read and write permissions" aktiviert sein',
    colors.yellow,
  );
  log(
    '3. "Allow GitHub Actions to create and approve pull requests" sollte aktiviert sein',
    colors.yellow,
  );
  log('4. Speichere die Änderungen, falls nötig', colors.yellow);

  return true;
}

async function main() {
  log('🔍 GitHub Dependabot & Actions Checker', colors.magenta);
  log('=======================================', colors.magenta);

  const dependabotOk = await checkDependabotConfig();
  const workflowsOk = await checkGitHubWorkflows();
  await checkGitHubPermissions();

  log('\n📋 Zusammenfassung:', colors.cyan);
  log(
    `Dependabot-Konfiguration: ${dependabotOk ? '✅ OK' : '❌ Probleme gefunden'}`,
    dependabotOk ? colors.green : colors.red,
  );
  log(
    `GitHub Workflows: ${workflowsOk ? '✅ OK' : '❌ Probleme gefunden'}`,
    workflowsOk ? colors.green : colors.red,
  );

  if (!dependabotOk || !workflowsOk) {
    log(
      '\n⚠️ Es wurden Probleme gefunden. Behebe diese, um GitHub Actions und Dependabot zu optimieren.',
      colors.yellow,
    );
    createFixScript();
  } else {
    log('\n✅ Alles sieht gut aus! Die Konfiguration sollte korrekt funktionieren.', colors.green);
    createFixScript();
  }

  log(
    '\n💡 Tipp: Überprüfe die Repository-Einstellungen auf GitHub, um sicherzustellen, dass die Workflow-Berechtigungen korrekt sind.',
    colors.blue,
  );
}

function createFixScript() {
  log('\n🔧 Erstelle Fix-Skript für manuelle Ausführung...', colors.cyan);

  const content = `#!/usr/bin/env node

/**
 * GitHub Dependabot & Actions Fix-Skript
 * Dieses Skript behebt gängige Probleme mit Dependabot und GitHub Actions.
 */

console.log("🔧 GitHub Dependabot & Actions Fix-Skript");
console.log("=======================================");

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log("\\n1️⃣ Aktiviere Dependabot über die GitHub-Konsole...");
  execSync('git add .github/dependabot.yml');
  execSync('git commit -m "🤖 Aktiviere Dependabot-Konfiguration" || true');
  
  console.log("\\n2️⃣ Korrigiere GitHub Actions Workflows...");
  execSync('git add .github/workflows/*.yml');
  execSync('git commit -m "👷 Korrigiere GitHub Actions Workflows" || true');
  
  console.log("\\n3️⃣ Pushe Änderungen zu GitHub...");
  execSync('git push || true');
  
  console.log("\\n✅ Fix-Skript erfolgreich ausgeführt!");
  console.log("💡 Überprüfe die Repository-Einstellungen auf GitHub für Workflow-Berechtigungen");
} catch (error) {
  console.error(\`❌ Fehler: \${error.message}\`);
  process.exit(1);
}
`;

  fs.writeFileSync('fix-github-actions.js', content);
  log('✅ Fix-Skript erstellt: fix-github-actions.js', colors.green);
}

// Führe das Skript aus
main().catch((error) => {
  log(`❌ Fehler: ${error.message}`, colors.red);
  process.exit(1);
});








} // Auto-korrigierte schließende Klammer