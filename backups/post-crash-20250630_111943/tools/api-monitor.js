// tools/api-monitor.js
const fs = require('fs');
const fetch = require('node-fetch');

const endpoints = [
  {
    name: 'XRPL Cluster',
    url: 'wss://xrplcluster.com/',
    type: 'ws',
  },
  {
    name: 'BurniToken Website',
    url: 'https://burnitoken.website/',
    type: 'http',
    expect: { status: 200 },
  },
  {
    name: 'Preis-API (CoinGecko)',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=burnitoken&vs_currencies=usd',
    type: 'http',
    expect: {
      json: true,
      fields: ['burnitoken.usd'],
    },
  },
  // Weitere APIs können hier ergänzt werden
  // Beispiel für weitere Services:
  // {
  //   name: 'Cloudflare CDN',
  //   url: 'https://www.cloudflare.com/',
  //   type: 'http',
  // },
  // {
  //   name: 'E-Mail Provider',
  //   url: 'https://api.mailgun.net/v3/domains',
  //   type: 'http',
  // },
  // {
  //   name: 'Weitere Preis-API',
  //   url: 'https://api.example.com/price',
  //   type: 'http',
  // },
];

async function checkHttp(url, expect) {
  try {
    const res = await fetch(url, { timeout: 8000 });
    if (expect && expect.status && res.status !== expect.status) return false;
    if (expect && expect.json) {
      const data = await res.json();
      if (expect.fields) {
        for (const field of expect.fields) {
          const value = field.split('.').reduce((o, k) => (o || {})[k], data);
          if (typeof value === 'undefined') return false;
        }
      }
    }
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function checkWs(url) {
  return new Promise((resolve) => {
    try {
      const ws = new (require('ws'))(url, { handshakeTimeout: 8000 });
      ws.on('open', () => {
        ws.terminate();
        resolve(true);
      });
      ws.on('error', () => {
        resolve(false);
      });
      setTimeout(() => {
        ws.terminate();
        resolve(false);
      }, 8000);
    } catch (e) {
      resolve(false);
    }
  });
}

(async () => {
  let report = `# API-Monitoring Report\n\n| Service | Status |\n|---------|--------|\n`;
  let allOk = true;
  for (const ep of endpoints) {
    let ok = false;
    if (ep.type === 'http') ok = await checkHttp(ep.url, ep.expect);
    if (ep.type === 'ws') ok = await checkWs(ep.url);
    report += `| ${ep.name} | ${ok ? '✅ OK' : '❌ Fehler'} |\n`;
    if (!ok) allOk = false;
  }
  fs.writeFileSync('API_STATUS.md', report);
  if (!allOk) {
    console.error('Mindestens eine API ist nicht erreichbar oder liefert unerwartete Daten!');
    process.exit(1);
  }
})();
