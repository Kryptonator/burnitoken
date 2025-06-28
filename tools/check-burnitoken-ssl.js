#!/usr/bin/env node

/**
 * Quick SSL Certificate Check for burnitoken.com
 * 
 * This script specifically checks the SSL certificate status for burnitoken.com
 * and generates the error format expected by the monitoring system.
 */

const WebsiteHealthChecker = require('./website-health-check.js');

class BurnitokenSSLChecker extends WebsiteHealthChecker {
  constructor() {
    super();
    // Only check burnitoken.com domain
    this.domains = ['burnitoken.com'];
  }

  async checkBurnitokenSSL() {
    console.log('🔐 BURNITOKEN.COM SSL CERTIFICATE CHECK');
    console.log('======================================');
    
    const sslResult = await this.checkSSLCertificate('burnitoken.com');
    
    console.log(`\n📊 SSL Status: ${this.getStatusEmoji(sslResult.status)} ${sslResult.status}`);
    
    if (sslResult.expirationDate) {
      console.log(`📅 Expires: ${sslResult.expirationDate.split('T')[0]} (${sslResult.daysUntilExpiration} days)`);
    }
    
    if (sslResult.errorCode) {
      console.log('\n🚨 ALERT GENERATED:');
      const errorReport = this.generateErrorReport(sslResult);
      console.log(JSON.stringify(errorReport, null, 2));
      return errorReport;
    } else {
      console.log('\n✅ No SSL certificate issues detected.');
      return null;
    }
  }
}

// Run the check if called directly
if (require.main === module) {
  const checker = new BurnitokenSSLChecker();
  checker.checkBurnitokenSSL()
    .then(errorReport => {
      if (errorReport) {
        console.log('\n❌ SSL certificate issue detected!');
        process.exit(1);
      } else {
        console.log('\n🎉 SSL certificate is healthy.');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ SSL check failed:', error.message);
      process.exit(1);
    });
}

module.exports = BurnitokenSSLChecker;