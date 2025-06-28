#!/usr/bin/env node

/**
 * 🔍 WEBSITE HEALTH CHECK
 * Automatisches Monitoring für SSL-Zertifikate und Website-Status
 * Erkennt abgelaufene Zertifikate und andere kritische Probleme
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

class WebsiteHealthChecker {
  constructor() {
    this.domains = ['burnitoken.com', 'burnitoken.website'];
    this.alerts = [];
  }

  /**
   * Überprüft SSL-Zertifikat auf Ablaufdatum
   */
  async checkSSLCertificate(domain) {
    try {
      console.log(`🔐 Checking SSL certificate for ${domain}...`);

      // SSL-Zertifikat Details abrufen
      const sslCommand = `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null`;
      
      const sslOutput = execSync(sslCommand, {
        encoding: 'utf8',
        timeout: 10000,
      });

      if (!sslOutput) {
        return this.createAlert('E_SSL_CERT_NOT_FOUND', domain, 'SSL-Zertifikat nicht gefunden oder nicht erreichbar');
      }

      // Ablaufdatum extrahieren
      const notAfterMatch = sslOutput.match(/notAfter=(.+)/);
      if (!notAfterMatch) {
        return this.createAlert('E_SSL_CERT_INVALID', domain, 'SSL-Zertifikat-Ablaufdatum konnte nicht ermittelt werden');
      }

      const expiryDate = new Date(notAfterMatch[1]);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      console.log(`   📅 Certificate expires: ${expiryDate.toLocaleDateString('de-DE')}`);
      console.log(`   ⏰ Days until expiry: ${daysUntilExpiry}`);

      // Prüfen ob Zertifikat abgelaufen ist
      if (expiryDate < now) {
        const expiredDate = expiryDate.toISOString().split('T')[0];
        return this.createAlert(
          'E_SSL_CERT_EXPIRED',
          `https://${domain}`,
          `Das SSL-Zertifikat ist am ${expiredDate} abgelaufen.`
        );
      }

      // Warnung bei Ablauf in weniger als 30 Tagen
      if (daysUntilExpiry <= 30) {
        return this.createAlert(
          'E_SSL_CERT_EXPIRING_SOON',
          `https://${domain}`,
          `Das SSL-Zertifikat läuft in ${daysUntilExpiry} Tagen ab.`
        );
      }

      console.log(`   ✅ SSL certificate is valid and not expiring soon`);
      return null;

    } catch (error) {
      console.log(`   ❌ SSL check failed: ${error.message}`);
      return this.createAlert('E_SSL_CHECK_FAILED', domain, `SSL-Überprüfung fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Überprüft HTTPS-Erreichbarkeit
   */
  async checkHTTPSConnectivity(domain) {
    return new Promise((resolve) => {
      console.log(`🌐 Checking HTTPS connectivity for ${domain}...`);

      const request = https.get(`https://${domain}`, { timeout: 10000 }, (response) => {
        console.log(`   ✅ HTTPS ${response.statusCode} - ${domain} is reachable`);
        resolve(null);
      });

      request.on('error', (error) => {
        console.log(`   ❌ HTTPS connection failed: ${error.message}`);
        const alert = this.createAlert(
          'E_HTTPS_CONNECTION_FAILED',
          `https://${domain}`,
          `HTTPS-Verbindung fehlgeschlagen: ${error.message}`
        );
        resolve(alert);
      });

      request.on('timeout', () => {
        request.destroy();
        console.log(`   ⏰ HTTPS connection timeout`);
        const alert = this.createAlert(
          'E_HTTPS_TIMEOUT',
          `https://${domain}`,
          'HTTPS-Verbindung Timeout'
        );
        resolve(alert);
      });
    });
  }

  /**
   * Erstellt einen Alert mit standardisiertem Format
   */
  createAlert(errorCode, url, details) {
    const alert = {
      source: 'tools/website-health-check.js',
      errorCode: errorCode,
      url: url,
      timestamp: new Date().toISOString(),
      details: details
    };
    
    this.alerts.push(alert);
    return alert;
  }

  /**
   * Führt alle Health Checks aus
   */
  async runHealthChecks() {
    console.log('🏥 WEBSITE HEALTH CHECK STARTING...');
    console.log('='.repeat(50));
    console.log(`🕐 ${new Date().toLocaleString('de-DE')}`);
    console.log('');

    for (const domain of this.domains) {
      console.log(`\n🔍 Checking ${domain}:`);
      console.log('-'.repeat(30));

      // SSL-Zertifikat prüfen
      const sslAlert = await this.checkSSLCertificate(domain);
      
      // HTTPS-Erreichbarkeit prüfen (nur wenn SSL ok ist)
      if (!sslAlert || sslAlert.errorCode !== 'E_SSL_CERT_EXPIRED') {
        const httpsAlert = await this.checkHTTPSConnectivity(domain);
      }
    }

    // Ergebnisse zusammenfassen
    this.reportResults();
  }

  /**
   * Berichtet über die Ergebnisse
   */
  reportResults() {
    console.log('\n📊 HEALTH CHECK RESULTS:');
    console.log('='.repeat(50));

    if (this.alerts.length === 0) {
      console.log('✅ All health checks passed - no issues detected');
      return;
    }

    console.log(`⚠️  ${this.alerts.length} issue(s) detected:`);
    console.log('');

    this.alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.errorCode}:`);
      console.log(`   URL: ${alert.url}`);
      console.log(`   Details: ${alert.details}`);
      console.log(`   Time: ${new Date(alert.timestamp).toLocaleString('de-DE')}`);
      console.log('');

      // Kritische Fehler hervorheben
      if (alert.errorCode === 'E_SSL_CERT_EXPIRED') {
        console.log('🚨 KRITISCH: SSL-Zertifikat abgelaufen!');
        console.log('   → Zertifikat muss sofort erneuert werden');
        console.log('   → Website ist möglicherweise nicht sicher erreichbar');
        console.log('');
      }
    });

    // JSON-Report für Automatisierung erstellen
    this.saveReport();
  }

  /**
   * Speichert detaillierten Report als JSON
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalChecks: this.domains.length * 2, // SSL + HTTPS pro Domain
      issuesFound: this.alerts.length,
      status: this.alerts.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
      alerts: this.alerts
    };

    const reportPath = '/tmp/website-health-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);

    // Bei kritischen Problemen auch in Projekt-Root speichern
    if (this.alerts.some(alert => alert.errorCode === 'E_SSL_CERT_EXPIRED')) {
      const criticalReportPath = './website-health-critical-report.json';
      fs.writeFileSync(criticalReportPath, JSON.stringify(report, null, 2));
      console.log(`🚨 Critical report saved: ${criticalReportPath}`);
    }
  }
}

// Script direkt ausführen
if (require.main === module) {
  const checker = new WebsiteHealthChecker();
  checker.runHealthChecks().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = WebsiteHealthChecker;