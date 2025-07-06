#!/usr/bin/env node

/**
 * 🌐 DNS Status Checker for burnitoken.website Migration
 * Real-time monitoring während IONOS → Netlify Migration
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class DNSStatusChecker {
  constructor() {
    this.domain = 'burnitoken.website';
    this.expectedNetlifyIP = '75.2.60.5';
    this.expectedNetlifyIPv6 = '2600:1f18:3fff:c001::5';
    this.checkInterval = 30000; // 30 seconds
    this.isRunning = false;
  }

  async checkDNS() {
    console.log(`\n🔍 DNS Check for ${this.domain} - ${new Date().toLocaleTimeString()}`);
    console.log('='.repeat(60));

    try {
      // A Record Check
      await this.checkARecord();

      // AAAA Record Check
      await this.checkAAAARecord();

      // CNAME Check
      await this.checkCNAME();

      // HTTP Response Check
      await this.checkHTTPResponse();

      // Netlify SSL Check
      await this.checkSSL();
    } catch (error) {
      console.error('❌ DNS Check Error:', error.message);
    }
  }

  async checkARecord() {
    try {
      const { stdout } = await execAsync(`nslookup -type=A ${this.domain}`);
      const isNetlify = stdout.includes(this.expectedNetlifyIP);

      console.log(`📍 A Record: ${isNetlify ? '✅ Netlify' : '❌ Not Netlify'}`);
      if (isNetlify) 
        console.log(`   ✅ IP: ${this.expectedNetlifyIP} (Netlify)`);
      } else {
        console.log(`   ❌ Current IP: ${this.extractIP(stdout)}`);
        console.log(`   🎯 Expected: ${this.expectedNetlifyIP}`);
      }

      return isNetlify;
    } catch (error) {
      console.log(`❌ A Record: DNS lookup failed`);
      return false;
    }
  }

  async checkAAAARecord() {
    try {
      const { stdout } = await execAsync(`nslookup -type=AAAA ${this.domain}`);
      const isNetlify = stdout.includes(this.expectedNetlifyIPv6);

      console.log(`📍 AAAA Record: ${isNetlify ? '✅ Netlify' : '❌ Not Netlify'}`);
      if (!isNetlify) {
        console.log(`   🎯 Expected: ${this.expectedNetlifyIPv6}`);
      }

      return isNetlify;
    } catch (error) {
      console.log(`❌ AAAA Record: DNS lookup failed`);
      return false;
    }
  }

  async checkCNAME() {
    try {
      const { stdout } = await execAsync(`nslookup www.${this.domain}`);
      const isNetlify = stdout.includes('netlify.app');

      console.log(`📍 WWW CNAME: ${isNetlify ? '✅ Netlify' : '❌ Not Netlify'}`);

      return isNetlify;
    } catch (error) {
      console.log(`❌ WWW CNAME: DNS lookup failed`);
      return false;
    }
  }

  async checkHTTPResponse() {
    try {
      const { stdout } = await execAsync(`curl -I -s --max-time 10 https://${this.domain}`);
      const isSuccess =
        stdout.includes('200 OK') || stdout.includes('301') || stdout.includes('302');
      const isNetlify = stdout.includes('netlify') || stdout.includes('x-nf-');

      console.log(`🌐 HTTPS Response: ${isSuccess ? '✅ Online' : '❌ Offline'}`);
      if (isNetlify) {
        console.log(`   ✅ Server: Netlify detected`);
      }

      return isSuccess && isNetlify;
    } catch (error) {
      console.log(`❌ HTTPS Response: Connection failed`);
      return false;
    }
  }

  async checkSSL() {
    try {
      const { stdout } = await execAsync(
        `openssl s_client -connect ${this.domain}:443 -servername ${this.domain} < /dev/null 2>/dev/null | openssl x509 -noout -subject 2>/dev/null`,
      );
      const hasSSL = stdout.includes(this.domain);

      console.log(`🔒 SSL Certificate: ${hasSSL ? '✅ Active' : '❌ Not Ready'}`);

      return hasSSL;
    } catch (error) {
      console.log(`🔒 SSL Certificate: ⏳ Not ready or checking failed`);
      return false;
    }
  }

  extractIP(nslookupOutput) {
    const lines = nslookupOutput.split('\n');
    for (const line of lines) {
      if (line.includes('Address:') && !line.includes('#53')) {
        return line.split('Address:')[1].trim();
      }
    }
    return 'Unknown';
  }

  async generateReport() {
    console.log('\n📊 DNS MIGRATION STATUS REPORT');
    console.log('='.repeat(60));

    const checks = {
      aRecord: await this.checkARecord(),
      aaaaRecord: await this.checkAAAARecord(),
      cnameRecord: await this.checkCNAME(),
      httpResponse: await this.checkHTTPResponse(),
      sslCert: await this.checkSSL(),
    };

    const completedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const percentage = Math.round((completedChecks / totalChecks) * 100);

    console.log(`\n🎯 Migration Progress: ${completedChecks}/${totalChecks} (${percentage}%)`);

    if (percentage === 100) {
      console.log('\n🎉 MIGRATION COMPLETE! Website is live on Netlify!');
      console.log(`✅ Visit: https://${this.domain}`);
      return true;
    } else if (percentage >= 60) {
      console.log('\n⏳ Migration in progress... DNS propagating...');
    } else {
      console.log('\n⚠️  Please check IONOS DNS configuration.');
      console.log('📋 Required DNS Records:');
      console.log(`   A:    @ → ${this.expectedNetlifyIP}`);
      console.log(`   AAAA: @ → ${this.expectedNetlifyIPv6}`);
      console.log(`   CNAME: www → endearing-mandazi-d7b985.netlify.app`);
    }

    return false;
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring already running!');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting DNS Migration Monitoring...');
    console.log(`🔄 Checking every ${this.checkInterval / 1000} seconds`);
    console.log('💡 Press Ctrl+C to stop monitoring\n');

    // Initial check
    const isComplete = await this.generateReport();

    if (isComplete) {
      console.log('\n🎉 Migration already complete!');
      this.isRunning = false;
      return;
    }

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      if (!this.isRunning) return;

      const isComplete = await this.generateReport();

      if (isComplete) {
        console.log('\n🎉 Migration completed! Stopping monitor.');
        this.stopMonitoring();
      }
    }, this.checkInterval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\n⏹️  Stopping DNS monitoring...');
      this.stopMonitoring();
      process.exit(0);
    });
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

// CLI Usage
if (require.main === module) {
  const checker = new DNSStatusChecker();

  const args = process.argv.slice(2);

  if (args.includes('--monitor')) {
    checker.startMonitoring();
  } else {
    checker.generateReport();
  }
}

module.exports = DNSStatusChecker;
