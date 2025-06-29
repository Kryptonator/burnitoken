// Automatische Website-Erreichbarkeitsdiagnose
// Überprüft alle konfigurierten Domains und GitHub Pages Status

const https = require('https');
const dns = require('dns');

console.log('🌐 WEBSITE ERREICHBARKEITS-DIAGNOSE');
console.log('='.repeat(50));

const domains = ['burnitoken.com', 'burnitoken.website', 'kryptonator.github.io'];

async function checkDNS(domain) {
  return new Promise((resolve) => {
    dns.lookup(domain, (err, address) => {
      if (err) {
        resolve({ domain, status: 'DNS_FAILED', error: err.message });
      } else {
        resolve({ domain, status: 'DNS_OK', ip: address });
      }
    });
  });
}

async function checkHTTPS(domain) {
  return new Promise((resolve) => {
    const url = `https://${domain}`;
    const startTime = Date.now();
    let resolved = false;

    // SSL-specific timeout (shorter for SSL handshake detection)
    const sslTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          domain,
          status: 'SSL_TIMEOUT',
          error: `SSL-Verbindungs-Timeout für https://${domain}`,
          timeout: 'SSL_HANDSHAKE'
        });
      }
    }, 8000);

    const req = https.get(url, (res) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(sslTimeout);
        const responseTime = Date.now() - startTime;
        resolve({
          domain,
          status: 'HTTPS_OK',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
        });
      }
    });

    req.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(sslTimeout);
        
        // Detect SSL-specific errors
        if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || 
            err.message.includes('SSL') || err.message.includes('TLS') ||
            err.code === 'CERT_HAS_EXPIRED' || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          resolve({
            domain,
            status: 'SSL_ERROR',
            error: `SSL-Verbindungs-Timeout für https://${domain}`,
            originalError: err.message,
            code: err.code
          });
        } else {
          resolve({
            domain,
            status: 'HTTPS_FAILED',
            error: err.message,
          });
        }
      }
    });

    req.setTimeout(15000, () => {
      if (!resolved) {
        resolved = true;
        req.destroy();
        clearTimeout(sslTimeout);
        resolve({
          domain,
          status: 'TIMEOUT',
          error: 'Request timeout',
        });
      }
    });
  });
}

async function runDiagnosis() {
  console.log('\n🔍 DNS-AUFLÖSUNG ÜBERPRÜFUNG');
  console.log('-'.repeat(30));

  for (const domain of domains) {
    const dnsResult = await checkDNS(domain);
    if (dnsResult.status === 'DNS_OK') {
      console.log(`✅ ${domain} → ${dnsResult.ip}`);
    } else {
      console.log(`❌ ${domain} → ${dnsResult.error}`);
    }
  }

  console.log('\n🌐 HTTPS-ERREICHBARKEIT ÜBERPRÜFUNG');
  console.log('-'.repeat(30));

  for (const domain of domains) {
    const httpsResult = await checkHTTPS(domain);
    if (httpsResult.status === 'HTTPS_OK') {
      console.log(`✅ https://${domain} → ${httpsResult.statusCode} (${httpsResult.responseTime})`);
    } else if (httpsResult.status === 'SSL_TIMEOUT' || httpsResult.status === 'SSL_ERROR') {
      console.log(`🔴 https://${domain} → SSL-TIMEOUT: ${httpsResult.error}`);
    } else {
      console.log(`❌ https://${domain} → ${httpsResult.error}`);
    }
  }

  console.log('\n📋 ZUSAMMENFASSUNG');
  console.log('-'.repeat(30));

  const workingDomains = [];
  const failedDomains = [];
  const sslTimeoutDomains = [];

  for (const domain of domains) {
    const dnsResult = await checkDNS(domain);
    const httpsResult = await checkHTTPS(domain);

    if (dnsResult.status === 'DNS_OK' && httpsResult.status === 'HTTPS_OK') {
      workingDomains.push(domain);
    } else if (httpsResult.status === 'SSL_TIMEOUT' || httpsResult.status === 'SSL_ERROR') {
      sslTimeoutDomains.push(domain);
      failedDomains.push(domain);
    } else {
      failedDomains.push(domain);
    }
  }

  console.log('\n✅ FUNKTIONALE DOMAINS:');
  workingDomains.forEach((domain) => console.log(`   🌐 https://${domain}`));

  if (sslTimeoutDomains.length > 0) {
    console.log('\n🔴 SSL-TIMEOUT DOMAINS:');
    sslTimeoutDomains.forEach((domain) => console.log(`   ⏰ https://${domain} (SSL-Verbindungs-Timeout)`));
  }

  console.log('\n❌ NICHT ERREICHBARE DOMAINS:');
  failedDomains.filter(domain => !sslTimeoutDomains.includes(domain))
    .forEach((domain) => console.log(`   🚫 https://${domain}`));

  if (workingDomains.length > 0) {
    console.log(`\n🎉 IHRE WEBSITE IST ERREICHBAR UNTER:`);
    console.log(`   🚀 https://${workingDomains[0]}`);
  } else if (sslTimeoutDomains.length > 0) {
    console.log('\n🚨 KRITISCH: SSL-Verbindungs-Timeouts erkannt!');
    console.log('   Überprüfen Sie die SSL-Konfiguration und Zertifikate.');
  } else {
    console.log('\n🚨 KRITISCH: Keine Domain ist erreichbar!');
  }
}

runDiagnosis().catch(console.error);
