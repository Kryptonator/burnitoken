/**
 * Test script for XRPL Data Module
 * Tests real-time XRPL data fetching and display
 */

console.log('🧪 Testing XRPL Data Module...');

// Test XRPL API endpoints
async function testXRPLAPIs() {
  const endpoints = [
    'https://livenet.xrpl.org',
    'https://data.ripple.com/v2/ledgers',
    'https://s1.ripple.com:51234',
  ];

  console.log('📡 Testing XRPL API endpoints...');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const startTime = Date.now();

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        console.log(`✅ ${endpoint} - Response: ${response.status}, Time: ${responseTime}ms`);

        // Try to parse JSON if possible
        try {
          const data = await response.json();
          console.log(`📊 Data preview:`, Object.keys(data).slice(0, 3));
        } catch (e) {
          console.log(`📄 Non-JSON response from ${endpoint}`);
        }
      } else {
        console.log(`⚠️ ${endpoint} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

// Test BURNI-specific XRPL data
async function testBURNIData() {
  const burniIssuer = 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2';

  console.log('🔥 Testing BURNI Token data on XRPL...');
  console.log(`BURNI Issuer: ${burniIssuer}`);

  // Test various BURNI-related endpoints
  const burniEndpoints = [
    `https://livenet.xrpl.org/accounts/${burniIssuer}`,
    `https://xrpscan.com/token/${burniIssuer}`,
    `https://bithomp.com/explorer/${burniIssuer}`,
  ];

  for (const endpoint of burniEndpoints) {
    try {
      console.log(`🔍 Checking ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'HEAD', // Just check if the URL exists
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok || response.status === 405) {
        // 405 = Method not allowed, but URL exists
        console.log(`✅ ${endpoint} - Accessible`);
      } else {
        console.log(`⚠️ ${endpoint} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

// Test network statistics calculation
function testNetworkStats() {
  console.log('📈 Testing network statistics calculation...');

  const currentTime = Date.now();
  const baseTransactions = 1800000000;
  const baseAccounts = 5200000;

  const transactionCount = baseTransactions + Math.floor((currentTime / 1000 / 60) * 50);
  const accountCount = baseAccounts + Math.floor(Math.random() * 1000);

  console.log(`📊 Estimated Transactions: ${transactionCount.toLocaleString()}`);
  console.log(`👥 Estimated Accounts: ${accountCount.toLocaleString()}`);

  // Test number formatting
  function formatNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  console.log(`📊 Formatted Transactions: ${formatNumber(transactionCount)}`);
  console.log(`👥 Formatted Accounts: ${formatNumber(accountCount)}`);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting XRPL Data Module Tests...\n');

  await testXRPLAPIs();
  console.log('');

  await testBURNIData();
  console.log('');

  testNetworkStats();
  console.log('');

  console.log('✅ XRPL Data Module Tests Complete!');
}

// Run tests when script is loaded
if (typeof window !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  // Node.js environment
  runAllTests();
}
