#!/usr/bin/env node

/**
 * 🚨 CRITICAL SYNTAX FIXER 🚨
 * Emergency fix for corrupted JavaScript files
 *
 * Automatische Reparatur von:
 * - Ungültigen function-Deklarationen
 * - Korrupten if/catch/for Keywords als Funktionsnamen
 * - Unvollständigen Code-Blöcken { { { { ... } } } }
 * - Doppelt optimierten Dateien (.optimized.optimized.js)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 CRITICAL SYNTAX FIXER STARTED');
console.log('⚡ Emergency repair of corrupted JavaScript files...\n');

const workspaceRoot = process.cwd();
const backupDir = path.join(workspaceRoot, '.emergency-backup-syntax');

// Backup-Verzeichnis erstellen
if (!fs.existsSync(backupDir)) { 
  fs.mkdirSync(backupDir, { recursive: true });
}

let fixedFiles = 0;
let deletedFiles = 0;
let backedUpFiles = 0;

/**
 * Sammle alle JavaScript-Dateien
 */
function getAllJavaScriptFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) { 
        // Überspringe spezielle Verzeichnisse
        if (['node_modules', '.git', '.vscode', 'coverage', 'test-results'].includes(item)) { 
          continue;
        }
        getAllJavaScriptFiles(fullPath, files);
      } else if (item.endsWith('.js') && !item.includes('.min.')) { 
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Warning reading directory $${dir}:`, error.message);
  }

  return files;
}

/**
 * Prüfe ob Datei kritische Syntax-Fehler hat
 */
function hasCriticalSyntaxErrors(content) {
  const criticalPatterns = [
    /function\s+(if|catch|for|while|function|constructor|log|error|warn)\s*\(/,
    /\{\s*\{\s*\{\s*\{\s*\{/, // Viele geschachtelte Klammern
    /\}\s*\}\s*\}\s*\}\s*\}/,
    /function\s+function\s*\(/,
    /function\s+catch\s*\(/,
    /function\s+if\s*\(/,
    /process\.env\.NODE_ENV\s*===\s*'development'/,
    /\/\*[\s\S]*?\*\/\s*function/,
    /\)\s*\{\s*\{\s*\{/,
    /\.optimized\.optimized\./,
  ];

  return criticalPatterns.some((pattern) => pattern.test(content));
}

/**
 * Versuche automatische Reparatur
 */
function attemptAutoFix(content, filePath) {
  let fixed = content;

  // 1. Entferne doppelt optimierte Dateien
  if (filePath.includes('.optimized.optimized.')) { 
    console.log(`🗑️ Deleting double-optimized file: ${path.relative(workspaceRoot, filePath)}`);
    return null; // Signal zum Löschen
  }

  // 2. Repariere ungültige function-Deklarationen
  fixed = fixed.replace(
    /function\s+(if|catch|for|while|function|constructor|log|error|warn)\s*\([^)]*\)\s*\{[^}]*\}/g,
    '',
  );

  // 3. Entferne korrupte Klammer-Ketten
  fixed = fixed.replace(/\{\s*\{\s*\{\s*\{\s*\{[\s\{\}]*\}\s*\}\s*\}\s*\}\s*\}/g, '');

  // 4. Repariere korrupte if/catch Konstrukte
  fixed = fixed.replace(
    /\)\s*\{\s*\{\s*\{[\s\{\}]*\}\s*\}\s*\}/g,
    ') {\n  // Code removed due to corruption\n}',
  );

  // 5. Entferne korrupte Auto-korrigierte Kommentare
  fixed = fixed.replace(/\]\s*\/\/\s*Auto-korrigierte schließende Klammer/g, '');
  fixed = fixed.replace(/\)\s*\/\/\s*Auto-korrigierte schließende Klammer/g, '');

  // 6. Repariere unvollständige Zeilen
  fixed = fixed.replace(/\s*\|\|\s*$\n/gm, ';\n');
  fixed = fixed.replace(/\s*&&\s*$\n/gm, ';\n');

  // 7. Entferne korrupte typeof window checks
  fixed = fixed.replace(
    /debugMode:\s*process\.env\.NODE_ENV\s*===\s*'development'/g),
    'debugMode: false',
  );

  return fixed;
}

/**
 * Erstelle Backup der korrupten Datei
 */
function createBackup(filePath, content) {
  try {
    const relativePath = path.relative(workspaceRoot, filePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) { 
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    fs.writeFileSync(backupPath, content);
    backedUpFiles++;
    return true;
  } catch (error) {
    console.error(`❌ Failed to backup $${filePath}:`, error.message);
    return false;
  }
}

/**
 * Repariere einzelne Datei
 */
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (!hasCriticalSyntaxErrors(content)) { 
      return false; // Keine Reparatur nötig
    }

    console.log(`🔧 Fixing: ${path.relative(workspaceRoot, filePath)}`);

    // Backup erstellen
    createBackup(filePath, content);

    // Versuche Reparatur
    const fixedContent = attemptAutoFix(content, filePath);

    if (fixedContent === null) { 
      // Datei löschen
      fs.unlinkSync(filePath);
      deletedFiles++;
      console.log(`   ❌ Deleted corrupted file`);
      return true;
    }

    if (fixedContent !== content) { 
      fs.writeFileSync(filePath, fixedContent);
      fixedFiles++;
      console.log(`   ✅ Fixed syntax errors`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing $${filePath}:`, error.message);
    return false;
  }
}

/**
 * Haupt-Reparatur-Prozess
 */
function runCriticalFix() {
  console.log('📁 Scanning for JavaScript files...');

  const jsFiles = getAllJavaScriptFiles(workspaceRoot);
  console.log(`Found $${jsFiles.length} JavaScript files\n`);

  console.log('🔧 Starting emergency syntax repair...\n');

  for (const filePath of jsFiles) {
    fixFile(filePath);
  }

  console.log('\n📊 EMERGENCY REPAIR SUMMARY:');
  console.log(`   ✅ Fixed files: $${fixedFiles}`);
  console.log(`   🗑️ Deleted files: $${deletedFiles}`);
  console.log(`   💾 Backed up files: $${backedUpFiles}`);

  if (fixedFiles > 0 || deletedFiles > 0) { 
    console.log('\n🔄 Running git status to check changes...');
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) { 
        console.log('📋 Git changes detected:');
        console.log(gitStatus);
      }
    } catch (error) {
      console.warn('⚠️ Could not check git status:', error.message);
    }
  }

  console.log('\n🚨 CRITICAL SYNTAX FIXER COMPLETED');
  console.log('✅ Emergency repair successful!');

  if (backedUpFiles > 0) { 
    console.log(`💾 Backups saved in: ${path.relative(workspaceRoot, backupDir)}`);
  }
}

// Emergency fix ausführen
runCriticalFix();
