/**
 * Task Manager Status-Checker
 * 
 * Zeigt den aktuellen Status des Master Task Managers an
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const STATUS_FILE = path.join(__dirname, 'master-task-status.json');
const LOG_FILE = path.join(__dirname, 'master-task-manager.log');
const LOCK_FILE = path.join(__dirname, '.master-task.lock');

console.log('📊 Master Task Manager Status-Bericht');
console.log('=====================================');

// Prüfe, ob Task Manager aktiv ist
if (fs.existsSync(LOCK_FILE)) {
  const lockData = fs.statSync(LOCK_FILE);
  const lockAge = Date.now() - lockData.mtimeMs;
  console.log(`🟢 Master Task Manager läuft (Lock-Datei existiert seit ${Math.round(lockAge/1000)}s)`);
} else {
  console.log('🔴 Master Task Manager läuft nicht (keine Lock-Datei)');
}

// Zeige Status aus Status-Datei
if (fs.existsSync(STATUS_FILE)) {
  try {
    const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    const startTime = new Date(statusData.startTime);
    const currentTime = new Date();
    const runTime = Math.round((currentTime - startTime) / 1000);
    
    console.log(`\n📅 Letzte Ausführung: ${new Date(statusData.timestamp).toLocaleString('de-DE')}`);
    console.log(`⏱️ Laufzeit: ${runTime >= 0 ? runTime : 0}s`);
    console.log(`\n📦 Services-Übersicht:`);
    
    const servicesStarted = Object.keys(statusData.services).length;
    const servicesRunning = Object.values(statusData.services).filter(s => s.status === 'running' || s.status === 'completed').length;
    const servicesError = Object.values(statusData.services).filter(s => s.status === 'error').length;
    
    console.log(`  ✅ Erfolgreich: ${servicesRunning}`);
    console.log(`  ❌ Fehlerhaft: ${servicesError}`);
    console.log(`  📊 Gesamt: ${servicesStarted}`);
      console.log('\n📋 Service-Details:');
    Object.entries(statusData.services).forEach(([name, service]) => {
      let statusEmoji = '❓';
      if (service.status === 'completed') statusEmoji = '✅';
      else if (service.status === 'running') statusEmoji = '🔄';
      else if (service.status === 'error') statusEmoji = '❌';
      
      let statusText = `  ${statusEmoji} ${name}: ${service.status}`;
      if (service.error) {
        statusText += ` (${service.error})`;
      }
      console.log(statusText);
    });
    
    if (statusData.errors && statusData.errors.length > 0) {
      console.log('\n⚠️ Fehler:');
      statusData.errors.forEach(err => {
        console.log(`  - ${new Date(err.timestamp).toLocaleString('de-DE')}: ${err.message}`);
      });
    }
  } catch (err) {
    console.error(`Fehler beim Lesen der Status-Datei: ${err.message}`);
  }
} else {
  console.log('\n⚠️ Keine Status-Datei gefunden. Master Task Manager wurde noch nicht ausgeführt.');
}

// Zeige die letzten Log-Einträge
console.log('\n📜 Letzte Log-Einträge:');
if (fs.existsSync(LOG_FILE)) {
  try {
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const logLines = logContent.split('\n').filter(Boolean).slice(-10);
    logLines.forEach(line => console.log(`  ${line}`));
  } catch (err) {
    console.error(`Fehler beim Lesen der Log-Datei: ${err.message}`);
  }
} else {
  console.log('  Keine Log-Datei gefunden.');
}

console.log('\n🔍 Hinweise:');
console.log('  • Um den Task Manager neu zu starten: Führe die Task "🚀 Master Task Manager (Manuell)" aus');
console.log('  • Bei Problemen: Prüfe die Log-Datei unter tools/master-task-manager.log');
console.log('  • Status-Details: Siehe JSON-Datei unter tools/master-task-status.json');
