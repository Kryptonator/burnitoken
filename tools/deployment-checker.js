/**
 * Website Deployment Checker
 * 
 * Überprüft, ob die BurniToken-Website korrekt deployt wurde
 * Prüft auf kritische Elemente und validiert die Live-Website
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createTodo } = require('./todo-manager');

// Konfiguration
const CONFIG = {
  liveUrl: 'https://burnitoken.com',
  criticalFiles: [
    'index.html',
    'styles.css',
    'main.js',
    'manifest.json',
    'favicon.ico',
    'robots.txt'
  ],
  criticalElements: [
    '<title>BurniToken',
    '<meta name="description"',
    'BurniToken',
    'XRPL',
    'Token Burning'
  ],
  logFile: path.join(__dirname, 'deployment-check.log'),
  reportFile: path.join(__dirname, 'deployment-status.md'),
  statusFile: path.join(__dirname, 'deployment-status.json'),
  timeoutMs: 10000,
};

// Status-Objekt
const deploymentStatus = {
  timestamp: new Date().toISOString(),
  summary: {
    status: 'unknown',
    criticalFilesFound: 0,
    criticalFilesMissing: [],
    elementsFound: 0,
    elementsMissing: []
  },
  details: {
    websiteActive: false,
    statusCode: 0,
    contentChecked: false,
    filesChecked: {},
    responseTime: 0
  }
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch(level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'success':
      console.log(message);
      break;
    case 'info':
      console.log(message);
      break;
    default:
      console.log(message);
  }
  
  // Log in Datei
  try {
    fs.appendFileSync(CONFIG.logFile, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Überprüft, ob eine Datei auf der Live-Website existiert
 */
function checkFileExists(fileName) {
  return new Promise((resolve) => {
    const fileUrl = `${CONFIG.liveUrl}/${fileName}`;
    
    const req = https.request(fileUrl, { method: 'HEAD', timeout: CONFIG.timeoutMs }, (res) => {
      const exists = res.statusCode === 200;
      
      deploymentStatus.details.filesChecked[fileName] = {
        exists,
        statusCode: res.statusCode,
        contentType: res.headers['content-type']
      };
      
      if (exists) {
        log(`✅ Datei ${fileName} gefunden (${res.statusCode})`, 'success');
      } else {
        log(`❌ Datei ${fileName} nicht gefunden (${res.statusCode})`, 'error');
        if (!deploymentStatus.summary.criticalFilesMissing.includes(fileName)) {
          deploymentStatus.summary.criticalFilesMissing.push(fileName);
        }
      }
      
      resolve(exists);
    });
    
    req.on('error', (err) => {
      log(`❌ Fehler bei Dateiprüfung ${fileName}: ${err.message}`, 'error');
      deploymentStatus.details.filesChecked[fileName] = {
        exists: false,
        error: err.message
      };
      
      if (!deploymentStatus.summary.criticalFilesMissing.includes(fileName)) {
        deploymentStatus.summary.criticalFilesMissing.push(fileName);
      }
      
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`❌ Timeout bei Dateiprüfung ${fileName}`, 'error');
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Überprüft den Inhalt der Homepage
 */
function checkWebsiteContent() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(CONFIG.liveUrl, { timeout: CONFIG.timeoutMs }, (res) => {
      deploymentStatus.details.statusCode = res.statusCode;
      deploymentStatus.details.websiteActive = res.statusCode === 200;
      deploymentStatus.details.responseTime = Date.now() - startTime;
      
      if (res.statusCode !== 200) {
        log(`❌ Website ist nicht verfügbar (Status: ${res.statusCode})`, 'error');
        resolve(false);
        return;
      }
      
      let content = '';
      
      res.on('data', (chunk) => {
        content += chunk.toString();
      });
      
      res.on('end', () => {
        try {
          // Überprüfe kritische Elemente
          const foundElements = [];
          const missingElements = [];
          
          for (const element of CONFIG.criticalElements) {
            if (content.includes(element)) {
              foundElements.push(element);
            } else {
              missingElements.push(element);
              log(`Kritisches Element fehlt: ${element}`, 'error');
              deploymentStatus.summary.elementsMissing.push(element);
              createTodo(
                `Kritisches Element fehlt: ${element}`,
                `Das kritische Element oder der Text "${element}" wurde im HTML der Startseite (${CONFIG.liveUrl}) nicht gefunden. Dies beeinträchtigt SEO und die grundlegende Funktionalität.`,
                'Deployment Checker'
              );
            }
          }
          
          deploymentStatus.summary.elementsFound = foundElements.length;
          deploymentStatus.summary.elementsMissing = missingElements;
          
          if (missingElements.length === 0) {
            log(`✅ Alle ${foundElements.length} kritischen Elemente wurden gefunden`, 'success');
          } else {
            log(`⚠️ ${missingElements.length} kritische Elemente fehlen: ${missingElements.join(', ')}`, 'warn');
          }
          
          deploymentStatus.details.contentChecked = true;
          resolve(missingElements.length === 0);
        } catch (err) {
          log(`❌ Fehler bei der Inhaltsanalyse: ${err.message}`, 'error');
          deploymentStatus.details.contentChecked = false;
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      log(`❌ Fehler beim Abrufen der Website: ${err.message}`, 'error');
      deploymentStatus.details.websiteActive = false;
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`❌ Timeout beim Abrufen der Website`, 'error');
      deploymentStatus.details.websiteActive = false;
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Generiert einen Markdown-Bericht
 */
function generateMarkdownReport() {
  const now = new Date().toLocaleString();
  const status = deploymentStatus.summary.status;
  const statusEmoji = status === 'deployed' ? '✅' : status === 'partial' ? '⚠️' : '❌';
  
  let markdown = `# BurniToken Website Deployment Status\n\n`;
  markdown += `**Zeitpunkt:** ${now}\n`;
  markdown += `**Status:** ${statusEmoji} ${status.toUpperCase()}\n\n`;
  
  markdown += `## Zusammenfassung\n\n`;
  markdown += `- **Website aktiv:** ${deploymentStatus.details.websiteActive ? '✅ Ja' : '❌ Nein'}\n`;
  markdown += `- **Status-Code:** ${deploymentStatus.details.statusCode}\n`;
  markdown += `- **Antwortzeit:** ${deploymentStatus.details.responseTime}ms\n`;
  markdown += `- **Kritische Dateien:** ${deploymentStatus.summary.criticalFilesFound}/${CONFIG.criticalFiles.length} gefunden\n`;
  markdown += `- **Kritische Elemente:** ${deploymentStatus.summary.elementsFound}/${CONFIG.criticalElements.length} gefunden\n\n`;
  
  if (deploymentStatus.summary.criticalFilesMissing.length > 0) {
    markdown += `### Fehlende Dateien\n\n`;
    for (const file of deploymentStatus.summary.criticalFilesMissing) {
      markdown += `- \`${file}\`\n`;
    }
    markdown += `\n`;
  }
  
  if (deploymentStatus.summary.elementsMissing.length > 0) {
    markdown += `### Fehlende Elemente\n\n`;
    for (const element of deploymentStatus.summary.elementsMissing) {
      markdown += `- \`${element}\`\n`;
    }
    markdown += `\n`;
  }
  
  markdown += `## Details zu überprüften Dateien\n\n`;
  markdown += `| Datei | Status | HTTP-Code | Content-Type |\n`;
  markdown += `| ----- | ------ | --------- | ------------ |\n`;
  
  for (const [fileName, fileStatus] of Object.entries(deploymentStatus.details.filesChecked)) {
    const status = fileStatus.exists ? '✅' : '❌';
    const statusCode = fileStatus.statusCode || 'N/A';
    const contentType = fileStatus.contentType || 'N/A';
    
    markdown += `| \`${fileName}\` | ${status} | ${statusCode} | ${contentType} |\n`;
  }
  
  markdown += `\n---\n\n`;
  markdown += `Bericht generiert am ${now}\n`;
  
  return markdown;
}

/**
 * Führt eine vollständige Überprüfung durch
 */
async function checkDeployment() {
  try {
    log('🚀 Deployment-Check wird gestartet...', 'info');
    
    // Überprüfe Website-Inhalt
    const contentOk = await checkWebsiteContent();
    
    // Überprüfe kritische Dateien
    let foundFiles = 0;
    for (const file of CONFIG.criticalFiles) {
      const exists = await checkFileExists(file);
      if (exists) foundFiles++;
    }
    
    deploymentStatus.summary.criticalFilesFound = foundFiles;
    
    // Bestimme den Gesamtstatus
    if (deploymentStatus.details.websiteActive && 
        foundFiles === CONFIG.criticalFiles.length && 
        deploymentStatus.summary.elementsMissing.length === 0) {
      deploymentStatus.summary.status = 'deployed';
    } else if (deploymentStatus.details.websiteActive && 
               (foundFiles > 0 || deploymentStatus.summary.elementsFound > 0)) {
      deploymentStatus.summary.status = 'partial';
    } else {
      deploymentStatus.summary.status = 'failed';
    }
    
    // Speichere Status und Report
    try {
      fs.writeFileSync(CONFIG.statusFile, JSON.stringify(deploymentStatus, null, 2), 'utf8');
      fs.writeFileSync(CONFIG.reportFile, generateMarkdownReport(), 'utf8');
      log('Status und Report erfolgreich gespeichert', 'success');
    } catch (err) {
      log(`Fehler beim Speichern des Status: ${err.message}`, 'error');
    }
    
    // Zeige Gesamtergebnis
    const statusMsg = deploymentStatus.summary.status === 'deployed' ? 
      'ERFOLGREICH ✅' : deploymentStatus.summary.status === 'partial' ? 
      'TEILWEISE ⚠️' : 'FEHLGESCHLAGEN ❌';
      
    log(`Deployment-Status: ${statusMsg} (${foundFiles}/${CONFIG.criticalFiles.length} Dateien, ${deploymentStatus.summary.elementsFound}/${CONFIG.criticalElements.length} Elemente)`,
      deploymentStatus.summary.status === 'deployed' ? 'success' : 
      deploymentStatus.summary.status === 'partial' ? 'warn' : 'error');
      
    log('Deployment-Check abgeschlossen.', 'success');
    return deploymentStatus.summary.status;
  } catch (err) {
    log(`Unerwarteter Fehler beim Deployment-Check: ${err.message}`, 'error');
    deploymentStatus.summary.status = 'error';
    return 'error';
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Initialisiere Log-Datei
    if (!fs.existsSync(path.dirname(CONFIG.logFile))) {
      fs.mkdirSync(path.dirname(CONFIG.logFile), { recursive: true });
    }
    
    // Lösche alte Log-Datei
    if (fs.existsSync(CONFIG.logFile)) {
      fs.truncateSync(CONFIG.logFile, 0);
    }
    
    // Führe Deployment-Check durch
    await checkDeployment();
  } catch (err) {
    log(`Kritischer Fehler: ${err.message}`, 'error');
    console.error(err);
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) {
  main().catch(err => {
    console.error(`Kritischer Fehler: ${err.message}`, 'error');
  });
}

module.exports = {
  checkDeployment
};
