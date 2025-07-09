
require('dotenv').config();
const https = require('https');

/**
 * tools/test-repo-access.js
 * 
 * Dieses Skript testet den Zugriff auf ein GitHub-Repository mit dem konfigurierten GITHUB_TOKEN.
 * Es führt eine GET-Anfrage an den Repository-Endpunkt aus, um zu überprüfen, ob das
 * Repository existiert und der Token die erforderlichen Leseberechtigungen hat.
 */

// --- Konfiguration ---
const GITHUB_REPO = process.env.GITHUB_REPO || 'Kryptonator/burnitoken';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function checkRepoAccess() {
    if (!GITHUB_TOKEN) {
        console.error('❌ Fehler: GITHUB_TOKEN ist nicht in der .env-Datei gesetzt.');
        return;
    }

    console.log(`ℹ️  Teste Zugriff auf das Repository: ${GITHUB_REPO}`);

    const options = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}`,
        method: 'GET',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'burnitoken-repo-access-test',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Erfolgreich! Das Repository wurde gefunden und der Token hat Lesezugriff.');
                    const repoData = JSON.parse(responseBody);
                    console.log(`   - Repository Name: ${repoData.full_name}`);
                    console.log(`   - Beschreibung: ${repoData.description}`);
                    console.log(`   - Private: ${repoData.private}`);
                    resolve();
                } else if (res.statusCode === 404) {
                    console.error(`❌ Fehler (404 Not Found): Das Repository '${GITHUB_REPO}' wurde nicht gefunden.`);
                    console.error('   Mögliche Ursachen:');
                    console.error('   1. Tippfehler im Repository-Namen oder Besitzer.');
                    console.error('   2. Das Repository ist privat und der Token hat keine Berechtigung.');
                    console.error('   3. Der Token hat nicht den erforderlichen `repo`-Scope.');
                    console.error('\n   BITTE ÜBERPRÜFEN:');
                    console.error(`   - Existiert das Repository unter https://github.com/${GITHUB_REPO}?`);
                    console.error('   - Hat der verwendete GitHub-Token die Berechtigung (Scope: `repo`) für dieses Repository?');
                    reject(new Error('Repository not found or access denied.'));
                } else {
                    console.error(`❌ Unerwarteter Fehler (Status: ${res.statusCode}):`);
                    console.error(responseBody);
                    reject(new Error(`Failed to access repository with status code: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Fehler bei der API-Anfrage: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

checkRepoAccess().catch(err => {
    // Fehler wird bereits im Promise behandelt, hier nur den Prozess beenden
    process.exit(1);
});
