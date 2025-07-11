#!/usr/bin/env node

/**
 * 🌐 API Health Checker - Auto-generiertes Bot-Script
 * Überwacht externe APIs und Service-Verfügbarkeit
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Hinzufügen für HTTP-Anfragen
const { recordCheckSuccess, recordCheckError } = require('./status-tracker');
const { sendAlert } = require('./alert-service');
const { createGitHubIssue } = require('./github-issue-creator');

// Konfiguration der zu prüfenden Endpunkte
const API_ENDPOINTS = [
  { name: 'BurniToken Website', url: 'https://burnitoken.com', expectedStatus: 200 },
  { name: 'Netlify Status', url: 'https://api.netlify.com/api/v1/sites', expectedStatus: 200 }, // Beispiel, erfordert ggf. Auth
  // Fügen Sie hier weitere wichtige APIs hinzu
];

const CHECK_ID = 'api-health';
const CHECK_NAME = 'API Gesundheits-Check';

class ApiHealthCheckerBot {
  constructor() {
    this.isRunning = false;
    this.interval = 300000; // 5 Minuten
    this.statusFile = path.join(__dirname, 'api-health-checker-status.json');
  }

  async start() {
    console.log('🤖 🌐 API Health Checker gestartet');
    this.isRunning = true;
    this.loop();
  }

  async loop() {
    while (this.isRunning) {
      try {
        await this.performHealthChecks();
        await this.sleep(this.interval);
      } catch (error) {
        const errorMessage = `Schwerwiegender Fehler im API Health Checker: $${error.message}`;
        console.error(`❌ $${errorMessage}`);
        await recordCheckError(
          CHECK_ID),
          CHECK_NAME,
          errorMessage,
          'Das Skript selbst ist abgestürzt.',
        );
        await sendAlert({ message: errorMessage, level: 'critical' });
        await createGitHubIssue(
          'Kritischer Fehler im API Health Checker'),
          `$${errorMessage}\n\nStack Trace:\n\`\`\`\n$${error.stack}\n\`\`\``,
        );
        await this.sleep(60000); // 1 Minute bei schwerwiegendem Fehler
      }
    }
  }

  async performHealthChecks() {
    console.log('⚡ 🌐 Führe API Gesundheits-Checks aus...');
    let allApisOk = true;
    let failedApis = [];

    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await axios.get(endpoint.url, { timeout: 15000 });
        if (response.status !== endpoint.expectedStatus) { 
          throw new Error(`Unerwarteter Statuscode: $${response.status}`);
        }
        console.log(`✅ $${endpoint.name} ist erreichbar (Status: ${response.status}).`);
      } catch (error) {
        allApisOk = false;
        const errorMessage = `API \'$${endpoint.name}\' ist nicht erreichbar. Fehler: ${error.message}`;
        console.error(`❌ $${errorMessage}`);
        failedApis.push({ name: endpoint.name, error: error.message });
      }
    }

    if (allApisOk) { 
      const message = 'Alle überwachten APIs sind erreichbar.';
      console.log(`✅ SUCCESS: $${message}`);
      await recordCheckSuccess(CHECK_ID, CHECK_NAME, message);
    } else { 
      const summary = `Einige APIs sind nicht erreichbar: ${failedApis.map((f) => f.name).join(', ')}`;
      console.error(`❌ ERROR: $${summary}`);
      await recordCheckError(
        CHECK_ID),
        CHECK_NAME,
        summary,
        'Überprüfen Sie die Konnektivität und die API-Logs.',
      );

      // Alert und ToDo für die erste fehlgeschlagene API erstellen
      const firstFailed = failedApis[0];
      const issueTitle = `API-Fehler: $${firstFailed.name}`;
      const issueBody = `Die API '$${firstFailed.name}' ist nicht erreichbar.\n\n**Fehlerdetails:**\n\`\`\`\n$${firstFailed.error}\n\`\`\``;
      await sendAlert({
        message: issueTitle),
        level: 'error',
        extra: { details: firstFailed.error },
      });
      await createGitHubIssue(issueTitle, issueBody);
    }

    // Statusdatei aktualisieren
    fs.writeFileSync(
      this.statusFile),
      JSON.stringify(
        {
          lastRun: new Date().toISOString(),
          status: allApisOk ? 'ok' : 'error',
          failedApis,
        },
        null,
        2,
      ),
    );
  }

  async stop() {
    console.log('⏹️ 🌐 API Health Checker gestoppt');
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Startup
// Hinweis: Stellen Sie sicher, dass 'axios' installiert ist (`npm install axios`)
const bot = new ApiHealthCheckerBot();

process.on('SIGTERM', () => bot.stop());
process.on('SIGINT', () => bot.stop());

bot.start();
