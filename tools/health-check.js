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

const URLS = [
  { label: 'Website', url: 'https://burnitoken.com/' },
  { label: 'API XRPL', url: 'https://xrplcluster.com/' }
];

let report = `# Health Report\n\nDatum: ${new Date().toLocaleString('de-DE')}\n\n`;

function checkUrl(url, label) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, res => {
      resolve({ label, url, status: res.statusCode });
    });
    req.on('error', () => resolve({ label, url, status: 'ERROR' }));
    req.setTimeout(8000, () => {
      req.abort();
      resolve({ label, url, status: 'TIMEOUT' });
    });
  });
}

(async () => {
  for (const entry of URLS) {
    const res = await checkUrl(entry.url, entry.label);
    report += `- ${res.label}: ${res.url} → Status: ${res.status}\n`;
  }

  // SSL-Zertifikat prüfen
  try {
    const certInfo = execSync('echo | openssl s_client -servername burnitoken.com -connect burnitoken.com:443 2>/dev/null | openssl x509 -noout -dates', { encoding: 'utf8' });
    report += `\n## SSL-Zertifikat\n\n${certInfo}\n`;
  } catch (e) {
    report += '\n## SSL-Zertifikat\nFehler beim Prüfen des Zertifikats.\n';
  }

  // DNS prüfen
  try {
    const dnsInfo = execSync('nslookup burnitoken.com', { encoding: 'utf8' });
    report += `\n## DNS\n\n${dnsInfo}\n`;
  } catch (e) {
    report += '\n## DNS\nFehler beim Prüfen der DNS-Auflösung.\n';
  }

  fs.writeFileSync('HEALTH_REPORT.md', report);
  console.log('HEALTH_REPORT.md erstellt.');
})();
