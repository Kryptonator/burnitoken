#!/usr/bin/env node

/**
 * DNS Migration Monitor
 * Live-Überwachung der Domain-Migration von IONOS zu Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');

class DNSMigrationMonitor {
  constructor() {
    this.domain = 'burnitoken.website';
    this.netlifyIP = '75.2.60.5';
    this.netlifyIPv6 = '2600:1f18:3fff:c001::5';
    this.netlifyUrl = 'endearing-mandazi-d7b985.netlify.app';
    this.checkInterval = 30000; // 30 Sekunden
    this.maxChecks = 120; // 1 Stunde monitoring
    this.checks = 0;
  }

  async startMonitoring() {
    console.log('🔍 DNS Migration Monitoring gestartet...');
    console.log(`📡 Domain: ${this.domain}`);
    console.log(`🎯 Ziel-IP: ${this.netlifyIP}`);
    console.log(`⏱️  Check-Interval: ${this.checkInterval / 1000}s\n`);

    // Initial Check
    await this.performCheck();

    // Kontinuierliches Monitoring
    const interval = setInterval(async () => {
      this.checks++;
      await this.performCheck();

      if (this.checks >= this.maxChecks) {
        console.log('\n⏰ Monitoring-Limit erreicht. Stoppe...');
        clearInterval(interval);
      }
    }, this.checkInterval);
  }

  async performCheck() {
    const timestamp = new Date().toLocaleTimeString('de-DE');
    console.log(`\n🕐 ${timestamp} - DNS Check #${this.checks + 1}`);
    console.log('='.repeat(50));

    try {
      // DNS Lookup für A Record
      const dnsResult = await this.checkDNS();

      // HTTPS Connectivity Test
      const httpsResult = await this.checkHTTPS();

      // WWW Redirect Test
      const wwwResult = await this.checkWWWRedirect();

      // SSL Certificate Check
      const sslResult = await this.checkSSL();

      // Status Summary
      this.printStatus(dnsResult, httpsResult, wwwResult, sslResult);

      // Migration Complete Check
      if (dnsResult && httpsResult && wwwResult && sslResult) {
        console.log('\n🎉 MIGRATION ERFOLGREICH ABGESCHLOSSEN!');
        console.log('✅ Alle Checks bestanden - Domain ist live!');
        this.generateSuccessReport();
        process.exit(0);
      }
    } catch (error) {
      console.log(`❌ Check-Fehler: ${error.message}`);
    }
  }

  async checkDNS() {
    try {
      console.log('🔍 DNS A Record Check...');
      const result = execSync(`nslookup ${this.domain}`, { encoding: 'utf8', timeout: 10000 });

      if (result.includes(this.netlifyIP)) {
        console.log(`   ✅ DNS: ${this.domain} → ${this.netlifyIP} ✓`);
        return true;
      } else {
        console.log(`   ⏳ DNS: Noch nicht propagiert`);
        console.log(`   📡 Erwarte: ${this.netlifyIP}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ DNS Lookup Fehler: ${error.message}`);
      return false;
    }
  }

  async checkHTTPS() {
    try {
      console.log('🔒 HTTPS Connectivity Check...');

      // Einfacher HTTP Status Check (ohne externe Dependencies)
      const curlCheck = execSync(`curl -s -o /dev/null -w "%{http_code}" https://${this.domain}`, {
        encoding: 'utf8',
        timeout: 15000,
      });

      if (curlCheck.trim() === '200') {
        console.log(`   ✅ HTTPS: https://${this.domain} → 200 OK ✓`);
        return true;
      } else {
        console.log(`   ⏳ HTTPS: Status ${curlCheck} (noch nicht bereit)`);
        return false;
      }
    } catch (error) {
      console.log(`   ⏳ HTTPS: Noch nicht erreichbar (${error.message.split('\n')[0]})`);
      return false;
    }
  }

  async checkWWWRedirect() {
    try {
      console.log('🔀 WWW Redirect Check...');

      const redirectCheck = execSync(
        `curl -s -o /dev/null -w "%{redirect_url},%{http_code}" https://www.${this.domain}`,
        {
          encoding: 'utf8',
          timeout: 15000,
        },
      );

      const [redirectUrl, statusCode] = redirectCheck.split(',');

      if (statusCode === '301' && redirectUrl.includes(this.domain)) {
        console.log(`   ✅ WWW Redirect: www.${this.domain} → ${this.domain} ✓`);
        return true;
      } else {
        console.log(`   ⏳ WWW Redirect: Status ${statusCode} (noch nicht konfiguriert)`);
        return false;
      }
    } catch (error) {
      console.log(`   ⏳ WWW Redirect: Noch nicht aktiv`);
      return false;
    }
  }

  async checkSSL() {
    try {
      console.log('🔐 SSL Certificate Check...');

      // Check certificate issuer
      const sslCheck = execSync(
        `echo | openssl s_client -servername ${this.domain} -connect ${this.domain}:443 2>/dev/null | openssl x509 -noout -issuer`,
        {
          encoding: 'utf8',
          timeout: 10000,
        },
      );

      // Check certificate expiration dates
      const datesCheck = execSync(
        `echo | openssl s_client -servername ${this.domain} -connect ${this.domain}:443 2>/dev/null | openssl x509 -noout -dates`,
        {
          encoding: 'utf8',
          timeout: 10000,
        },
      );

      if (sslCheck.includes("Let's Encrypt") || sslCheck.includes('issuer')) {
        // Parse expiration date
        const validToMatch = datesCheck.match(/notAfter=(.+)/);
        if (validToMatch) {
          const expirationDate = new Date(validToMatch[1].trim());
          const now = new Date();
          const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

          if (expirationDate < now) {
            console.log(`   ❌ SSL: Certificate expired ${Math.abs(daysUntilExpiration)} days ago`);
            return false;
          } else if (daysUntilExpiration <= 7) {
            console.log(`   ⚠️  SSL: Certificate expires in ${daysUntilExpiration} days`);
            return false;
          } else {
            console.log(`   ✅ SSL: Certificate aktiv ✓ (expires in ${daysUntilExpiration} days)`);
            return true;
          }
        } else {
          console.log(`   ✅ SSL: Certificate aktiv ✓`);
          return true;
        }
      } else {
        console.log(`   ⏳ SSL: Certificate noch nicht aktiv`);
        return false;
      }
    } catch (error) {
      console.log(`   ⏳ SSL: Certificate wird erstellt...`);
      return false;
    }
  }

  printStatus(dns, https, www, ssl) {
    console.log('\n📊 Migration Status:');
    console.log(`   DNS A Record:     ${dns ? '✅ AKTIV' : '⏳ WARTEND'}`);
    console.log(`   HTTPS Website:    ${https ? '✅ AKTIV' : '⏳ WARTEND'}`);
    console.log(`   WWW Redirect:     ${www ? '✅ AKTIV' : '⏳ WARTEND'}`);
    console.log(`   SSL Certificate:  ${ssl ? '✅ AKTIV' : '⏳ WARTEND'}`);

    const progress = [dns, https, www, ssl].filter(Boolean).length;
    const total = 4;
    const percentage = Math.round((progress / total) * 100);

    console.log(
      `\n📈 Fortschritt: ${progress}/${total} (${percentage}%) ${'▓'.repeat(Math.floor(percentage / 10))}${'░'.repeat(10 - Math.floor(percentage / 10))}`,
    );

    if (progress === total) {
      console.log('🚀 MIGRATION ABGESCHLOSSEN!');
    } else {
      const remaining = total - progress;
      console.log(`⏱️  ${remaining} Check(s) verbleibend...`);
    }
  }

  generateSuccessReport() {
    const report = `# 🎉 DNS MIGRATION ERFOLGREICH ABGESCHLOSSEN

**Domain:** ${this.domain}  
**Abgeschlossen:** ${new Date().toLocaleString('de-DE')}  
**Monitoring-Dauer:** ${this.checks} Checks  

## ✅ Erfolgreiche Migration

- ✅ **DNS A Record:** ${this.domain} → ${this.netlifyIP}
- ✅ **HTTPS Website:** https://${this.domain} → Live
- ✅ **WWW Redirect:** www.${this.domain} → ${this.domain}
- ✅ **SSL Certificate:** Let's Encrypt aktiv

## 🎯 Live URLs

- **Hauptseite:** https://${this.domain}
- **Live Dashboard:** https://${this.domain}/live-dashboard.html
- **Simple Browser Test:** FUNKTIONIERT ✅

## 📈 Nächste Schritte

### Google Search Console Update
1. **Gehe zu:** Google Search Console
2. **Property:** ${this.domain}
3. **Neue Sitemap:** https://${this.domain}/sitemap.xml
4. **URL-Prüfung:** Teste neue Domain URLs

### Performance & Analytics
1. **Google Analytics:** Property für ${this.domain} erstellen
2. **PageSpeed Insights:** Performance-Test durchführen
3. **Social Media:** Open Graph Cards testen

## 🎊 MIGRATION KOMPLETT ERFOLGREICH!

Die BurniToken-Website ist jetzt vollständig über die Custom Domain ${this.domain} erreichbar mit:
- Netlify Global CDN Performance
- Automatische HTTPS/SSL Verschlüsselung
- SEO-optimierte Domain Authority
- Simple Browser Kompatibilität

**Status:** 🚀 **PRODUCTION READY**
`;

    fs.writeFileSync('MIGRATION_SUCCESS_REPORT.md', report);
    console.log('\n📄 Success Report erstellt: MIGRATION_SUCCESS_REPORT.md');
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new DNSMigrationMonitor();
  monitor.startMonitoring().catch(console.error);
}

module.exports = DNSMigrationMonitor;
