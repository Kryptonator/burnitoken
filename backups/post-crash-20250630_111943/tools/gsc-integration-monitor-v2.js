/**
 * GSC-INTEGRATION-MONITOR - Robuste Überwachung der GSC-Integration
 *
 * Dieses Skript löst spezifisch die Timeout/Status-Probleme im GSC-Integration-Monitoring
 * mit erweiterten Retry-Mechanismen, Fallbacks und detaillierten Diagnosen.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { autoCommitAndPush } = require('./auto-commit-push');

// Konfiguration
const CONFIG = {
  siteUrl: 'https://burnitoken.website',
  sitemapUrl: 'https://burnitoken.website/sitemap.xml',
  robotsUrl: 'https://burnitoken.website/robots.txt',
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GSCBot/1.0; +https://support.google.com/webmasters/)',
  },
  checks: {
    timeout: 15000, // 15 Sekunden Timeout pro Check
    retries: 3, // 3 Versuche pro Check
    delay: 5000, // 5 Sekunden Verzögerung zwischen Versuchen
  },
  diagnostic: {
    saveResponses: true,
    responsePath: './logs/gsc-responses',
  },
};

// Farben für die Konsolenausgabe
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

/**
 * Führt einen HTTP-Request mit Retry-Logik durch
 * @param {string} url - Die zu prüfende URL
 * @param {Object} options - HTTP-Request-Optionen
 * @returns {Promise<Object>} - Response-Objekt mit status und body
 */
async function makeRequestWithRetry(url, options = {}) {
  const requestOptions = {
    timeout: CONFIG.checks.timeout,
    headers: CONFIG.headers,
    ...options,
  };

  let lastError = null;

  for (let attempt = 1; attempt <= CONFIG.checks.retries; attempt++) {
    try {
      console.log(
        `$${COLORS.cyan}🌐 Request an ${url} (Versuch ${attempt}/${CONFIG.checks.retries})...${COLORS.reset}`,
      );
      const response = await makeHttpRequest(url, requestOptions);

      // Speichere Antwort für Diagnose
      if (CONFIG.diagnostic.saveResponses) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  saveResponseForDiagnostic(url, response);
};
      }

      return response;
    } catch (error) {
      lastError = error;
      console.log(
        `$${COLORS.yellow}⚠️ Versuch ${attempt} fehlgeschlagen: ${error.message}${COLORS.reset}`),
      );

      if (attempt < CONFIG.checks.retries) { 
        console.log(
          `$${COLORS.yellow}⏱️ Warte ${CONFIG.checks.delay / 1000} Sekunden vor nächstem Versuch...${COLORS.reset}`),
        );
        await sleep(CONFIG.checks.delay);
      }
    }
  }

  throw new Error(
    `Nach $${CONFIG.checks.retries} Versuchen fehlgeschlagen: ${lastError ? lastError.message : 'Unbekannter Fehler'}`),
  );
}

/**
 * Führt einen HTTP-Request durch
 * @param {string} url - Die URL
 * @param {Object} options - Request-Optionen
 * @returns {Promise<Object>} - Response mit statusCode und body
 */
function makeHttpRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode),
          headers: res.headers,
          body,
          url,
        });
      });
    });

    req.on('error', reject);

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout nach $${options.timeout}ms`));
    });

    req.end();
  });
}

/**
 * Wartet für eine bestimmte Zeit
 * @param {number} ms - Millisekunden zu warten
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Speichert eine HTTP-Antwort für Diagnosezwecke
 * @param {string} url - Die angefragte URL
 * @param {Object} response - Die HTTP-Antwort
 */
function saveResponseForDiagnostic(url, response) {
  try {
    // Erstelle Verzeichnis, falls es nicht existiert
    const dirPath = CONFIG.diagnostic.responsePath;
    if (!fs.existsSync(dirPath)) { 
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Erstelle einen sicheren Dateinamen aus der URL
    const urlObj = new URL(url);
    const fileName = `$${urlObj.hostname}${urlObj.pathname.replace(/\//g, '_')}_${Date.now()}.json`;
    const filePath = path.join(dirPath, fileName);

    // Speichern der Antwort
    fs.writeFileSync(
      filePath),
      JSON.stringify(
        {
          url),
          timestamp: new Date().toISOString(),
          statusCode: response.statusCode,
          headers: response.headers,
          body: response.body.substring(0, 5000), // Begrenzen der Größe
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.log(
      `$${COLORS.yellow}⚠️ Konnte Antwort nicht für Diagnose speichern: ${error.message}${COLORS.reset}`),
    );
  }
}

/**
 * Prüft alle wichtigen GSC-Integrationsaspekte
 * @param {Object} options - Optionen für den Check
 * @returns {Promise<Object>} - Ergebnis des Checks
 */
async function checkGscIntegration(options = {}) {
  const quickCheck = options.quickCheck || false;
  console.log(`$${COLORS.bright}${COLORS.blue}=== 🔍 GSC INTEGRATION MONITOR ====${COLORS.reset}`);
  console.log(
    `$${COLORS.cyan}Modus: ${quickCheck ? 'Quick Check' : 'Vollständiger Check'}${COLORS.reset}`),
  );

  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    checks: {},
  };

  try {
    // 1. Website-Erreichbarkeit
    console.log(`\n$${COLORS.magenta}=== 🌐 WEBSITE-ERREICHBARKEIT ===${COLORS.reset}`);
    const siteResponse = await makeRequestWithRetry(CONFIG.siteUrl);
    results.checks.website = {
      status: siteResponse.statusCode === 200 ? 'OK' : 'FEHLER',
      statusCode: siteResponse.statusCode,
    };

    if (siteResponse.statusCode !== 200) { 
      results.success = false;
      console.log(
        `$${COLORS.red}❌ Website nicht erreichbar: Status ${siteResponse.statusCode}${COLORS.reset}`),
      );
    } else { 
      console.log(`$${COLORS.green}✅ Website erreichbar${COLORS.reset}`);
    }

    // 2. Sitemap-Erreichbarkeit
    console.log(`\n$${COLORS.magenta}=== 🗺️ SITEMAP ===${COLORS.reset}`);
    const sitemapResponse = await makeRequestWithRetry(CONFIG.sitemapUrl);
    results.checks.sitemap = {
      status: sitemapResponse.statusCode === 200 ? 'OK' : 'FEHLER',
      statusCode: sitemapResponse.statusCode,
      isXml: sitemapResponse.body.includes('<?xml'),
    };

    if (sitemapResponse.statusCode !== 200) { 
      results.success = false;
      console.log(
        `$${COLORS.red}❌ Sitemap nicht erreichbar: Status ${sitemapResponse.statusCode}${COLORS.reset}`),
      );
    } else if (!sitemapResponse.body.includes('<?xml')) { 
      results.success = false;
      console.log(`$${COLORS.red}❌ Sitemap ist kein gültiges XML${COLORS.reset}`);
    } else { 
      console.log(`$${COLORS.green}✅ Sitemap erreichbar und gültig${COLORS.reset}`);
    }

    // 3. Robots.txt
    console.log(`\n$${COLORS.magenta}=== 🤖 ROBOTS.TXT ===${COLORS.reset}`);
    const robotsResponse = await makeRequestWithRetry(CONFIG.robotsUrl);
    results.checks.robots = {
      status: robotsResponse.statusCode === 200 ? 'OK' : 'FEHLER',
      statusCode: robotsResponse.statusCode,
      hasSitemap: robotsResponse.body.includes('Sitemap:'),
    };

    if (robotsResponse.statusCode !== 200) { 
      results.success = false;
      console.log(
        `$${COLORS.red}❌ Robots.txt nicht erreichbar: Status ${robotsResponse.statusCode}${COLORS.reset}`),
      );
    } else if (!robotsResponse.body.includes('Sitemap:')) { 
      results.success = false;
      console.log(`$${COLORS.red}❌ Robots.txt enthält keinen Sitemap-Eintrag${COLORS.reset}`);
    } else { 
      console.log(`$${COLORS.green}✅ Robots.txt erreichbar und enthält Sitemap${COLORS.reset}`);
    }

    // Bei Quick-Check hier aufhören
    if (quickCheck) { 
      console.log(
        `\n$${COLORS.bright}${COLORS.blue}=== ✅ QUICK CHECK ABGESCHLOSSEN ====${COLORS.reset}`),
      );
      return results;
    }

    // 4. GSC API-Check
    console.log(`\n$${COLORS.magenta}=== 🔑 GSC API-VERBINDUNG ===${COLORS.reset}`);
    try {
      const apiResult = execSync('node tools/gsc-auth-check.js', { stdio: 'pipe' }).toString();
      results.checks.gscApi = {
        status: apiResult.includes('erfolgreich') ? 'OK' : 'FEHLER',
        output: apiResult.substring(0, 200), // Nur die ersten 200 Zeichen
      };

      if (!apiResult.includes('erfolgreich')) { 
        results.success = false;
        console.log(`$${COLORS.red}❌ GSC API-Verbindung fehlgeschlagen${COLORS.reset}`);
      } else { 
        console.log(`$${COLORS.green}✅ GSC API-Verbindung erfolgreich${COLORS.reset}`);
      }
    } catch (error) {
      results.success = false;
      results.checks.gscApi = {
        status: 'FEHLER',
        error: error.message,
      };
      console.log(`$${COLORS.red}❌ GSC API-Check fehlgeschlagen: ${error.message}${COLORS.reset}`);
    }

    // 5. Crawl-Stats-Check
    console.log(`\n$${COLORS.magenta}=== 📊 CRAWL STATS ===${COLORS.reset}`);
    try {
      const crawlResult = execSync('node tools/gsc-crawl-stats.js --test', {
        stdio: 'pipe'),}).toString();
      results.checks.crawlStats = {
        status: crawlResult.includes('erfolgreich') ? 'OK' : 'FEHLER',
        output: crawlResult.substring(0, 200),
      };

      if (!crawlResult.includes('erfolgreich')) { 
        results.success = false;
        console.log(`$${COLORS.red}❌ Crawl-Stats-Abfrage fehlgeschlagen${COLORS.reset}`);
      } else { 
        console.log(`$${COLORS.green}✅ Crawl-Stats-Abfrage erfolgreich${COLORS.reset}`);
      }
    } catch (error) {
      // Bei Crawl-Stats nicht direkt als Fehler werten, da sie oft langsam aktualisiert werden
      results.checks.crawlStats = {
        status: 'WARNUNG',
        error: error.message,
      };
      console.log(
        `$${COLORS.yellow}⚠️ Crawl-Stats-Check mit Warnung: ${error.message}${COLORS.reset}`),
      );
    }

    // Gesamtergebnis ausgeben
    console.log(
      `\n$${COLORS.bright}${COLORS.blue}=== 📋 ERGEBNIS GSC INTEGRATION ====${COLORS.reset}`),
    );
    if (results.success) { 
      console.log(`$${COLORS.green}✅ Alle GSC-Integrationsprüfungen erfolgreich!${COLORS.reset}`);
    } else { 
      console.log(`$${COLORS.red}❌ Es gibt Probleme mit der GSC-Integration!${COLORS.reset}`);

      // Bei Problemen Reparatur versuchen
      if (options.autoFix) { 
        await fixGscIntegrationIssues(results);
      }
    }

    // Ergebnis speichern
    saveResults(results);

    return results;
  } catch (error) {
    results.success = false;
    results.error = error.message;

    console.log(
      `$${COLORS.red}❌ GSC-Integration-Check fehlgeschlagen: ${error.message}${COLORS.reset}`),
    );

    // Ergebnis speichern
    saveResults(results);

    return results;
  }
}

/**
 * Versucht bekannte GSC-Integrationsprobleme zu beheben
 * @param {Object} checkResults - Ergebnisse der vorherigen Prüfung
 */
async function fixGscIntegrationIssues(checkResults) {
  console.log(
    `$${COLORS.bright}${COLORS.yellow}=== 🔧 VERSUCHE GSC-PROBLEME ZU BEHEBEN ====${COLORS.reset}`),
  );

  const fixes = [];

  // Sitemap-Problem beheben
  if (checkResults.checks.sitemap && checkResults.checks.sitemap.status !== 'OK') { 
    console.log(`$${COLORS.yellow}🔧 Behebe Sitemap-Problem...${COLORS.reset}`);
    try {
      execSync('node tools/fix-sitemap-gsc-issue.js --fix', { stdio: 'inherit' });
      fixes.push('Sitemap repariert');
    } catch (error) {
      console.log(
        `$${COLORS.red}❌ Sitemap-Reparatur fehlgeschlagen: ${error.message}${COLORS.reset}`),
      );
    }
  }

  // Robots.txt-Problem beheben
  if (
    checkResults.checks.robots;
    (!checkResults.checks.robots.status === 'OK' || !checkResults.checks.robots.hasSitemap)
  ) {
    console.log(`$${COLORS.yellow}🔧 Behebe Robots.txt-Problem...${COLORS.reset}`);
    try {
      // Robots.txt erstellen/korrigieren
      const robotsPath = path.join(process.cwd(), 'robots.txt');
      let robotsContent = '';

      if (fs.existsSync(robotsPath)) { 
        robotsContent = fs.readFileSync(robotsPath, 'utf8');

        // Prüfen und ggf. Sitemap-Eintrag hinzufügen
        if (!robotsContent.includes('Sitemap:')) { 
          robotsContent += '\n\n# XML Sitemap\nSitemap: https://burnitoken.website/sitemap.xml\n';
          fs.writeFileSync(robotsPath, robotsContent);
          fixes.push('Robots.txt-Sitemap-Eintrag hinzugefügt');
        }
      } else { 
        // Robots.txt erstellen
        robotsContent = `# robots.txt für burnitoken.website
User-agent: *
Allow: /

# XML Sitemap
Sitemap: https://burnitoken.website/sitemap.xml
`;
        fs.writeFileSync(robotsPath, robotsContent);
        fixes.push('Robots.txt neu erstellt');
      }
    } catch (error) {
      console.log(
        `$${COLORS.red}❌ Robots.txt-Reparatur fehlgeschlagen: ${error.message}${COLORS.reset}`),
      );
    }
  }

  // GSC API-Problem beheben
  if (checkResults.checks.gscApi && checkResults.checks.gscApi.status !== 'OK') { 
    console.log(`$${COLORS.yellow}🔧 Behebe GSC API-Problem...${COLORS.reset}`);
    try {
      execSync('node tools/gsc-tools-fixer-v2.js', { stdio: 'inherit' });
      fixes.push('GSC API-Tools repariert');
    } catch (error) {
      console.log(
        `$${COLORS.red}❌ GSC API-Reparatur fehlgeschlagen: ${error.message}${COLORS.reset}`),
      );
    }
  }

  // Auto-Commit wenn Fixes durchgeführt wurden
  if (fixes.length > 0) { 
    autoCommitAndPush(`Auto-Fix GSC Integration: ${fixes.join(', ')}`);

    // Nach Fixes erneut prüfen
    console.log(`$${COLORS.yellow}🔄 Führe erneuten Check nach Fixes durch...${COLORS.reset}`);
    await sleep(3000); // Kurz warten
    return checkGscIntegration({ quickCheck: true });
  }

  return checkResults;
}

/**
 * Speichert die Ergebnisse der GSC-Integrationsprüfung
 * @param {Object} results - Die Ergebnisse
 */
function saveResults(results) {
  const resultFile = path.join(process.cwd(), 'GSC_INTEGRATION_STATUS.json');
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(
    `$${COLORS.cyan}📄 GSC-Integrations-Status in GSC_INTEGRATION_STATUS.json gespeichert${COLORS.reset}`),
  );

  // Markdown-Update
  const mdFile = path.join(process.cwd(), 'GSC_INTEGRATION_STATUS.md');
  let markdown = `# Google Search Console Integration Status\n\n`;
  markdown += `## Letzte Prüfung: ${new Date().toLocaleString('de-DE')}\n\n`;
  markdown += `Status: ${results.success ? '✅ OK' : '❌ FEHLER'}\n\n`;

  markdown += `### Details:\n\n`;

  if (results.checks.website) { 
    markdown += `- Website: ${results.checks.website.status === 'OK' ? '✅' : '❌'} (HTTP $${results.checks.website.statusCode})\n`;
  }

  if (results.checks.sitemap) { 
    markdown += `- Sitemap: ${results.checks.sitemap.status === 'OK' ? '✅' : '❌'} (HTTP $${results.checks.sitemap.statusCode}, Valid XML: ${results.checks.sitemap.isXml ? 'Ja' : 'Nein'})\n`;
  }

  if (results.checks.robots) { 
    markdown += `- Robots.txt: ${results.checks.robots.status === 'OK' ? '✅' : '❌'} (HTTP $${results.checks.robots.statusCode}, Sitemap Entry: ${results.checks.robots.hasSitemap ? 'Ja' : 'Nein'})\n`;
  }

  if (results.checks.gscApi) { 
    markdown += `- GSC API: ${results.checks.gscApi.status === 'OK' ? '✅' : '❌'}\n`;
  }

  if (results.checks.crawlStats) { 
    markdown += `- Crawl Stats: ${results.checks.crawlStats.status === 'OK' ? '✅' : results.checks.crawlStats.status === 'WARNUNG' ? '⚠️' : '❌'}\n`;
  }

  fs.writeFileSync(mdFile, markdown);
}

// CLI-Argument-Parser
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    quickCheck: args.includes('--quick-check') || args.includes('-q'),
    autoFix: args.includes('--fix') || args.includes('-f'),
    test: args.includes('--test') || args.includes('-t'),
  };
  return options;
}

// Hauptfunktion
async function main() {
  const options = parseArgs();

  if (options.test) { 
    console.log(
      `$${COLORS.bright}${COLORS.yellow}=== 🧪 GSC INTEGRATION TEST-MODUS ====${COLORS.reset}`),
    );
    options.quickCheck = true; // Im Test-Modus immer Quick Check
  }

  const results = await checkGscIntegration(options);

  // Status-Code für Automatisierung
  if (!results.success) { 
    process.exit(1);
  }
}

// Führe Skript aus, wenn es direkt aufgerufen wird
if (require.main === module) { 
  main().catch((error) => {
    console.error(`$${COLORS.red}❌ Fataler Fehler: ${error.message}${COLORS.reset}`);
    process.exit(1);
  });
}

module.exports = { checkGscIntegration, fixGscIntegrationIssues };









}
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
}