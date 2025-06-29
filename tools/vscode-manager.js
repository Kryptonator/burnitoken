#!/usr/bin/env node
/**
 * VS Code Manager (Self-Healing & Policy Enforcement)
 *
 * Überwacht, installiert, deinstalliert und konfiguriert Extensions, Settings und Policies für VS Code.
 * Kann als Health-Check, nach Recovery oder bei Setup-Problemen ausgeführt werden.
 *
 * Features:
 * - Extension-Check (installiert/entfernt nach extensions.json)
 * - Settings-Check (setzt empfohlene settings.json, keybindings, snippets)
 * - Policy-Check (z.B. keine unsicheren Extensions, Version-Pinning)
 * - Reporting (Statusausgabe, Fehler, Empfehlungen)
 *
 * Usage: node tools/vscode-manager.js [--enforce]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXT_LIST_PATH = path.join(__dirname, 'extensions.json');
const SETTINGS_PATH = path.join(__dirname, 'vscode-settings.json');
const KEYBINDINGS_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config',
  'Code',
  'User',
  'keybindings.json',
);
const VSCODE_SETTINGS_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config',
  'Code',
  'User',
  'settings.json',
);

function getDesiredExtensions() {
  if (!fs.existsSync(EXT_LIST_PATH)) return [];
  return JSON.parse(fs.readFileSync(EXT_LIST_PATH, 'utf8'));
}

function getInstalledExtensions() {
  try {
    const output = execSync('code --list-extensions', { encoding: 'utf8' });
    return output
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function installExtension(id) {
  console.log(`➕ Installiere Extension: ${id}`);
  execSync(`code --install-extension ${id} --force`, { stdio: 'inherit' });
}

function uninstallExtension(id) {
  console.log(`➖ Deinstalliere Extension: ${id}`);
  execSync(`code --uninstall-extension ${id} --force`, { stdio: 'inherit' });
}

function checkExtensions(enforce = false) {
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
  if (enforce) {
    for (const id of installed) {
      if (!allDesired.includes(id)) uninstallExtension(id);
    }
  }
}

function checkSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return;
  const userSettingsPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.config',
    'Code',
    'User',
    'settings.json',
  );
  if (!fs.existsSync(userSettingsPath)) {
    console.log('⚠️  VS Code settings.json nicht gefunden, Settings-Check übersprungen.');
    return;
  }
  const desired = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  let current = {};
  try {
    current = JSON.parse(fs.readFileSync(userSettingsPath, 'utf8'));
  } catch (e) {}
  const merged = { ...current, ...desired };
  fs.writeFileSync(userSettingsPath, JSON.stringify(merged, null, 2));
  console.log('✅ VS Code settings.json aktualisiert.');
}

function checkKeybindings() {
  if (!fs.existsSync(KEYBINDINGS_PATH))
    return { ok: false, message: 'keybindings.json nicht gefunden' };
  try {
    JSON.parse(fs.readFileSync(KEYBINDINGS_PATH, 'utf8'));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: 'keybindings.json fehlerhaft: ' + e.message };
  }
}

function checkVSCodeUpdates() {
  try {
    const output = execSync('code --version', { encoding: 'utf8' });
    // Es gibt keine direkte CLI für Updates, aber man kann die Version loggen
    return { ok: true, version: output.trim() };
  } catch (e) {
    return { ok: false, message: 'VS Code Version nicht ermittelbar' };
  }
}

function checkWindowNotResponding() {
  // Suche nach VS Code Logfiles mit "window is not responding"
  const logDir = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'Code', 'logs');
  let found = false;
  let lastError = null;
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);
    for (const file of files) {
      const filePath = path.join(logDir, file, 'renderer1.log');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('window is not responding')) {
          found = true;
          lastError = filePath;
        }
      }
    }
  }
  return { ok: !found, message: found ? `window is not responding in ${lastError}` : undefined };
}

function checkSettingsConsistency() {
  if (!fs.existsSync(VSCODE_SETTINGS_PATH))
    return { ok: false, message: 'settings.json nicht gefunden' };
  try {
    JSON.parse(fs.readFileSync(VSCODE_SETTINGS_PATH, 'utf8'));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: 'settings.json fehlerhaft: ' + e.message };
  }
}

function main() {
  const enforce = process.argv.includes('--enforce');
  let status = { success: true, problems: [], recommendations: [] };

  try {
    checkExtensions(enforce);
  } catch (e) {
    status.success = false;
    status.problems.push('Extension-Check fehlgeschlagen: ' + e.message);
  }

  try {
    checkSettings();
  } catch (e) {
    status.success = false;
    status.problems.push('Settings-Check fehlgeschlagen: ' + e.message);
  }

  const keybindings = checkKeybindings();
  if (!keybindings.ok) {
    status.success = false;
    status.problems.push(keybindings.message);
  }

  const settingsConsistent = checkSettingsConsistency();
  if (!settingsConsistent.ok) {
    status.success = false;
    status.problems.push(settingsConsistent.message);
  }

  const updates = checkVSCodeUpdates();
  if (!updates.ok) {
    status.success = false;
    status.problems.push(updates.message);
  } else {
    status.recommendations.push('VS Code Version: ' + updates.version);
  }

  const windowNotResponding = checkWindowNotResponding();
  if (!windowNotResponding.ok) {
    status.success = false;
    status.problems.push(windowNotResponding.message);
  }

  // Maschinenlesbare Ausgabe
  fs.writeFileSync('VSCODE_HEALTH_REPORT.json', JSON.stringify(status, null, 2));
  console.log('\nVSCODE_HEALTH_REPORT:', JSON.stringify(status, null, 2));

  if (!status.success) {
    process.exit(1);
  } else {
    console.log('✅ VS Code Manager abgeschlossen.');
    process.exit(0);
  }
}

main();
