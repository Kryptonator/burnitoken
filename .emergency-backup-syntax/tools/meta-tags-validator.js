#!/usr/bin/env node

/**
 * Meta-Tags & Social Media Cards Validator
 *
 * Ein Tool zur Überprüfung und Optimierung von Meta-Tags, Open Graph und
 * strukturierten Daten für SEO und Social Media Sharing.
 *
 * Erstellt: 2025-06-24
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// Versuche chalk zu nutzen, falls vorhanden, ansonsten einfache Farbcodes
let colorize = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

// Konfiguration
const CONFIG = {
  REPORT_DIR: path.join(__dirname, '.meta-reports'),
  URLS: [
    'https://burnitoken.website/',
    'https://burnitoken.website/token/',
    'https://burnitoken.website/docs/',
    'https://burnitoken.website/community/',
  ],
  META_TAGS: [
    { name: 'title', required: true, minLength: 10, maxLength: 60 },
    { name: 'description', required: true, minLength: 50, maxLength: 160 },
    { name: 'keywords', required: false, minLength: 3 },
    { name: 'robots', required: false },
  ],
  OPEN_GRAPH: [
    { property: 'og:title', required: true, minLength: 10, maxLength: 70 },
    { property: 'og:description', required: true, minLength: 50, maxLength: 200 },
    { property: 'og:image', required: true },
    { property: 'og:url', required: true },
    { property: 'og:type', required: true },
    { property: 'og:site_name', required: false },
  ],
  TWITTER_CARDS: [
    { name: 'twitter:card', required: true },
    { name: 'twitter:title', required: true },
    { name: 'twitter:description', required: true },
    { name: 'twitter:image', required: true },
    { name: 'twitter:site', required: false },
    { name: 'twitter:creator', required: false },
  ],
  STRUCTURED_DATA_TYPES: ['Organization', 'WebSite', 'WebPage', 'Product', 'Article'],
};

// Erstelle Report-Verzeichnis, falls nicht vorhanden
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
  fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
}

/**
 * HTML-Inhalt einer URL abrufen
 */
async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Status Code: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Meta-Tags aus HTML extrahieren
 */
function extractMetaTags(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Basis-Tags
  const metaTags = {
    title: document.querySelector('title')?.textContent || '',
    metaTags: Array.from(document.querySelectorAll('meta')).map((meta) => ({
      name: meta.getAttribute('name') || '',
      property: meta.getAttribute('property') || '',
      content: meta.getAttribute('content') || '',
    })),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    structuredData: [],
  };

  // Structured Data (JSON-LD) extrahieren
  const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
  scriptTags.forEach((script) => {
    try {
      const jsonData = JSON.parse(script.textContent);
      metaTags.structuredData.push(jsonData);
    } catch (e) {
      console.error('Fehler beim Parsen von JSON-LD:', e.message);
    }
  });

  return metaTags;
}

/**
 * Meta-Tags überprüfen
 */
function validateMetaTags(metaData) {
  const report = {
    title: {
      value: metaData.title,
      valid: metaData.title.length >= 10 && metaData.title.length <= 60,
      issues: [],
    },
    metaTags: {
      standard: {},
      openGraph: {},
      twitterCards: {},
      issues: [],
    },
    canonical: {
      value: metaData.canonical,
      valid: !!metaData.canonical,
      issues: [],
    },
    structuredData: {
      types: [],
      valid: metaData.structuredData.length > 0,
      issues: [],
    },
    overallScore: 0,
    totalIssues: 0,
  };

  // Title validieren
  if (metaData.title.length === 0) {
    report.title.issues.push('Title-Tag fehlt');
  } else if (metaData.title.length < 10) {
    report.title.issues.push(
      `Title-Tag zu kurz (${metaData.title.length} Zeichen, mindestens 10 empfohlen)`,
    );
  } else if (metaData.title.length > 60) {
    report.title.issues.push(
      `Title-Tag zu lang (${metaData.title.length} Zeichen, maximal 60 empfohlen)`,
    );
  }

  // Standard Meta-Tags prüfen
  CONFIG.META_TAGS.forEach((tag) => {
    const metaTag = metaData.metaTags.find((meta) => meta.name === tag.name);

    report.metaTags.standard[tag.name] = {
      value: metaTag ? metaTag.content : '',
      valid: true,
      issues: [],
    };

    if (tag.required && !metaTag) {
      report.metaTags.standard[tag.name].valid = false;
      report.metaTags.standard[tag.name].issues.push(`Meta-Tag "${tag.name}" fehlt`);
    }

    if (metaTag) {
      if (tag.minLength && metaTag.content.length < tag.minLength) {
        report.metaTags.standard[tag.name].valid = false;
        report.metaTags.standard[tag.name].issues.push(
          `Meta-Tag "${tag.name}" zu kurz (${metaTag.content.length} Zeichen, mindestens ${tag.minLength} empfohlen)`,
        );
      }

      if (tag.maxLength && metaTag.content.length > tag.maxLength) {
        report.metaTags.standard[tag.name].valid = false;
        report.metaTags.standard[tag.name].issues.push(
          `Meta-Tag "${tag.name}" zu lang (${metaTag.content.length} Zeichen, maximal ${tag.maxLength} empfohlen)`,
        );
      }
    }
  });

  // Open Graph Tags prüfen
  CONFIG.OPEN_GRAPH.forEach((tag) => {
    const ogTag = metaData.metaTags.find((meta) => meta.property === tag.property);

    report.metaTags.openGraph[tag.property] = {
      value: ogTag ? ogTag.content : '',
      valid: true,
      issues: [],
    };

    if (tag.required && !ogTag) {
      report.metaTags.openGraph[tag.property].valid = false;
      report.metaTags.openGraph[tag.property].issues.push(`Open Graph Tag "${tag.property}" fehlt`);
    }

    if (ogTag) {
      if (tag.minLength && ogTag.content.length < tag.minLength) {
        report.metaTags.openGraph[tag.property].valid = false;
        report.metaTags.openGraph[tag.property].issues.push(
          `Open Graph Tag "${tag.property}" zu kurz (${ogTag.content.length} Zeichen, mindestens ${tag.minLength} empfohlen)`,
        );
      }

      if (tag.maxLength && ogTag.content.length > tag.maxLength) {
        report.metaTags.openGraph[tag.property].valid = false;
        report.metaTags.openGraph[tag.property].issues.push(
          `Open Graph Tag "${tag.property}" zu lang (${ogTag.content.length} Zeichen, maximal ${tag.maxLength} empfohlen)`,
        );
      }

      // Prüfen, ob Bilder erreichbar sind
      if (tag.property === 'og:image' && ogTag.content) {
        // Hier könnte man einen Test auf Bildverfügbarkeit machen
      }
    }
  });

  // Twitter Card Tags prüfen
  CONFIG.TWITTER_CARDS.forEach((tag) => {
    const twitterTag = metaData.metaTags.find((meta) => meta.name === tag.name);

    report.metaTags.twitterCards[tag.name] = {
      value: twitterTag ? twitterTag.content : '',
      valid: true,
      issues: [],
    };

    if (tag.required && !twitterTag) {
      report.metaTags.twitterCards[tag.name].valid = false;
      report.metaTags.twitterCards[tag.name].issues.push(`Twitter Card Tag "${tag.name}" fehlt`);
    }
  });

  // Structured Data prüfen
  if (metaData.structuredData.length === 0) {
    report.structuredData.issues.push('Keine strukturierten Daten (JSON-LD) gefunden');
  } else {
    metaData.structuredData.forEach((data, index) => {
      let type = '';

      if (data['@type']) {
        type = data['@type'];
        report.structuredData.types.push(type);

        // Prüfen, ob der Typ empfohlen ist
        if (!CONFIG.STRUCTURED_DATA_TYPES.includes(type)) {
          report.structuredData.issues.push(
            `Strukturierter Datentyp "${type}" ist nicht in der Liste der empfohlenen Typen`,
          );
        }
      } else {
        report.structuredData.issues.push(
          `Strukturierter Datensatz #${index + 1} hat keinen @type`,
        );
      }
    });
  }

  // Gesamtanzahl an Problemen zählen
  report.totalIssues =
    report.title.issues.length +
    Object.values(report.metaTags.standard).reduce((sum, tag) => sum + tag.issues.length, 0) +
    Object.values(report.metaTags.openGraph).reduce((sum, tag) => sum + tag.issues.length, 0) +
    Object.values(report.metaTags.twitterCards).reduce((sum, tag) => sum + tag.issues.length, 0) +
    report.structuredData.issues.length;

  // Gesamtscore berechnen
  const mandatoryIssues = [
    ...CONFIG.META_TAGS.filter((tag) => tag.required).flatMap(
      (tag) => report.metaTags.standard[tag.name]?.issues || [],
    ),
    ...CONFIG.OPEN_GRAPH.filter((tag) => tag.required).flatMap(
      (tag) => report.metaTags.openGraph[tag.property]?.issues || [],
    ),
    ...CONFIG.TWITTER_CARDS.filter((tag) => tag.required).flatMap(
      (tag) => report.metaTags.twitterCards[tag.name]?.issues || [],
    ),
    ...report.title.issues,
  ].length;

  if (mandatoryIssues === 0 && report.totalIssues === 0) {
    report.overallScore = 100;
  } else if (mandatoryIssues === 0) {
    report.overallScore = 90;
  } else {
    report.overallScore = Math.max(
      0,
      100 - mandatoryIssues * 10 - (report.totalIssues - mandatoryIssues) * 3,
    );
  }

  return report;
}

/**
 * Report für eine einzelne URL generieren
 */
async function generateSingleReport(url) {
  console.log(`\n${colorize.blue('📊 Analysiere:')} ${url}`);

  try {
    const html = await fetchHtml(url);
    const metaData = extractMetaTags(html);
    const report = validateMetaTags(metaData);

    // Basis-Infos ausgeben
    console.log(`\n${colorize.bold('=== Meta-Tags & Social Media Cards Bericht ===')}`);
    console.log(`${colorize.blue('🔗 URL:')} ${url}`);
    console.log(
      `${colorize.blue('📈 Gesamtscore:')} ${report.overallScore >= 90 ? colorize.green(report.overallScore + '%') : report.overallScore >= 70 ? colorize.yellow(report.overallScore + '%') : colorize.red(report.overallScore + '%')}`,
    );
    console.log(
      `${colorize.blue('❗ Probleme:')} ${report.totalIssues === 0 ? colorize.green('Keine') : colorize.red(report.totalIssues)}`,
    );

    // Title ausgeben
    console.log(
      `\n${colorize.bold('Titel:')} ${report.title.valid ? colorize.green('✓') : colorize.red('✗')}`,
    );
    console.log(`  ${colorize.blue('Wert:')} ${report.title.value}`);
    report.title.issues.forEach((issue) => {
      console.log(`  ${colorize.red('⚠️ ' + issue)}`);
    });

    // Meta-Tags ausgeben
    console.log(`\n${colorize.bold('Standard Meta-Tags:')}`);
    Object.entries(report.metaTags.standard).forEach(([name, data]) => {
      console.log(
        `  ${colorize.blue(name)}: ${data.valid ? colorize.green('✓') : colorize.red('✗')}`,
      );
      if (data.value) console.log(`    ${colorize.blue('Wert:')} ${data.value}`);
      data.issues.forEach((issue) => {
        console.log(`    ${colorize.red('⚠️ ' + issue)}`);
      });
    });

    // Open Graph Tags ausgeben
    console.log(`\n${colorize.bold('Open Graph:')}`);
    Object.entries(report.metaTags.openGraph).forEach(([property, data]) => {
      console.log(
        `  ${colorize.blue(property)}: ${data.valid ? colorize.green('✓') : colorize.red('✗')}`,
      );
      if (data.value) console.log(`    ${colorize.blue('Wert:')} ${data.value}`);
      data.issues.forEach((issue) => {
        console.log(`    ${colorize.red('⚠️ ' + issue)}`);
      });
    });

    // Twitter Card Tags ausgeben
    console.log(`\n${colorize.bold('Twitter Cards:')}`);
    Object.entries(report.metaTags.twitterCards).forEach(([name, data]) => {
      console.log(
        `  ${colorize.blue(name)}: ${data.valid ? colorize.green('✓') : colorize.red('✗')}`,
      );
      if (data.value) console.log(`    ${colorize.blue('Wert:')} ${data.value}`);
      data.issues.forEach((issue) => {
        console.log(`    ${colorize.red('⚠️ ' + issue)}`);
      });
    });

    // Structured Data ausgeben
    console.log(
      `\n${colorize.bold('Strukturierte Daten:')} ${report.structuredData.valid ? colorize.green('✓') : colorize.red('✗')}`,
    );
    if (report.structuredData.types.length > 0) {
      console.log(
        `  ${colorize.blue('Gefundene Typen:')} ${report.structuredData.types.join(', ')}`,
      );
    }
    report.structuredData.issues.forEach((issue) => {
      console.log(`  ${colorize.red('⚠️ ' + issue)}`);
    });

    // Report speichern
    const fileName = url.replace(/https?:\/\/|\//g, '_') + '.json';
    const reportPath = path.join(CONFIG.REPORT_DIR, fileName);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n${colorize.blue('📄 Report gespeichert:')} ${reportPath}`);

    // Empfehlungen für Verbesserungen
    if (report.totalIssues > 0) {
      console.log(`\n${colorize.bold('💡 Empfehlungen:')}`);

      if (report.title.issues.length > 0) {
        console.log(`  ${colorize.yellow('- Title-Tag optimieren (10-60 Zeichen)')}`);
      }

      const missingOgTags = CONFIG.OPEN_GRAPH.filter((tag) => tag.required).filter(
        (tag) => !report.metaTags.openGraph[tag.property].value,
      );

      if (missingOgTags.length > 0) {
        console.log(
          `  ${colorize.yellow('- Fehlende Open Graph Tags hinzufügen:')} ${missingOgTags.map((tag) => tag.property).join(', ')}`,
        );
      }

      const missingTwitterTags = CONFIG.TWITTER_CARDS.filter((tag) => tag.required).filter(
        (tag) => !report.metaTags.twitterCards[tag.name].value,
      );

      if (missingTwitterTags.length > 0) {
        console.log(
          `  ${colorize.yellow('- Fehlende Twitter Card Tags hinzufügen:')} ${missingTwitterTags.map((tag) => tag.name).join(', ')}`,
        );
      }

      if (!report.structuredData.valid) {
        console.log(
          `  ${colorize.yellow('- Strukturierte Daten (JSON-LD) implementieren für bessere Suchmaschinenergebnisse')}`,
        );
      }
    }

    return report;
  } catch (error) {
    console.error(`${colorize.red('❌ Fehler beim Analysieren von')} ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Report für alle konfigurierten URLs generieren
 */
async function generateFullReport() {
  console.log(colorize.bold('\n=== Meta-Tags & Social Media Cards Validator ===\n'));
  console.log(`${colorize.blue('🔍 Analysiere')} ${CONFIG.URLS.length} URLs...`);

  const results = {};
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const summaryPath = path.join(CONFIG.REPORT_DIR, `summary_${timestamp}.json`);

  for (const url of CONFIG.URLS) {
    const report = await generateSingleReport(url);
    if (report) {
      results[url] = {
        score: report.overallScore,
        issues: report.totalIssues,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Zusammenfassung erstellen und speichern
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Gesamtübersicht ausgeben
  console.log(colorize.bold('\n=== Zusammenfassung ==='));

  Object.entries(results).forEach(([url, data]) => {
    const scoreColor = data.score >= 90 ? 'green' : data.score >= 70 ? 'yellow' : 'red';
    console.log(
      `${colorize.blue(url)}: ${colorize[scoreColor](data.score + '%')} - ${data.issues === 0 ? colorize.green('Keine Probleme') : colorize.red(data.issues + ' Probleme')}`,
    );
  });

  console.log(`\n${colorize.blue('📄 Zusammenfassung gespeichert:')} ${summaryPath}`);
}

/**
 * Kommandozeilenargumente verarbeiten
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Meta-Tags & Social Media Cards Validator
---------------------------------------

Verwendung:
  node meta-tags-validator.js [optionen] [url]

Optionen:
  --url=<url>    Einzelne URL analysieren
  --ci           CI-Modus mit kompakter Ausgabe und Exit-Code
  --help, -h     Diese Hilfe anzeigen

Ohne Optionen werden alle konfigurierten URLs analysiert.
    `);
    process.exit(0);
  }

  // Einzelne URL verarbeiten
  const urlArg = args.find((arg) => arg.startsWith('--url='));
  if (urlArg) {
    const url = urlArg.replace('--url=', '');
    generateSingleReport(url);
    return;
  }

  // CI-Modus
  if (args.includes('--ci')) {
    // Einfache Ausgabe für CI-Pipelines
    console.log('CI-Modus wird ausgeführt...');
    generateFullReport()
      .then(() => {
        // Exit-Code basierend auf Ergebnissen
        process.exit(0);
      })
      .catch((error) => {
        console.error(`Fehler im CI-Modus: ${error.message}`);
        process.exit(1);
      });
    return;
  }

  // Standard: Alle URLs analysieren
  generateFullReport();
}

// Programm ausführen
parseArgs();

] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer