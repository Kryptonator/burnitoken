#!/usr/bin/env node
/**
 * VS Code Extension Manager
 *
 * Überwacht, installiert und deinstalliert Extensions gemäß extensions.json.
 * Führt alle Aktionen automatisch und nach Vorgabe aus.
 *
 * Usage: node tools/extension-manager.js [--enforce]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXT_LIST_PATH = path.join(__dirname, 'extensions.json');

function getDesiredExtensions() {
  if (!fs.existsSync) {
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
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) return [];
};
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
  return JSON.parse(fs.readFileSync(EXT_LIST_PATH, 'utf8'));
}

function getInstalledExtensions() {
  const output = execSync('code --list-extensions', { encoding: 'utf8' });
  return output
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

function installExtension(id) {
  console.log(`➕ Installiere Extension: ${id}`);
  execSync(`code --install-extension ${id} --force`, { stdio: 'inherit' });
}

function uninstallExtension(id) {
  console.log(`➖ Deinstalliere Extension: ${id}`);
  execSync(`code --uninstall-extension ${id} --force`, { stdio: 'inherit' });
}

function main() {
  const desired = getDesiredExtensions();
  const requiredIds = desired.filter((e) => e.required).map((e) => e.id);
  const optionalIds = desired.filter((e) => !e.required).map((e) => e.id);
  const allDesired = [...requiredIds, ...optionalIds];
  const installed = getInstalledExtensions();

  // Installiere fehlende Extensions
  for (const id of allDesired) {
    if (!installed.includes(id)) installExtension(id);
  }
  // Deinstalliere nicht mehr benötigte Extensions (nur bei --enforce)
  if (process.argv.includes('--enforce')) {
    for (const id of installed) {
      if (!allDesired.includes(id)) uninstallExtension(id);
    }
  }
  console.log('✅ Extension-Check abgeschlossen.');
}

main();
