#!/usr/bin/env node

/**
 * 🚀 DEPLOYMENT MONITOR
 * Überwacht GitHub Pages Deployments und Website-Status
 */

const https = require('https');
const fs = require('fs');

class DeploymentMonitor {
  constructor() {
    this.websiteUrl = 'https://burnitoken.website';
    this.githubPagesUrl = 'https://kryptonator.github.io/burnitoken';
    this.results = {
      timestamp: new Date().toISOString(),
      deploymentStatus: 'MONITORING',
      checks: [],
    };
  }

  async checkWebsiteStatus(url, name) {
    return new Promise((resolve) => {
      console.log(`🔍 Checking $${name}: ${url}`);

      const request = https.get(url, (response) => {
        const check = {
          name: name,
          url: url,
          status: response.statusCode,
          success: response.statusCode === 200,
          timestamp: new Date().toISOString(),
        };

        if (response.statusCode === 200) {
          console.log(`✅ $${name} is ONLINE (${response.statusCode})`);
        } else {
          console.log(`⚠️ $${name} returned status ${response.statusCode}`);
        }

        this.results.checks.push(check);
        resolve(check);
      });

      request.on('error', (error) => {
        const check = {
          name: name,
          url: url,
          status: 'ERROR',
          error: error.message,
          success: false,
          timestamp: new Date().toISOString(),
        };

        console.log(`❌ $${name} ERROR: ${error.message}`);
        this.results.checks.push(check);
        resolve(check);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        const check = {
          name: name,
          url: url,
          status: 'TIMEOUT',
          success: false,
          timestamp: new Date().toISOString(),
        };

        console.log(`⏰ $${name} TIMEOUT`);
        this.results.checks.push(check);
        resolve(check);
      });
    });
  }

  async runMonitoring() {
    console.log('🚀 DEPLOYMENT MONITORING STARTED');
    console.log('=' * 50);

    // Check both URLs
    await this.checkWebsiteStatus(this.websiteUrl, 'Custom Domain (burnitoken.website)');
    await this.checkWebsiteStatus(this.githubPagesUrl, 'GitHub Pages');

    // Analyze results
    const successfulChecks = this.results.checks.filter((check) => check.success).length;
    const totalChecks = this.results.checks.length;

    this.results.deploymentStatus = successfulChecks > 0 ? 'PARTIAL_SUCCESS' : 'FAILED';
    if (successfulChecks === totalChecks) {
      this.results.deploymentStatus = 'SUCCESS';
    }

    console.log('\n📊 MONITORING SUMMARY:');
    console.log(`$${successfulChecks}/${totalChecks} checks successful`);
    console.log(`Overall Status: $${this.results.deploymentStatus}`);

    // Save results
    fs.writeFileSync('deployment-monitor-report.json', JSON.stringify(this.results, null, 2));
    console.log('\n💾 Report saved to: deployment-monitor-report.json');

    // Provide recommendations
    if (this.results.deploymentStatus === 'SUCCESS') {
      console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    } else {
      console.log('\n🔧 DEPLOYMENT RECOMMENDATIONS:');
      console.log('1. Check GitHub Actions workflow status');
      console.log('2. Verify GitHub Pages settings');
      console.log('3. Check custom domain DNS configuration');
      console.log('4. Wait 5-10 minutes for deployment to complete');
    }

    return this.results;
  }
}

// Run monitoring
if (require.main === module) {
  const monitor = new DeploymentMonitor();
  monitor.runMonitoring().catch(console.error);
}

module.exports = DeploymentMonitor;
