// tools/master-logic-engine.js
// Das zentrale Gehirn des Automatisierungs-Orchesters.
// Stellt intelligente Funktionen für andere Skripte bereit.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Lade Umgebungsvariablen aus der .env-Datei im Projektstammverzeichnis

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Octokit } = require('@octokit/rest'); // NEU: GitHub API
const { getAISuggestion } = require('./ai-suggestion-service'); // NEU: AI-Vorschläge
const autoGitManager = require('./auto-git-manager'); // NEU: Import des Auto-Git-Managers

// Konfiguration für GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'Micky325';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'burnitoken.com';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

class MasterLogicEngine {
  constructor() {
    this.errorPatterns = [
      {
        name: 'SyntaxError',
        regex: /SyntaxError:/,
        solution:
          'Syntaxfehler im Code entdeckt. Versuche automatische Korrektur oder melde an Entwickler.',
        action: 'run_syntax_fixer',
      },
      {
        name: 'ModuleNotFound',
        regex: /Cannot find module/,
        solution: 'Ein benötigtes NPM-Modul fehlt. Führe `npm install` aus.',
        action: 'run_npm_install',
      },
      {
        name: 'GitConflict',
        regex: /Merge conflict in/,
        solution:
          'Merge-Konflikt im Git-Repository. Benachrichtige den Entwickler und erstelle ein Issue.',
        action: 'create_github_issue',
      },
      {
        name: 'ApiError',
        regex: /API_ERROR|FETCH_FAILED/,
        solution:
          'Fehler bei der Kommunikation mit einer externen API. Überprüfe die API-Endpunkte und den Netzwerkstatus.',
        action: 'check_api_status',
      },
      {
        name: 'FileNotFound',
        regex: /ENOENT: no such file or directory/,
        solution:
          'Eine erwartete Datei wurde nicht gefunden. Überprüfe die Dateipfade und Deployment-Skripte.',
        action: 'validate_file_paths',
      },
      {
        name: 'PermissionError',
        regex: /EACCES: permission denied/,
        solution:
          'Fehlende Berechtigungen für den Zugriff auf eine Datei oder ein Verzeichnis. Überprüfe die Dateiberechtigungen.',
        action: 'check_file_permissions',
      },
    ];
    console.log('🧠 Master Logic Engine initialisiert.');
  }

  /**
   * Analysiert einen Fehler-Log oder Text und schlägt eine Lösung vor.
   * @param ${string} errorLog - Der zu analysierende Fehlertext.
   * @returns {{name: string, solution: string, action: string} | null} - Das erkannte Problem oder null.
   */
  analyzeError(errorLog) {
    console.log(`🔬 Analysiere Fehler...`);
    for (const pattern of this.errorPatterns) {
      if (pattern.regex.test(errorLog)) {
        console.log(`✅ Muster erkannt: ${pattern.name}`);
        return {
          name: pattern.name,
          solution: pattern.solution,
          action: pattern.action,
        };
      }
    }
    console.log(`🤔 Kein spezifisches Muster für diesen Fehler gefunden.`);
    return null;
  }

  /**
   * Führt eine Aktion basierend auf der Fehleranalyse aus.
   * @param ${string} action - Die auszuführende Aktion (z.B. 'run_npm_install').
   * @param {object} context - Zusätzlicher Kontext für die Aktion.
   */
  async executeAction(action, context = {}) {
    console.log(`🚀 Führe Aktion aus: ${action}`);
    let success = false;
    switch (action) {
      case 'run_npm_install':
        console.log('Führe `npm install` aus, um fehlende Abhängigkeiten zu installieren...');
        exec('npm install', (error, stdout, stderr) => {
          if (error) {
            console.error(`Fehler bei npm install: ${stderr}`);
            return;
          }
          console.log(`npm install erfolgreich: ${stdout}`);
          autoGitManager.autoCommitAndPush(
            `Fix: Ran npm install due to ${context.name || 'module not found'}`
          ); // NEU
        });
        success = true;
        break;
      case 'create_github_issue':
        console.log('Erstelle GitHub Issue für Entwickler...');
        if (!GITHUB_TOKEN) {
          console.error('GITHUB_TOKEN ist nicht gesetzt. Kann kein Issue erstellen.');
          return;
        }
        try {
          const title = `Automatischer Report: ${context.name || 'Unbekannter Fehler'}`;
          const body = `**Fehlerdetails:**\n\`\`\`\n${context.error}\n\`\`\`\n\n**Vorgeschlagene Lösung:**\n${context.solution}\n\nBitte überprüfen und beheben.`;

          await octokit.issues.create({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            title: title,
            body: body,
            labels: ['bug', 'auto-generated'],
          });
          console.log('✅ GitHub Issue erfolgreich erstellt.');
          success = true;
        } catch (error) {
          console.error(`Fehler beim Erstellen des GitHub Issues: ${error.message}`);
        }
        break;
      default:
        console.warn(`Aktion '${action}' ist nicht implementiert.`);
    }
    return success;
  }

  /**
   * Sucht nach Platzhaltern im Code und erstellt bei Funden GitHub-Issues.
   * @param {string} filePath - Der Pfad zur zu durchsuchenden Datei.
   */
  async resolvePlaceholders(filePath) {
    const placeholders = this.findPlaceholders(filePath);
    if (placeholders.length > 0) {
      console.log(`[Engine] ${placeholders.length} Platzhalter in ${filePath} gefunden. Erstelle Issues...`);
      for (const placeholder of placeholders) {
        const context = {
          name: `Platzhalter gefunden: ${placeholder.type}`,
          error: `**Datei:** \`${filePath}\`\n**Zeile ${placeholder.line}:** \`${placeholder.text.trim()}\``,
          solution: `Bitte den Platzhalter **${placeholder.type}** durch eine korrekte Implementierung ersetzen.`
        };
        await this.executeAction('create_github_issue', context);
      }
    }
  }

  /**
   * Sucht nach Platzhaltern im Code.
   * @param {string} filePath - Der Pfad zur zu durchsuchenden Datei.
   * @returns {Array} - Eine Liste gefundener Platzhalter.
   */
  findPlaceholders(filePath) {
    console.log(`🔍 Suche nach Platzhaltern in ${filePath}...`);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      const placeholders = [];
      const placeholderRegex = /\/\/\s*(TODO|HINT|FIXME|XXX|REVIEW|NOTE|OPTIMIZE)/g;

      lines.forEach((line, index) => {
        const match = placeholderRegex.exec(line);
        if (match) {
          placeholders.push({
            file: filePath,
            line: index + 1,
            type: match[1],
            text: line.trim(),
          });
        }
      });

      if (placeholders.length > 0) {
        console.log(`✅ ${placeholders.length} Platzhalter in ${filePath} gefunden.`);
      }
      return placeholders;
    } catch (error) {
      console.error(`Fehler beim Lesen der Datei ${filePath}: ${error.message}`);
      return [];
    }
  }

  /**
   * Holt einen KI-gestützten Lösungsvorschlag für ein Problem.
   * @param {string} problemDescription - Die Beschreibung des Problems.
   * @returns {Promise<string>} - Der Lösungsvorschlag.
   */
  async getAISuggestion(problemDescription) {
    console.log('🤖 Hole KI-gestützten Lösungsvorschlag...');
    try {
      const suggestion = await getAISuggestion(problemDescription);
      console.log('✅ KI-Vorschlag erhalten.');
      return suggestion;
    } catch (error) {
      console.error(`Fehler beim Abrufen des KI-Vorschlags: ${error.message}`);
      return 'KI-Dienst nicht verfügbar.';
    }
  }
}

module.exports = new MasterLogicEngine();

