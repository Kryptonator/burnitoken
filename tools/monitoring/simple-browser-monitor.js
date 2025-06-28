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
    let resolved = false;

    // SSL-specific timeout for HTTPS requests
    let sslTimeout;
    if (urlObj.protocol === 'https:') {
      sslTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            url,
            status: 0,
            duration: Date.now() - startTime,
            error: `SSL-Verbindungs-Timeout für ${url}`,
            errorType: 'SSL_TIMEOUT',
            success: false,
          });
        }
      }, 8000); // 8 seconds for SSL handshake
    }

    const req = client.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'BurniToken-Monitor/1.0',
        },
        timeout: 15000,
      },
      (res) => {
        if (!resolved) {
          resolved = true;
          if (sslTimeout) clearTimeout(sslTimeout);
          
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
        }
      },
    );

    req.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        if (sslTimeout) clearTimeout(sslTimeout);
        
        // Detect SSL-specific errors
        const isSSLError = err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || 
                          err.message.includes('SSL') || err.message.includes('TLS') ||
                          err.code === 'CERT_HAS_EXPIRED' || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
        
        resolve({
          url,
          status: 0,
          duration: Date.now() - startTime,
          error: isSSLError ? `SSL-Verbindungs-Timeout für ${url}` : err.message,
          errorType: isSSLError ? 'SSL_ERROR' : 'NETWORK_ERROR',
          originalError: err.message,
          code: err.code,
          success: false,
        });
      }
    });

    req.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        req.destroy();
        if (sslTimeout) clearTimeout(sslTimeout);
        
        resolve({
          url,
          status: 0,
          duration: Date.now() - startTime,
          error: 'Timeout',
          errorType: 'REQUEST_TIMEOUT',
          success: false,
        });
      }
    });

    req.end();
  });
}

async function runMonitoring() {
  console.log('🔍 BurniToken Website Monitoring gestartet...\n');
  console.log('='.repeat(80));

  const results = [];
  let sslTimeoutCount = 0;

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
      if (result.errorType === 'SSL_TIMEOUT' || result.errorType === 'SSL_ERROR') {
        console.log(`   🔴 SSL-Fehler: ${result.error}`);
        sslTimeoutCount++;
      } else {
        console.log(`   Fehler: ${result.error}`);
      }
    }

    console.log('');
  }

  console.log('='.repeat(80));
  
  if (sslTimeoutCount > 0) {
    console.log(`🚨 ${sslTimeoutCount} SSL-Verbindungs-Timeout(s) erkannt!`);
    console.log('   Empfehlung: SSL-Konfiguration und Zertifikate überprüfen');
  }
  
  console.log('✅ Monitoring abgeschlossen');
  
  return results;
}

if (require.main === module) {
  runMonitoring().catch(console.error);
}

module.exports = { testUrl, runMonitoring };
