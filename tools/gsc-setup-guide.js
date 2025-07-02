#!/usr/bin/env node

/**
 * Google Search Console Service Account Setup Guide
 *
 * Dieses Tool führt durch den Prozess zum Einrichten eines Google Service Accounts
 * für die automatisierte Nutzung der Google Search Console API.
 *
 * Erstellt: 2025-06-24
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CONFIG = {
  SERVICE_ACCOUNT_FILE: path.join(__dirname, 'gsc-service-account.json'),
  EXAMPLE_FILE: path.join(__dirname, 'gsc-service-account.example.json'),
  GSC_PROPERTY: 'sc-domain:burnitoken.website',
};

/**
 * Hilfsklasse für formatierte Ausgabe
 */
class ConsoleUI {
  static info(message) {
    console.log(`\x1b[36m${message}\x1b[0m`);
  }

  static success(message) {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }

  static warn(message) {
    console.log(`\x1b[33m${message}\x1b[0m`);
  }

  static error(message) {
    console.log(`\x1b[31m${message}\x1b[0m`);
  }

  static title(message) {
    const line = '='.repeat(message.length + 4);
    console.log(`\n\x1b[1;36m${line}\n  ${message}\n${line}\x1b[0m\n`);
  }
}

/**
 * Prüft, ob die Service Account Datei bereits existiert
 */
function checkExistingServiceAccount() {
  if (fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
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
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(CONFIG.SERVICE_ACCOUNT_FILE, 'utf8'));
      ConsoleUI.success('✅ Service Account wurde gefunden!');
      ConsoleUI.info(`   Projekt-ID: ${serviceAccount.project_id}`);
      ConsoleUI.info(`   Client-E-Mail: ${serviceAccount.client_email}`);
      return true;
    } catch (err) {
      ConsoleUI.error(`❌ Vorhandene Service Account Datei ist beschädigt: ${err.message}`);
      return false;
    }
  }
  return false;
}

/**
 * Zeigt eine Anleitung für die Google Cloud Console
 */
function showCloudConsoleGuide() {
  ConsoleUI.title('Google Cloud Console Anleitung');

  console.log('So erstellen Sie einen Service Account für die Google Search Console API:');
  console.log('');
  ConsoleUI.info('1. Öffnen Sie die Google Cloud Console');
  console.log('   → https://console.cloud.google.com/');
  console.log('');

  ConsoleUI.info('2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes');
  console.log('   → Klicken Sie oben auf den Projektnamen und dann auf "Neues Projekt"');
  console.log('   → Geben Sie "Burni-GSC-Integration" als Projektnamen ein');
  console.log('');

  ConsoleUI.info('3. Aktivieren Sie die Google Search Console API');
  console.log('   → Gehen Sie zu "APIs & Dienste" > "Bibliothek"');
  console.log('   → Suchen Sie nach "Search Console API"');
  console.log('   → Klicken Sie auf die API und dann auf "Aktivieren"');
  console.log('');

  ConsoleUI.info('4. Erstellen Sie einen Service Account');
  console.log('   → Gehen Sie zu "IAM & Verwaltung" > "Dienstkonten"');
  console.log('   → Klicken Sie auf "Dienstkonto erstellen"');
  console.log('   → Name: "Burni-GSC-Integration"');
  console.log('   → Beschreibung: "Service Account für GSC-Integration"');
  console.log('   → Klicken Sie auf "Erstellen und fortfahren"');
  console.log('');

  ConsoleUI.info('5. Berechtigen Sie den Service Account');
  console.log('   → Sie können die Rolle leer lassen und auf "Fertig" klicken');
  console.log('   → Die Berechtigung erfolgt später in der Search Console selbst');
  console.log('');

  ConsoleUI.info('6. Erstellen Sie einen Schlüssel für den Service Account');
  console.log('   → Klicken Sie auf den erstellten Service Account');
  console.log('   → Gehen Sie zum Tab "Schlüssel"');
  console.log('   → Klicken Sie auf "Schlüssel hinzufügen" > "Neuen Schlüssel erstellen"');
  console.log('   → Wählen Sie "JSON" und klicken Sie auf "Erstellen"');
  console.log('   → Die JSON-Datei wird automatisch heruntergeladen');
  console.log('');

  ConsoleUI.info(
    '7. Benennen Sie die heruntergeladene Datei um und speichern Sie sie im tools/ Verzeichnis',
  );
  console.log(`   → Speichern Sie die Datei als: ${CONFIG.SERVICE_ACCOUNT_FILE}`);
  console.log('');
}

/**
 * Zeigt eine Anleitung für die Google Search Console
 */
function showSearchConsoleGuide() {
  ConsoleUI.title('Google Search Console Berechtigungsanleitung');

  console.log('So erteilen Sie dem Service Account Zugriff auf Ihre Search Console Property:');
  console.log('');

  ConsoleUI.info('1. Öffnen Sie die Google Search Console');
  console.log('   → https://search.google.com/search-console');
  console.log('');

  ConsoleUI.info('2. Wählen Sie die Domain-Property "burnitoken.website"');
  console.log('   → Klicken Sie links oben auf die Eigenschaftsauswahl, falls nötig');
  console.log('');

  ConsoleUI.info('3. Gehen Sie zu den Einstellungen');
  console.log('   → Klicken Sie auf das Zahnrad-Symbol in der linken Seitenleiste');
  console.log('');

  ConsoleUI.info('4. Wählen Sie "Nutzer und Berechtigungen"');
  console.log('   → Klicken Sie auf "Nutzer hinzufügen"');
  console.log('');

  ConsoleUI.info('5. Geben Sie die E-Mail-Adresse des Service Accounts ein');
  if (fs.existsSync(CONFIG.SERVICE_ACCOUNT_FILE)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(CONFIG.SERVICE_ACCOUNT_FILE, 'utf8'));
      ConsoleUI.success(`   → E-Mail-Adresse: ${serviceAccount.client_email}`);
    } catch (err) {
      ConsoleUI.error('   → E-Mail-Adresse: <Aus der JSON-Datei des Service Accounts auslesen>');
    }
  } else {
    ConsoleUI.warn('   → E-Mail-Adresse: <Aus der JSON-Datei des Service Accounts auslesen>');
  }
  console.log('');

  ConsoleUI.info('6. Wählen Sie "Eigentümer" als Berechtigungsstufe');
  console.log('   → Mit weniger Berechtigungen können einige API-Aufrufe fehlschlagen');
  console.log('');

  ConsoleUI.info('7. Klicken Sie auf "Hinzufügen"');
  console.log('   → Warten Sie einige Minuten, bis die Berechtigungen wirksam werden');
  console.log('');
}

/**
 * Testet den Service Account mit einem einfachen API-Aufruf
 */
function testServiceAccount() {
  if (!fs.existsSync(CONFIG.SERVICE_ACCOUNT_FILE)) {
    ConsoleUI.error('❌ Service Account Datei nicht gefunden!');
    return false;
  }

  ConsoleUI.info('🔍 Teste Service Account mit einem einfachen API-Aufruf...');

  try {
    execSync(`node ${path.join(__dirname, 'gsc-status-check.js')} --test`, {
      stdio: 'inherit',
      timeout: 10000,
    });
    return true;
  } catch (error) {
    ConsoleUI.error(`❌ Test fehlgeschlagen: ${error.message}`);
    return false;
  }
}

/**
 * Zeigt die nächsten Schritte nach erfolgreicher Einrichtung
 */
function showNextSteps() {
  ConsoleUI.title('Nächste Schritte');

  ConsoleUI.success('✅ Sie haben den Service Account erfolgreich eingerichtet!');
  console.log('');

  ConsoleUI.info('1. Fügen Sie den GSC-Status-Check zur CI/CD-Pipeline hinzu:');
  console.log('   - Bearbeiten Sie die Datei .github/workflows/ci.yml');
  console.log('   - Fügen Sie einen eigenen Job für den GSC-Status-Check hinzu');
  console.log('     (Verwenden Sie das vorhandene Beispiel im Kommentar)');
  console.log('');

  ConsoleUI.info('2. Fügen Sie das Service Account Secret zu GitHub hinzu:');
  console.log('   - Gehen Sie zu Ihrem GitHub Repository');
  console.log('   - Klicken Sie auf "Settings" > "Secrets and variables" > "Actions"');
  console.log('   - Klicken Sie auf "New repository secret"');
  console.log('   - Name: GSC_SERVICE_ACCOUNT');
  console.log('   - Value: <Gesamter Inhalt der gsc-service-account.json>');
  console.log('');

  ConsoleUI.info('3. Erstellen Sie eine regelmäßige Überprüfung:');
  console.log('   - Erstellen Sie einen separaten Workflow für wöchentliche Prüfungen');
  console.log('   - Verwenden Sie das Beispiel in den Kommentaren der ci.yml');
  console.log('');

  ConsoleUI.warn('⚠️ Sicherheitshinweis:');
  console.log('   - Sichern Sie die Service Account Datei!');
  console.log('   - Vermeiden Sie das Hochladen zu öffentlichen Repositories');
  console.log('   - Fügen Sie gsc-service-account.json zur .gitignore hinzu');
  console.log('');
}

/**
 * Hauptfunktion
 */
async function main() {
  console.clear();
  ConsoleUI.title('Google Search Console Service Account Setup');

  ConsoleUI.info('Dieses Tool hilft Ihnen bei der Einrichtung eines Service Accounts');
  ConsoleUI.info('für die automatisierte Nutzung der Google Search Console API.');
  console.log('');

  // Prüfe, ob Service Account bereits existiert
  const hasExistingAccount = checkExistingServiceAccount();

  if (!hasExistingAccount) {
    showCloudConsoleGuide();

    await new Promise((resolve) => {
      rl.question(
        '\n\x1b[33mHaben Sie den Service Account erstellt und die JSON-Datei heruntergeladen? (j/n): \x1b[0m',
        (answer) => {
          if (answer.toLowerCase() === 'j' || answer.toLowerCase() === 'ja') {
            resolve(true);
          } else {
            ConsoleUI.warn(
              'Bitte befolgen Sie die Anleitung und führen Sie dieses Tool erneut aus.',
            );
            resolve(false);
            process.exit(0);
          }
        },
      );
    });
  }

  // Prüfe Service Account nach der Erstellung/Platzierung
  const accountExists = fs.existsSync(CONFIG.SERVICE_ACCOUNT_FILE);

  if (!accountExists && !hasExistingAccount) {
    ConsoleUI.error(
      `❌ Service Account Datei wurde nicht gefunden unter: ${CONFIG.SERVICE_ACCOUNT_FILE}`,
    );
    console.log('');
    ConsoleUI.warn('Bitte speichern Sie die JSON-Datei des Service Accounts im tools/ Verzeichnis');
    ConsoleUI.warn(`mit dem Namen: gsc-service-account.json`);
    process.exit(1);
  }

  // Zeige GSC-Berechtigungsanleitung
  showSearchConsoleGuide();

  await new Promise((resolve) => {
    rl.question(
      '\n\x1b[33mHaben Sie dem Service Account Zugriff auf die Search Console erteilt? (j/n): \x1b[0m',
      (answer) => {
        if (answer.toLowerCase() === 'j' || answer.toLowerCase() === 'ja') {
          resolve(true);
        } else {
          ConsoleUI.warn('Bitte befolgen Sie die Anleitung und führen Sie dieses Tool erneut aus.');
          resolve(false);
          process.exit(0);
        }
      },
    );
  });

  // Teste den Service Account
  const testResult = testServiceAccount();

  if (testResult) {
    showNextSteps();
  } else {
    ConsoleUI.warn('⚠️ Der Service Account scheint nicht korrekt eingerichtet zu sein.');
    ConsoleUI.warn('   Bitte überprüfen Sie die Fehlermeldungen und versuchen Sie es erneut.');
  }

  rl.close();
}

// Programm ausführen
main().catch((error) => {
  ConsoleUI.error(`❌ Fehler: ${error.message}`);
  process.exit(1);
});




} // Auto-korrigierte schließende Klammer




} // Auto-korrigierte schließende Klammer

} // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer



} // Auto-korrigierte schließende Klammer



} // Auto-korrigierte schließende Klammer



} // Auto-korrigierte schließende Klammer



} // Auto-korrigierte schließende Klammer



} // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer