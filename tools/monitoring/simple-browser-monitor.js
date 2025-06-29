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
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'BurniToken-Monitor/1.0',
        },
        timeout: 15000, // Increased timeout for SSL connections
      },
      (res) => {
        const duration = Date.now() - startTime;

        resolve({
          url,
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
      const duration = Date.now() - startTime;
      let errorType = 'GENERAL_ERROR';
      let errorMessage = err.message;

      // Classify SSL-specific errors
      if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
        errorType = 'SSL_TIMEOUT';
        errorMessage = `SSL-Verbindungs-Timeout für ${url}`;
      } else if (err.code === 'ENOTFOUND') {
        errorType = 'DNS_ERROR';
      } else if (err.code === 'ECONNREFUSED') {
        errorType = 'CONNECTION_REFUSED';
      } else if (err.code === 'CERT_HAS_EXPIRED') {
        errorType = 'SSL_CERTIFICATE_EXPIRED';
      } else if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        errorType = 'SSL_VERIFICATION_ERROR';
      }

      resolve({
        url,
        status: 0,
        duration,
        error: errorMessage,
        errorType: errorType,
        errorCode: err.code,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        url,
        status: 0,
        duration,
        error: `SSL-Verbindungs-Timeout für ${url}`,
        errorType: 'SSL_TIMEOUT',
        success: false,
      });
    });

    req.end();
  });
}

async function runMonitoring() {
  console.log('🔍 BurniToken Website Monitoring gestartet...\n');
  console.log('='.repeat(80));

  const sslTimeoutUrls = [];
  const results = [];

  for (const url of URLS_TO_TEST) {
    const result = await testUrl(url);
    results.push(result);

    const statusIcon = result.success ? '✅' : '❌';
    const statusText = result.status || 'ERROR';
    const duration = `${result.duration}ms`;

    console.log(`${statusIcon} ${url}`);
    console.log(`   Status: ${statusText} | Zeit: ${duration}`);

    if (result.headers?.location) {
      console.log(`   Redirect: ${result.headers.location}`);
    }

    if (result.error) {
      console.log(`   Fehler: ${result.error}`);
      
      // Track SSL timeout specifically
      if (result.errorType === 'SSL_TIMEOUT') {
        sslTimeoutUrls.push(url);
        console.log(`   🔐 SSL-Timeout erkannt für: ${url}`);
      } else if (result.errorType) {
        console.log(`   🔍 Fehlertyp: ${result.errorType}`);
      }
    }

    console.log('');
  }

  console.log('='.repeat(80));

  // SSL Timeout Summary
  if (sslTimeoutUrls.length > 0) {
    console.log('⚠️  SSL-TIMEOUT PROBLEME ERKANNT:');
    sslTimeoutUrls.forEach(url => console.log(`   🔐 ${url}`));
    console.log('\n📋 EMPFOHLENE MASSNAHMEN:');
    console.log('   1. Website Health Check ausführen: node tools/monitoring/website-health.js');
    console.log('   2. SSL-Zertifikat Status überprüfen');
    console.log('   3. DNS-Konfiguration validieren');
    console.log('');
  }

  const successfulChecks = results.filter(r => r.success).length;
  const totalChecks = results.length;
  
  console.log(`✅ Monitoring abgeschlossen: ${successfulChecks}/${totalChecks} erfolgreich`);
  
  if (sslTimeoutUrls.length > 0) {
    console.log('⚠️  SSL-Verbindungsprobleme erfordern Aufmerksamkeit!');
  }
}

if (require.main === module) {
  runMonitoring().catch(console.error);
}

module.exports = { testUrl, runMonitoring };
