#!/usr/bin/env node

/**
 * BurniToken Website Health Check Tool
 *
 * Überwacht die Website-Gesundheit einschließlich SSL-Zertifikatsstatus
 * und erstellt automatische Berichte bei Problemen.
 *
 * Verwendung:
 *   node tools/website-health-check.js
 *
 * Features:
 * - SSL Certificate Expiration Check
 * - Automatische Issue-Erstellung bei Problemen
 * - JSON-Fehlerberichterstattung
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

class WebsiteHealthChecker {
  constructor(url = 'https://burnitoken.com') {
    this.url = url;
    this.domain = url.replace(/^https?:\/\//, '');
    this.issues = [];
  }

  /**
   * Überprüft das SSL-Zertifikat auf Ablaufdatum
   */
  async checkSSLCertificateExpiration() {
    return new Promise((resolve) => {
      console.log('🔐 SSL Certificate Expiration Check...');
      
      try {
        const url = new URL(this.url);
        const options = {
          hostname: url.hostname,
          port: 443,
          method: 'GET',
          timeout: 10000,
          rejectUnauthorized: false, // We want to check even expired certs
        };

        const req = https.request(options, (res) => {
          const cert = res.socket.getPeerCertificate();
          
          if (!cert || !cert.valid_to) {
            this.reportIssue('E_SSL_CERT_INFO_UNAVAILABLE', 'SSL-Zertifikat-Informationen nicht verfügbar');
            console.log('   ❌ SSL: Zertifikat-Informationen nicht verfügbar');
            resolve(false);
            return;
          }

          const endDate = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          console.log(`   📅 SSL-Zertifikat läuft ab: ${endDate.toLocaleDateString('de-DE')}`);
          console.log(`   ⏰ Tage bis Ablauf: ${daysUntilExpiry}`);

          // Prüfe ob Zertifikat bereits abgelaufen ist
          if (endDate < now) {
            const expiredDays = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
            this.reportIssue(
              'E_SSL_CERT_EXPIRED',
              `Das SSL-Zertifikat ist am ${endDate.toLocaleDateString('de-DE')} abgelaufen.`,
              {
                expiryDate: endDate.toISOString().split('T')[0],
                expiredDays: expiredDays
              }
            );
            console.log(`   ❌ SSL: Zertifikat ist seit ${expiredDays} Tag(en) abgelaufen!`);
            resolve(false);
            return;
          }

          // Warne bei Ablauf in den nächsten 7 Tagen
          if (daysUntilExpiry <= 7) {
            this.reportIssue(
              'E_SSL_CERT_EXPIRING_SOON',
              `Das SSL-Zertifikat läuft in ${daysUntilExpiry} Tag(en) ab.`,
              {
                expiryDate: endDate.toISOString().split('T')[0],
                daysUntilExpiry: daysUntilExpiry
              }
            );
            console.log(`   ⚠️  SSL: Zertifikat läuft bald ab (${daysUntilExpiry} Tage)!`);
            resolve(false);
            return;
          }

          console.log(`   ✅ SSL: Zertifikat ist gültig für weitere ${daysUntilExpiry} Tage`);
          resolve(true);
        });

        req.on('error', (error) => {
          this.reportIssue('E_SSL_CHECK_FAILED', `SSL-Überprüfung fehlgeschlagen: ${error.message}`);
          console.log(`   ❌ SSL Check Error: ${error.message}`);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          this.reportIssue('E_SSL_CHECK_TIMEOUT', 'SSL-Überprüfung Timeout');
          console.log(`   ❌ SSL Check Timeout`);
          resolve(false);
        });

        req.end();

      } catch (error) {
        this.reportIssue('E_SSL_CHECK_FAILED', `SSL-Überprüfung fehlgeschlagen: ${error.message}`);
        console.log(`   ❌ SSL Check Error: ${error.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Überprüft die allgemeine Website-Erreichbarkeit
   */
  async checkWebsiteAccessibility() {
    return new Promise((resolve) => {
      console.log('🌐 Website Accessibility Check...');
      
      try {
        const url = new URL(this.url);
        const startTime = Date.now();
        
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname,
          method: 'HEAD',
          timeout: 10000,
        };

        const protocol = url.protocol === 'https:' ? https : require('http');
        
        const req = protocol.request(options, (res) => {
          const responseTime = Date.now() - startTime;
          const statusCode = res.statusCode;

          console.log(`   📊 HTTP Status: ${statusCode}`);
          console.log(`   ⏱️  Response Time: ${responseTime}ms`);

          if (statusCode < 200 || statusCode >= 400) {
            this.reportIssue('E_WEBSITE_UNREACHABLE', `Website nicht erreichbar (HTTP ${statusCode})`);
            console.log(`   ❌ Website: HTTP ${statusCode} - Nicht erreichbar`);
            resolve(false);
            return;
          }

          if (responseTime > 5000) {
            this.reportIssue('E_WEBSITE_SLOW', `Website reagiert langsam (${responseTime}ms)`);
            console.log(`   ⚠️  Website: Langsame Antwortzeit (${responseTime}ms)`);
          }

          console.log(`   ✅ Website: Erreichbar und funktionsfähig`);
          resolve(true);
        });

        req.on('error', (error) => {
          this.reportIssue('E_WEBSITE_CHECK_FAILED', `Website-Überprüfung fehlgeschlagen: ${error.message}`);
          console.log(`   ❌ Website Check Error: ${error.message}`);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          this.reportIssue('E_WEBSITE_TIMEOUT', 'Website-Überprüfung Timeout');
          console.log(`   ❌ Website Check Timeout`);
          resolve(false);
        });

        req.end();

      } catch (error) {
        this.reportIssue('E_WEBSITE_CHECK_FAILED', `Website-Überprüfung fehlgeschlagen: ${error.message}`);
        console.log(`   ❌ Website Check Error: ${error.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Meldet ein Problem im JSON-Format
   */
  reportIssue(errorCode, details, additionalData = {}) {
    const issue = {
      source: 'tools/website-health-check.js',
      errorCode: errorCode,
      url: this.url,
      timestamp: new Date().toISOString(),
      details: details,
      ...additionalData
    };
    
    this.issues.push(issue);
  }

  /**
   * Führt alle Health Checks durch
   */
  async performHealthCheck() {
    console.log('🏥 BurniToken Website Health Check');
    console.log('==================================');
    console.log(`🎯 Target: ${this.url}\n`);

    const results = {
      sslCheck: await this.checkSSLCertificateExpiration(),
      accessibilityCheck: await this.checkWebsiteAccessibility()
    };

    return results;
  }

  /**
   * Gibt einen Bericht über gefundene Probleme aus
   */
  generateReport() {
    console.log('\n📋 Health Check Report');
    console.log('======================');

    if (this.issues.length === 0) {
      console.log('✅ Keine Probleme gefunden - Website ist gesund!');
      return { status: 'healthy', issues: [] };
    }

    console.log(`❌ ${this.issues.length} Problem(e) gefunden:\n`);

    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.errorCode}: ${issue.details}`);
      console.log(JSON.stringify(issue, null, 2));
      console.log('');
    });

    return { status: 'unhealthy', issues: this.issues };
  }

  /**
   * Speichert den Bericht in einer Datei
   */
  saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `health-check-report-${timestamp}.json`;
    const filepath = path.join('/tmp', filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Bericht gespeichert: ${filepath}`);

    return filepath;
  }
}

// CLI Ausführung
async function main() {
  const checker = new WebsiteHealthChecker();
  
  try {
    await checker.performHealthCheck();
    const report = checker.generateReport();
    
    if (report.status === 'unhealthy') {
      checker.saveReport(report);
      process.exit(1); // Exit mit Fehlercode bei Problemen
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ Health Check Failed: ${error.message}`);
    process.exit(1);
  }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
  main();
}

module.exports = WebsiteHealthChecker;