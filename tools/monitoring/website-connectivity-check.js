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

    const req = https.get(url, {
      timeout: 15000, // Increase timeout for SSL connections
      headers: {
        'User-Agent': 'BurniToken-Connectivity-Check/1.0'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        domain,
        status: 'HTTPS_OK',
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        sslInfo: res.socket.authorized ? 'SSL_VERIFIED' : 'SSL_UNVERIFIED'
      });
    });

    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      let errorStatus = 'HTTPS_FAILED';
      let errorMessage = err.message;

      // Detect SSL-specific timeouts
      if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
        errorStatus = 'SSL_TIMEOUT';
        errorMessage = `SSL-Verbindungs-Timeout für https://${domain}`;
      } else if (err.code === 'ENOTFOUND') {
        errorStatus = 'DNS_FAILED';
      } else if (err.code === 'ECONNREFUSED') {
        errorStatus = 'CONNECTION_REFUSED';
      }

      resolve({
        domain,
        status: errorStatus,
        error: errorMessage,
        errorCode: err.code,
        responseTime: `${responseTime}ms`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        domain,
        status: 'SSL_TIMEOUT',
        error: `SSL-Verbindungs-Timeout für https://${domain}`,
        responseTime: `${responseTime}ms`
      });
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

  const sslTimeoutDomains = [];
  for (const domain of domains) {
    const httpsResult = await checkHTTPS(domain);
    if (httpsResult.status === 'HTTPS_OK') {
      console.log(`✅ https://${domain} → ${httpsResult.statusCode} (${httpsResult.responseTime}) ${httpsResult.sslInfo || ''}`);
    } else if (httpsResult.status === 'SSL_TIMEOUT') {
      console.log(`⏰ https://${domain} → ${httpsResult.error} (${httpsResult.responseTime})`);
      sslTimeoutDomains.push(domain);
    } else {
      console.log(`❌ https://${domain} → ${httpsResult.error} (${httpsResult.responseTime || 'N/A'})`);
    }
  }

  console.log('\n📋 ZUSAMMENFASSUNG');
  console.log('-'.repeat(30));

  const workingDomains = [];
  const failedDomains = [];

  for (const domain of domains) {
    const dnsResult = await checkDNS(domain);
    const httpsResult = await checkHTTPS(domain);

    if (dnsResult.status === 'DNS_OK' && httpsResult.status === 'HTTPS_OK') {
      workingDomains.push(domain);
    } else {
      failedDomains.push(domain);
    }
  }

  console.log('\n✅ FUNKTIONALE DOMAINS:');
  workingDomains.forEach((domain) => console.log(`   🌐 https://${domain}`));

  console.log('\n❌ NICHT ERREICHBARE DOMAINS:');
  failedDomains.forEach((domain) => console.log(`   🚫 https://${domain}`));

  // Special handling for SSL timeout issues
  if (sslTimeoutDomains.length > 0) {
    console.log('\n⏰ SSL-TIMEOUT PROBLEME:');
    sslTimeoutDomains.forEach((domain) => console.log(`   🔐 https://${domain} - SSL-Verbindungs-Timeout`));
    console.log('\n🔧 EMPFOHLENE MASSNAHMEN:');
    console.log('   1. SSL-Zertifikat Status überprüfen');
    console.log('   2. DNS-Konfiguration validieren');
    console.log('   3. Firewall/CDN Einstellungen prüfen');
    console.log('   4. Netlify SSL-Setup verifizieren');
  }

  if (workingDomains.length > 0) {
    console.log(`\n🎉 IHRE WEBSITE IST ERREICHBAR UNTER:`);
    console.log(`   🚀 https://${workingDomains[0]}`);
  } else {
    console.log('\n🚨 KRITISCH: Keine Domain ist erreichbar!');
    if (sslTimeoutDomains.length > 0) {
      console.log('   ⚠️  SSL-Verbindungsprobleme erkannt - Health Check Script ausführen für Details');
    }
  }
}

runDiagnosis().catch(console.error);
