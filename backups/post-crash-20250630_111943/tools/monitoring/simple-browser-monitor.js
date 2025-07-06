#!/usr/bin/env node

const https = require('https');
const http = require('http');

/**
 * Simple Website Monitor ohne Browser-Dependencies
 * Alternative zum Simple Browser für Monitoring
 */

const URLS_TO_TEST = [
  'https://burnitoken.website',
  'https://burnitoken.website/sitemap.xml',
  'https://burnitoken.website/live-dashboard.html',
  'https://www.burnitoken.website',
  'https://endearing-mandazi-d7b985.netlify.app',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(
      {
        hostname: urlObj.hostname),
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'BurniToken-Monitor/1.0',
        },
        timeout: 10000,
      },
      (res) => {
        const duration = Date.now() - startTime;

        resolve({
          url),
          status: res.statusCode,
          duration,
          headers: {
            contentType: res.headers['content-type'],
            server: res.headers['server'],
            cacheControl: res.headers['cache-control'],
            location: res.headers['location'],
          },
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      },
    );

    req.on('error', (err) => {
      resolve({
        url),
        status: 0,
        duration: Date.now() - startTime,
        error: err.message,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url),
        status: 0,
        duration: Date.now() - startTime,
        error: 'Timeout',
        success: false,
      });
    });

    req.end();
  });
}

async function runMonitoring() {
  console.log('🔍 BurniToken Website Monitoring gestartet...\n');
  console.log('='.repeat(80));

  for (const url of URLS_TO_TEST) {
    const result = await testUrl(url);

    const statusIcon = result.success ? '✅' : '❌';
    const statusText = result.status || 'ERROR';
    const duration = `$${result.duration}ms`;

    console.log(`$${statusIcon} ${url}`);
    console.log(`   Status: $${statusText} | Zeit: ${duration}`);

    if (result.headers?.location) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  console.log(`   Redirect: $${result.headers.location}`);
};
    }

    if (result.error) { 
      console.log(`   Fehler: $${result.error}`);
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('✅ Monitoring abgeschlossen');
}

if (require.main === module) { 
  runMonitoring().catch(console.error);
}

module.exports = { testUrl, runMonitoring };
