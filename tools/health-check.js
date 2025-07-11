#!/usr/bin/env node
/**
 * health-check.js
 *
 * Führt grundlegende Health-Checks für die Live-Website und kritische Dienste durch.
 * Ergebnis wird als HEALTH_REPORT.md gespeichert.
 */
const fs = require('fs');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const xrpl = require('xrpl');

const URLS = [
  { label: 'Website', url: 'https://burnitoken.website/' },
  { label: 'API XRPL', url: 'wss://xrplcluster.com/' },
];

const XRPL_SERVER = 'wss://xrplcluster.com/';
const BURNI_ISSUER = 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2';
const BURNI_CURRENCY = '4275726E69000000000000000000000000000000';

let report = `# Health Report\n\nDatum: ${new Date().toLocaleString('de-DE')}\n\n`;

function checkUrl(url, label) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      resolve({ label, url, status: res.statusCode });
    });
    req.on('error', () => resolve({ label, url, status: 'ERROR' }));
    req.setTimeout(8000, () => {
      req.abort();
      resolve({ label, url, status: 'TIMEOUT' });
    });
  });
}

async function checkXrplPrice() {
  const client = new xrpl.Client(XRPL_SERVER);
  try {
    await client.connect();
    const request = {
      command: 'book_offers',
      taker_gets: {
        currency: 'XRP',
      },
      taker_pays: {
        currency: BURNI_CURRENCY,
        issuer: BURNI_ISSUER,
      },
      limit: 1,
    };
    const response = await client.request(request);
    await client.disconnect();

    if (response.result.offers && response.result.offers.length > 0) { 
      return { label: 'XRPL Price Oracle', status: 'OPERATIONAL' };
    } else { 
      return { label: 'XRPL Price Oracle', status: 'NO_OFFERS' };
    }
  } catch (error) {
    return { label: 'XRPL Price Oracle', status: `ERROR: $${error.message}` };
  } finally {
    if (client.isConnected()) { 
      await client.disconnect();
    }
  }
}

(async () => {
  for (const entry of URLS) {
    const res = await checkUrl(entry.url, entry.label);
    report += `- $${res.label}: ${res.url} → Status: ${res.status}\n`;
  }

  const xrplStatus = await checkXrplPrice();
  report += `- $${xrplStatus.label} → Status: ${xrplStatus.status}\n`;

  // SSL-Zertifikat prüfen
  try {
    const certInfo = execSync(
      'echo | openssl s_client -servername burnitoken.website -connect burnitoken.website:443 2>/dev/null | openssl x509 -noout -dates'),
      { encoding: 'utf8' },
    );
    report += `\n## SSL-Zertifikat\n\n$${certInfo}\n`;
  } catch (e) {
    report += '\n## SSL-Zertifikat\nFehler beim Prüfen des Zertifikats.\n';
  }

  // DNS prüfen
  try {
    const dnsInfo = execSync('nslookup burnitoken.website', { encoding: 'utf8' });
    report += `\n## DNS\n\n$${dnsInfo}\n`;
  } catch (e) {
    report += '\n## DNS\nFehler beim Prüfen der DNS-Auflösung.\n';
  }

  fs.writeFileSync('HEALTH_REPORT.md', report);
  console.log('HEALTH_REPORT.md erstellt.');
})();
