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

    const req = https.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        domain,
        status: 'HTTPS_OK',
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      });
    });

    req.on('error', (err) => {
      resolve({
        domain,
        status: 'HTTPS_FAILED',
        error: err.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        domain,
        status: 'TIMEOUT',
        error: 'Request timeout',
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

  for (const domain of domains) {
    const httpsResult = await checkHTTPS(domain);
    if (httpsResult.status === 'HTTPS_OK') {
      console.log(`✅ https://${domain} → ${httpsResult.statusCode} (${httpsResult.responseTime})`);
    } else {
      console.log(`❌ https://${domain} → ${httpsResult.error}`);
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

  if (workingDomains.length > 0) {
    console.log(`\n🎉 IHRE WEBSITE IST ERREICHBAR UNTER:`);
    console.log(`   🚀 https://${workingDomains[0]}`);
  } else {
    console.log('\n🚨 KRITISCH: Keine Domain ist erreichbar!');
  }
}

runDiagnosis().catch(console.error);
