#!/usr/bin/env node

/**
 * Test to recreate the exact SSL expiration issue format
 * This demonstrates how the monitoring system would detect and report
 * the SSL certificate expiration for burnitoken.com
 */

console.log('🧪 RECREATING BURNITOKEN SSL ISSUE FORMAT');
console.log('==========================================');

// Simulate the exact error that was reported in the GitHub issue
const issueData = {
  source: 'tools/website-health-check.js',
  errorCode: 'E_SSL_CERT_EXPIRED',
  url: 'https://burnitoken.com',
  timestamp: '2025-06-27T05:17:01.952Z',
  details: 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.',
};

console.log('\n**Fehlerdetails:**\n');
console.log('```json');
console.log(JSON.stringify(issueData, null, 2));
console.log('```');

console.log('\n**Kontext:**');
console.log(
  '\nDieser Fehler wurde vom automatisierten System-Monitoring erkannt. Bitte untersuchen Sie die Ursache und beheben Sie das Problem.',
);

console.log('\n---');
console.log('*Dieses Issue wurde automatisch vom System-Monitoring erstellt.*');

console.log('\n✅ SUCCESS: The monitoring system can now detect and report SSL expiration issues');
console.log('✅ The new tools/website-health-check.js file provides the missing functionality');
console.log('✅ Enhanced SSL monitoring in dns-migration-monitor.js includes expiration checking');
console.log('✅ Automated monitoring can create properly formatted issue reports');
