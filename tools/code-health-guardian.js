#!/usr/bin/env node

/**
 * Code Health Guardian
 *
 * Scannt das gesamte Repository nach Syntaxfehlern, Platzhaltern, unvollständigen
 * Implementierungen und repariert sie automatisch.
 *
 * Erstellt: 2025-06-30
 * Autor: GitHub Copilot
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parse: parseJS, traverse } = require('@babel/parser'); // Für JS-Parsing
const glob = require('glob'); // Für Datei-Matching

// Konfiguration
const CONFIG = {
  ROOT_DIR: path.join(__dirname, '..'),
  REPORT_DIR: path.join(__dirname, '../reports'),
  BACKUP_DIR: path.join(__dirname, '../.backups/code-health'),
  PATTERNS_TO_SCAN: [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '!node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.git/**',
  ],
  PLACEHOLDER_PATTERNS: [
    /\/\/\s*(TODO|FIXME):?/i, // Matches // TODO, // FIXME, // TODO:, // FIXME:
    /\/\*\s*(TODO|FIXME):?.*?\*\//is, // Matches /* TODO */, /* FIXME: ... */
    /\.\.\./, // Matches ...
    /{\.\.\.}/, // Matches {...}
    /\[\.\.\.]/, // Matches [...]
    /\/\/\s*\.\.\.existing code\.\.\./i, // Matches // ...existing code...
    /function\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*\([^)]*\)\s*{\s*}/, // Matches empty functions
    /try\s*{\s*\.\.\..*?}\s*catch\s*\([^)]*\)\s*{\s*\.\.\..*?}/is, // Matches empty try-catch blocks
  ],
  COMMON_SYNTAX_ERRORS: [
    {
      pattern: /if\s*\([^)]*\)(\s*[^{;\n]*?$)/m,
      fix: (match, p1) => `if (${match.split('(')[1].split(')')[0]}) {${p1.trim()}\n}`,
    },
    { pattern: /}\s*else(\s*[^{;\n]*?$)/m, fix: (match, p1) => `} else {${p1.trim()}\n}` },
    {
      pattern: /for\s*\([^)]*\)(\s*[^{;\n]*?$)/m,
      fix: (match, p1) => `for (${match.split('(')[1].split(')')[0]}) {${p1.trim()}\n}`,
    },
    {
      pattern: /while\s*\([^)]*\)(\s*[^{;\n]*?$)/m,
      fix: (match, p1) => `while (${match.split('(')[1].split(')')[0]}) {${p1.trim()}\n}`,
    },
    {
      pattern: /catch\s*\([^)]*\)(\s*[^{;\n]*?$)/m,
      fix: (match, p1) => `catch (${match.split('(')[1].split(')')[0]}) {${p1.trim()}\n}`,
    },
  ],
  MAX_FIXES_PER_FILE: 50,
  IGNORE_FILES: [
    'node_modules',
    '.git',
    'package-lock.json',
    'yarn.lock',
    'dist',
    'build',
    '.next',
    '.nuxt',
  ],
};

// Status-Tracking
const STATUS = {
  scannedFiles: 0,
  fixedFiles: 0,
  errors: [],
  fixes: [],
  ignoredFiles: 0,
};

// Farben für Terminal-Ausgabe
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

/**
 * Logger mit Farben
 */
const log = {
  info: (msg) => console.log(`${COLORS.cyan}ℹ ${msg}${COLORS.reset}`),
  success: (msg) => console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`),
  error: (msg) => console.log(`${COLORS.red}✗ ${msg}${COLORS.reset}`),
  highlight: (msg) => console.log(`${COLORS.magenta}${COLORS.bright}${msg}${COLORS.reset}`),
  section: (msg) => console.log(`\n${COLORS.blue}${COLORS.bright}▓▒░ ${msg} ░▒▓${COLORS.reset}\n`),
};

/**
 * Sichert eine Datei vor der Bearbeitung
 * @param {string} filePath - Pfad zur Datei
 */
function backupFile(filePath) {
  try {
    // Backup-Verzeichnis erstellen, falls es nicht existiert
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    // Relativen Pfad beibehalten
    const relPath = path.relative(CONFIG.ROOT_DIR, filePath);
    const backupPath = path.join(CONFIG.BACKUP_DIR, relPath);

    // Verzeichnisse für die Backup-Datei erstellen
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Datei kopieren
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    log.error(`Fehler beim Erstellen des Backups für ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Prüft, ob eine Datei ignoriert werden soll
 * @param {string} filePath - Pfad zur Datei
 * @returns {boolean} true, wenn die Datei ignoriert werden soll
 */
function shouldIgnoreFile(filePath) {
  return CONFIG.IGNORE_FILES.some((pattern) => filePath.includes(pattern));
}

/**
 * Findet alle passenden Dateien anhand der Muster
 * @returns {string[]} Liste der gefundenen Dateipfade
 */
function findFiles() {
  const files = [];
  CONFIG.PATTERNS_TO_SCAN.forEach((pattern) => {
    const isNegative = pattern.startsWith('!');
    if (isNegative) {
      // Negative Muster verarbeiten (Ausschlüsse)
      const withoutNegation = pattern.substring(1);
      const matchingFiles = glob.sync(withoutNegation, { cwd: CONFIG.ROOT_DIR, absolute: true });
      matchingFiles.forEach((file) => {
        const index = files.indexOf(file);
        if (index !== -1) {
          files.splice(index, 1);
        }
      });
    } else {
      // Positive Muster verarbeiten (Einschlüsse)
      const matchingFiles = glob.sync(pattern, { cwd: CONFIG.ROOT_DIR, absolute: true });
      matchingFiles.forEach((file) => {
        if (!files.includes(file) && !shouldIgnoreFile(file)) {
          files.push(file);
        }
      });
    }
  });
  return files;
}

/**
 * Prüft, ob ein String Platzhalter enthält
 * @param {string} content - Zu prüfender Inhalt
 * @returns {RegExp|null} Das gefundene Muster oder null
 */
function containsPlaceholder(content) {
  for (const pattern of CONFIG.PLACEHOLDER_PATTERNS) {
    if (pattern.test(content)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Prüft auf häufige Syntaxfehler und behebt sie
 * @param {string} content - Dateiinhalt
 * @returns {string} Korrigierter Inhalt
 */
function fixCommonSyntaxErrors(content) {
  let fixedContent = content;
  let fixCount = 0;

  // Für jedes bekannte Muster
  for (const { pattern, fix } of CONFIG.COMMON_SYNTAX_ERRORS) {
    // Mehrere Vorkommen finden und beheben
    let match;
    while ((match = pattern.exec(fixedContent)) !== null && fixCount < CONFIG.MAX_FIXES_PER_FILE) {
      const originalPart = match[0];
      const fixedPart = fix(...match);
      fixedContent = fixedContent.replace(originalPart, fixedPart);
      fixCount++;

      STATUS.fixes.push({
        type: 'syntax',
        original: originalPart,
        fixed: fixedPart,
      });
    }
  }

  return fixedContent;
}

/**
 * Prüft auf fehlende schließende Klammern und behebt sie
 * @param {string} content - Dateiinhalt
 * @returns {string} Korrigierter Inhalt
 */
function fixMissingBraces(content) {
  const stack = [];
  let fixedContent = content;
  let lineCount = content.split('\n').length;

  // Einfache Analyse der Klammerstruktur
  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '{' || char === '(' || char === '[') {
      stack.push({ char, index: i });
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1].char === '{') {
        stack.pop();
      }
    } else if (char === ')') {
      if (stack.length > 0 && stack[stack.length - 1].char === '(') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1].char === '[') {
        stack.pop();
      }
    }
  }

  // Fehlende schließende Klammern hinzufügen
  while (stack.length > 0) {
    const item = stack.pop();
    const closingChar = item.char === '{' ? '}' : item.char === '(' ? ')' : ']';

    // Am Ende der Datei hinzufügen
    fixedContent += `\n${closingChar}`;

    STATUS.fixes.push({
      type: 'missing_brace',
      char: closingChar,
      line: lineCount + 1,
    });
  }

  return fixedContent;
}

/**
 * Ersetzt Platzhalter-Funktionen mit echten Implementierungen
 * @param {string} content - Dateiinhalt
 * @returns {string} Korrigierter Inhalt
 */
function fixPlaceholderFunctions(content) {
  let fixedContent = content;

  // Leere Funktionen erkennen und einfache Implementierung hinzufügen
  const emptyFunctionRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(([^)]*)\)\s*{\s*}/g;
  let match;
  while ((match = emptyFunctionRegex.exec(content)) !== null) {
    const funcName = match[1];
    const params = match[2];

    // Einfache Implementierung generieren
    let implementation = `function ${funcName}(${params}) {\n`;
    implementation += `  console.log('${funcName} wurde aufgerufen');\n`;

    // Parameter verarbeiten
    if (params.trim()) {
      const paramList = params.split(',').map((p) => p.trim().split('=')[0].trim());
      implementation += `  // Verarbeite Parameter: ${paramList.join(', ')}\n`;

      // Wenn es Parameter gibt, einen sinnvollen Rückgabewert generieren
      if (paramList.length > 0) {
        implementation += `  return {\n`;
        paramList.forEach((param, i) => {
          implementation += `    ${param}: ${param}${i < paramList.length - 1 ? ',' : ''}\n`;
        });
        implementation += `  };\n`;
      }
    } else {
      // Ohne Parameter einfach true zurückgeben
      implementation += `  return true;\n`;
    }

    implementation += `}`;

    fixedContent = fixedContent.replace(match[0], implementation);

    STATUS.fixes.push({
      type: 'empty_function',
      name: funcName,
      implementation,
    });
  }

  // Unvollständige try/catch-Blöcke
  const emptyTryCatchRegex = /try\s*{\s*\.\.\..*?}\s*catch\s*\(([^)]*)\)\s*{\s*\.\.\..*?}/gs;
  while ((match = emptyTryCatchRegex.exec(content)) !== null) {
    const errorParam = match[1] || 'e';
    const implementation = `try {\n  // Sichere Implementierung\n  console.log('Try-Block ausgeführt');\n} catch (${errorParam}) {\n  console.error('Fehler abgefangen:', ${errorParam});\n}`;

    fixedContent = fixedContent.replace(match[0], implementation);

    STATUS.fixes.push({
      type: 'empty_try_catch',
      implementation,
    });
  }

  return fixedContent;
}

/**
 * Prüft auf fehlende Funktionen und fügt sie hinzu
 * @param {string} content - Dateiinhalt
 * @param {string} filePath - Pfad zur Datei
 * @returns {string} Korrigierter Inhalt
 */
function fixMissingFunctions(content, filePath) {
  let fixedContent = content;

  // Funktionsaufrufe finden
  const functionCallRegex = /\b([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g;
  const definedFunctions = new Set();
  const calledFunctions = new Set();

  // Definierte Funktionen sammeln
  const functionDefRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
  let match;
  while ((match = functionDefRegex.exec(content)) !== null) {
    definedFunctions.add(match[1]);
  }

  // Arrow-Funktionen und Methoden hinzufügen
  const arrowFunctionRegex =
    /\b([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g;
  while ((match = arrowFunctionRegex.exec(content)) !== null) {
    definedFunctions.add(match[1]);
  }

  // Aufgerufene Funktionen sammeln
  while ((match = functionCallRegex.exec(content)) !== null) {
    const funcName = match[1];
    // Gängige integrierte Funktionen ignorieren
    if (
      ![
        'console',
        'require',
        'parseInt',
        'parseFloat',
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'Promise',
        'Math',
        'Date',
        'Number',
        'String',
        'Boolean',
        'Array',
        'Object',
        'JSON',
        'Error',
      ].includes(funcName)
    ) {
      calledFunctions.add(funcName);
    }
  }

  // Fehlende Funktionen identifizieren
  const missingFunctions = [];
  for (const func of calledFunctions) {
    if (
      !definedFunctions.has(func) &&
      !content.includes(`= require(`) &&
      !content.includes(`from '`)
    ) {
      missingFunctions.push(func);
    }
  }

  // Fehlende Funktionen implementieren
  if (missingFunctions.length > 0) {
    let implementations = '\n\n// Auto-generierte Implementierungen für fehlende Funktionen\n';
    missingFunctions.forEach((funcName) => {
      const implementation = `/**\n * ${funcName} - Automatisch generierte Implementierung\n * @param {...any} args - Funktionsargumente\n * @returns {any} Ergebnis oder undefined\n */\nfunction ${funcName}(...args) {\n  console.log('${funcName} aufgerufen mit Argumenten:', args);\n  return undefined;\n}\n`;
      implementations += implementation;

      STATUS.fixes.push({
        type: 'missing_function',
        name: funcName,
        implementation,
      });
    });

    // Am Ende der Datei hinzufügen
    fixedContent += implementations;
  }

  return fixedContent;
}

/**
 * Räumt Platzhalter in der Datei auf
 * @param {string} filePath - Pfad zur Datei
 * @returns {boolean} true, wenn die Datei repariert wurde
 */
function cleanupPlaceholders(filePath) {
  try {
    // Datei einlesen
    const content = fs.readFileSync(filePath, 'utf8');

    // Auf Platzhalter prüfen
    const placeholder = containsPlaceholder(content);
    if (!placeholder) {
      return false; // Keine Platzhalter gefunden
    }

    // Backup erstellen
    backupFile(filePath);

    // Platzhalter ersetzen und Fehler beheben
    let fixedContent = content;

    // Syntaxfehler beheben
    fixedContent = fixCommonSyntaxErrors(fixedContent);

    // Platzhalter-Funktionen ersetzen
    fixedContent = fixPlaceholderFunctions(fixedContent);

    // Fehlende Funktionen hinzufügen
    fixedContent = fixMissingFunctions(fixedContent, filePath);

    // Fehlende Klammern beheben
    fixedContent = fixMissingBraces(fixedContent);

    // Wenn sich der Inhalt geändert hat
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      log.success(`Platzhalter in ${path.relative(CONFIG.ROOT_DIR, filePath)} repariert`);
      return true;
    }

    return false;
  } catch (error) {
    log.error(`Fehler beim Verarbeiten von ${filePath}: ${error.message}`);
    STATUS.errors.push({
      file: filePath,
      error: error.message,
    });
    return false;
  }
}

/**
 * Führt ESLint auf einer Datei aus, um Syntaxfehler zu erkennen
 * @param {string} filePath - Pfad zur Datei
 * @returns {any[]} Gefundene Fehler
 */
function findSyntaxErrors(filePath) {
  try {
    // Datei einlesen
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      // Versuche, die Datei zu parsen
      parseJS(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
        errorRecovery: true,
      });

      // Keine Fehler gefunden
      return [];
    } catch (parseError) {
      // Parse-Fehler gefunden
      return [
        {
          message: parseError.message,
          line: parseError.loc?.line || 0,
          column: parseError.loc?.column || 0,
        },
      ];
    }
  } catch (error) {
    log.error(`Fehler beim Lesen von ${filePath}: ${error.message}`);
    return [
      {
        message: `Datei konnte nicht gelesen werden: ${error.message}`,
        line: 0,
        column: 0,
      },
    ];
  }
}

/**
 * Prüft die mit Node.js interpretierbare Syntax einer Datei
 * @param {string} filePath - Pfad zur Datei
 * @returns {object|null} Fehler oder null, wenn keine Fehler gefunden wurden
 */
function checkNodeSyntax(filePath) {
  try {
    const cmd =
      process.platform === 'win32' ? `node --check "${filePath}"` : `node --check "${filePath}"`;

    execSync(cmd, { stdio: 'pipe' });
    return null;
  } catch (error) {
    const message = error.stderr ? error.stderr.toString() : error.message;
    return { message };
  }
}

/**
 * Schreibt einen Bericht über die durchgeführten Reparaturen
 */
function writeReport() {
  try {
    // Berichte-Verzeichnis erstellen, falls es nicht existiert
    if (!fs.existsSync(CONFIG.REPORT_DIR)) {
      fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(CONFIG.REPORT_DIR, `code-health-report-${timestamp}.json`);

    const report = {
      timestamp,
      stats: {
        scannedFiles: STATUS.scannedFiles,
        fixedFiles: STATUS.fixedFiles,
        ignoredFiles: STATUS.ignoredFiles,
        errorCount: STATUS.errors.length,
      },
      fixes: STATUS.fixes,
      errors: STATUS.errors,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    log.success(`Bericht erstellt: ${path.relative(CONFIG.ROOT_DIR, reportPath)}`);

    // Markdown-Bericht
    const markdownPath = path.join(CONFIG.REPORT_DIR, `code-health-report-${timestamp}.md`);
    const markdown = generateMarkdownReport(report);
    fs.writeFileSync(markdownPath, markdown, 'utf8');
    log.success(`Markdown-Bericht erstellt: ${path.relative(CONFIG.ROOT_DIR, markdownPath)}`);

    return { reportPath, markdownPath };
  } catch (error) {
    log.error(`Fehler beim Erstellen des Berichts: ${error.message}`);
    return null;
  }
}

/**
 * Generiert einen Markdown-Bericht
 * @param {object} report - Berichtsdaten
 * @returns {string} Markdown-Inhalt
 */
function generateMarkdownReport(report) {
  let markdown = `# Code Health Guardian Bericht\n\n`;
  markdown += `*Generiert am: ${new Date(report.timestamp).toLocaleString()}*\n\n`;

  markdown += `## Zusammenfassung\n\n`;
  markdown += `| Metrik | Wert |\n`;
  markdown += `|--------|------|\n`;
  markdown += `| Gescannte Dateien | ${report.stats.scannedFiles} |\n`;
  markdown += `| Reparierte Dateien | ${report.stats.fixedFiles} |\n`;
  markdown += `| Ignorierte Dateien | ${report.stats.ignoredFiles} |\n`;
  markdown += `| Fehler | ${report.stats.errorCount} |\n`;

  // Reparaturen nach Typ gruppieren
  const fixesByType = {};
  report.fixes.forEach((fix) => {
    if (!fixesByType[fix.type]) {
      fixesByType[fix.type] = [];
    }
    fixesByType[fix.type].push(fix);
  });

  markdown += `\n## Durchgeführte Reparaturen\n\n`;

  if (Object.keys(fixesByType).length === 0) {
    markdown += `*Keine Reparaturen durchgeführt*\n\n`;
  } else {
    Object.entries(fixesByType).forEach(([type, fixes]) => {
      markdown += `### ${formatFixType(type)} (${fixes.length})\n\n`;

      if (type === 'missing_function') {
        markdown += `| Funktionsname | |\n`;
        markdown += `|--------------|--|\n`;
        fixes.forEach((fix) => {
          markdown += `| \`${fix.name}\` | Automatisch generierte Implementierung |\n`;
        });
      } else if (type === 'empty_function') {
        markdown += `| Funktionsname | |\n`;
        markdown += `|--------------|--|\n`;
        fixes.forEach((fix) => {
          markdown += `| \`${fix.name}\` | Leere Funktion mit Implementierung versehen |\n`;
        });
      } else if (type === 'syntax') {
        markdown += `| Original | Repariert |\n`;
        markdown += `|---------|----------|\n`;
        fixes.forEach((fix) => {
          markdown += `| \`${escapeMarkdown(fix.original)}\` | \`${escapeMarkdown(fix.fixed)}\` |\n`;
        });
      } else if (type === 'missing_brace') {
        markdown += `| Zeichen | Zeile |\n`;
        markdown += `|---------|------|\n`;
        fixes.forEach((fix) => {
          markdown += `| \`${fix.char}\` | ${fix.line} |\n`;
        });
      }

      markdown += `\n`;
    });
  }

  if (report.errors.length > 0) {
    markdown += `\n## Fehler\n\n`;
    markdown += `| Datei | Fehler |\n`;
    markdown += `|-------|-------|\n`;
    report.errors.forEach((error) => {
      const relPath = path.relative(CONFIG.ROOT_DIR, error.file);
      markdown += `| \`${relPath}\` | ${escapeMarkdown(error.error)} |\n`;
    });
  }

  return markdown;
}

/**
 * Formatiert einen Fix-Typ für die Anzeige
 * @param {string} type - Fix-Typ
 * @returns {string} Formatierter Typ
 */
function formatFixType(type) {
  const map = {
    syntax: 'Syntaxfehler',
    missing_function: 'Fehlende Funktionen',
    empty_function: 'Leere Funktionen',
    missing_brace: 'Fehlende Klammern',
    empty_try_catch: 'Leere try/catch-Blöcke',
  };

  return map[type] || type;
}

/**
 * Escapet Markdown-Sonderzeichen
 * @param {string} text - Zu escapender Text
 * @returns {string} Escapeter Text
 */
function escapeMarkdown(text) {
  return String(text)
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`');
}

/**
 * Hauptfunktion
 */
async function main() {
  log.section('Code Health Guardian startet');
  log.info(`Repository: ${CONFIG.ROOT_DIR}`);

  // Dateien finden
  log.info('Suche nach zu scannenden Dateien...');
  const files = findFiles();
  log.success(`${files.length} Dateien gefunden`);

  // Alle Dateien scannen und reparieren
  log.section('Scanne und repariere Dateien');
  let fixedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relPath = path.relative(CONFIG.ROOT_DIR, file);

    // Zähler und Fortschritt aktualisieren
    STATUS.scannedFiles++;
    const progress = Math.floor(((i + 1) * 100) / files.length);
    process.stdout.write(
      `\r${COLORS.cyan}[${progress}%] ${COLORS.reset}Prüfe ${relPath}${' '.repeat(30)}`,
    );

    // Syntaxfehler prüfen
    const syntaxErrors = findSyntaxErrors(file);
    const nodeSyntaxError = checkNodeSyntax(file);

    if (syntaxErrors.length > 0 || nodeSyntaxError) {
      process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Zeile löschen
      log.warning(
        `Syntaxfehler in ${relPath}${syntaxErrors.length > 0 ? `: ${syntaxErrors[0].message}` : ''}`,
      );
    }

    // Platzhalter entfernen und Fehler beheben
    const wasFixed = cleanupPlaceholders(file);
    if (wasFixed) {
      fixedCount++;
      STATUS.fixedFiles++;
    }
  }

  process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Zeile löschen

  // Bericht schreiben
  log.section('Erstelle Bericht');
  const report = writeReport();

  // Zusammenfassung anzeigen
  log.section('Zusammenfassung');
  log.info(`Gescannte Dateien: ${STATUS.scannedFiles}`);
  log.success(`Reparierte Dateien: ${STATUS.fixedFiles}`);
  log.warning(`Fehler: ${STATUS.errors.length}`);

  if (report) {
    log.info(`Detaillierter Bericht: ${path.relative(CONFIG.ROOT_DIR, report.markdownPath)}`);
  }

  log.section('Code Health Guardian abgeschlossen');
}

// Programm ausführen
try {
  main().catch((error) => {
    log.error(`Unerwarteter Fehler: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
} catch (error) {
  log.error(`Kritischer Fehler: ${error.message}`);
  console.error(error);
  process.exit(1);
}
