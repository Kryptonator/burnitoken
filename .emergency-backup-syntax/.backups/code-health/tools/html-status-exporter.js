/**
 * HTML Status Exporter
 *
 * Fetches the live HTML of the website and saves it to a file for debugging and analysis.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://burnitoken.website';
const OUTPUT_DIR = __dirname;
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'website-dom-snapshot.html');

/**
 * Logs a message to the console with a timestamp.
 * @param {string} message The message to log.
 * @param {'info' | 'success' | 'error'} level The log level.
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [HTML Exporter] [${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Fetches the HTML content from the target URL and saves it to a file.
 * @returns {Promise<string>} The path to the saved HTML file.
 */
async function exportHtmlSnapshot() {
  return new Promise((resolve, reject) => {
    log(`Fetching HTML from ${TARGET_URL}...`);

    const request = https.get(TARGET_URL, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        const error = new Error(`Failed to fetch HTML. Status Code: ${res.statusCode}`);
        log(error.message, 'error');
        return reject(error);
      }

      let htmlData = '';
      res.on('data', (chunk) => {
        htmlData += chunk;
      });

      res.on('end', () => {
        try {
          fs.writeFileSync(OUTPUT_FILE, htmlData, 'utf8');
          log(`Successfully saved HTML snapshot to ${OUTPUT_FILE}`, 'success');
          resolve(OUTPUT_FILE);
        } catch (writeError) {
          log(`Error saving HTML snapshot: ${writeError.message}`, 'error');
          reject(writeError);
        }
      });
    });

    request.on('error', (fetchError) => {
      log(`Error fetching HTML: ${fetchError.message}`, 'error');
      reject(fetchError);
    });

    request.end();
  });
}

/**
 * Generiert eine moderne HTML-Statusseite aus den Scan-Ergebnissen.
 * @param {Array<Object>} results - Array mit den Ergebnissen der einzelnen Checks.
 * @param {string} outputPath - Der Pfad, in den die HTML-Datei geschrieben werden soll.
 */
function exportToHtml(results, outputPath = 'monitoring-dashboard.html') {
  // Funktionalität zum Exportieren der Ergebnisse nach HTML
}

// If run directly, execute the export
if (require.main === module) {
  exportHtmlSnapshot().catch((error) => {
    // The error is already logged in the function, so just exit.
    process.exit(1);
  });
}

module.exports = {
  exportHtmlSnapshot,
  exportToHtml,
};
