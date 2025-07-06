#!/usr/bin/env node
/**
 * 🧹 COMPLETE TRUNK.IO REMOVAL SCRIPT
 * Entfernt alle Trunk.io Referenzen, Dateien und Konfigurationen vollständig
 * Datum: Dezember 2024
 */

const fs = require('fs');
const path = require('path');

async function completeTrunkRemoval() {
  console.log('🧹 STARTING COMPLETE TRUNK.IO REMOVAL...\n');

  const results = {
    filesRemoved: [],
    configsUpdated: [],
    referencesRemoved: [],
    errors: [],
  };

  try {
    // 1. Remove trunk-initialization-monitor.js
    console.log('📁 Removing trunk-related files...');
    const trunkFiles = ['trunk-initialization-monitor.js', '.trunk', '.trunk.yaml', 'trunk.yaml'];

    for (const file of trunkFiles) {
      try {
        if (fs.existsSync) {
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
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
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
}
          if (fs.lstatSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
            console.log(`   ✅ Removed directory: ${file}`);
            results.filesRemoved.push(file);
          } else {
            fs.unlinkSync(file);
            console.log(`   ✅ Removed file: ${file}`);
            results.filesRemoved.push(file);
          }
        } else {
          console.log(`   ⚠️  File not found: ${file}`);
        }
      } catch (error) {
        console.log(`   ❌ Error removing ${file}: ${error.message}`);
        results.errors.push(`Failed to remove ${file}: ${error.message}`);
      }
    }

    // 2. Update .vscode/extensions.json
    console.log('\n🔧 Updating VS Code configuration...');
    const extensionsJsonPath = '.vscode/extensions.json';

    if (fs.existsSync(extensionsJsonPath)) {
      try {
        const extensionsContent = fs.readFileSync(extensionsJsonPath, 'utf8');
        const extensionsData = JSON.parse(extensionsContent);

        if (extensionsData.recommendations) {
          const originalLength = extensionsData.recommendations.length;
          extensionsData.recommendations = extensionsData.recommendations.filter(
            (ext) => ext !== 'trunk.io',
          );

          if (extensionsData.recommendations.length < originalLength) {
            fs.writeFileSync(extensionsJsonPath, JSON.stringify(extensionsData, null, 2));
            console.log('   ✅ Removed trunk.io from extensions.json');
            results.configsUpdated.push(extensionsJsonPath);
          } else {
            console.log('   ⚠️  trunk.io not found in extensions.json');
          }
        }
      } catch (error) {
        console.log(`   ❌ Error updating extensions.json: ${error.message}`);
        results.errors.push(`Failed to update extensions.json: ${error.message}`);
      }
    }

    // 3. Update JavaScript files with trunk references
    console.log('\n📝 Updating JavaScript files...');
    const jsFiles = [
      'advanced-extension-manager.js',
      'autonomous-extension-manager.js',
      'extension-function-validator.js',
    ];

    for (const file of jsFiles) {
      if (fs.existsSync(file)) {
        try {
          let content = fs.readFileSync(file, 'utf8');
          const originalContent = content;

          // Remove trunk.io from arrays
          content = content.replace(/['"]trunk\.io['"],?\s*/g, '');
          content = content.replace(/,\s*['"]trunk\.io['"]/g, '');
          content = content.replace(/['"]trunk\.io['"](?=\s*\])/g, '');

          // Remove trunk.io objects from configurations
          content = content.replace(/'trunk\.io':\s*\{[^}]*\},?\s*/g, '');

          // Remove trunk tests/references
          content = content.replace(/\/\/\s*Trunk\.io\s*Tests[\s\S]*?(?=\/\/|$)/g, '');
          content = content.replace(/extension:\s*['"]trunk\.io['"][^}]*}/g, '');

          // Clean up extra commas and whitespace
          content = content.replace(/,(\s*[}\]])/g, '$1');
          content = content.replace(/\[\s*,/g, '[');

          if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`   ✅ Updated ${file}`);
            results.configsUpdated.push(file);
          } else {
            console.log(`   ⚠️  No trunk references found in ${file}`);
          }
        } catch (error) {
          console.log(`   ❌ Error updating ${file}: ${error.message}`);
          results.errors.push(`Failed to update ${file}: ${error.message}`);
        }
      }
    }

    // 4. Create removal report
    console.log('\n📊 Creating removal report...');
    const removalReport = {
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      summary: {
        filesRemoved: results.filesRemoved.length,
        configsUpdated: results.configsUpdated.length,
        errorsEncountered: results.errors.length,
      },
      details: results,
      recommendations: [
        'Restart VS Code to ensure all changes take effect',
        'Run extension health check to verify removal',
        'Verify no trunk processes are running',
        'Consider alternative code quality tools if needed',
      ],
    };

    fs.writeFileSync('trunk-removal-report.json', JSON.stringify(removalReport, null, 2));
    console.log('   ✅ Report saved to trunk-removal-report.json');

    // 5. Final summary
    console.log('\n🎯 TRUNK.IO REMOVAL SUMMARY:');
    console.log('═'.repeat(50));
    console.log(`✅ Files removed: ${results.filesRemoved.length}`);
    results.filesRemoved.forEach((file) => console.log(`   - ${file}`));

    console.log(`\n✅ Configs updated: ${results.configsUpdated.length}`);
    results.configsUpdated.forEach((file) => console.log(`   - ${file}`));

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${results.errors.length}`);
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Restart VS Code');
    console.log('2. Verify no trunk.io extension is loaded');
    console.log('3. Run extension health check');
    console.log('4. Consider alternative linting tools if needed');

    console.log('\n✅ TRUNK.IO COMPLETELY REMOVED FROM PROJECT!');
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    results.errors.push(`Critical error: ${error.message}`);
  }

  return results;
}

// Ausführung
if (require.main === module) {
  completeTrunkRemoval().then((results) => {
    process.exit(results.errors.length > 0 ? 1 : 0);
  });
}

module.exports = { completeTrunkRemoval };




}
}
}
}
}
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
}
}
}