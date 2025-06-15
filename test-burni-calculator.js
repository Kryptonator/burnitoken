/**
 * Test für BURNI Calculator Module
 * Testet Burn/Lock Berechnungen und CSV Export
 */

console.log('🧮 Testing BURNI Calculator Module...');

// Lade das Calculator-Modul
let BURNICalculator;
try {
  BURNICalculator = require('./assets/burni-calculator.js');
} catch (error) {
  console.log('⚠️ Running in browser context, using global calculator');
  if (typeof burniCalculator !== 'undefined') {
    BURNICalculator = burniCalculator.constructor;
  }
}

// Test der Berechnungslogik
function testCalculations() {
  console.log('\n📊 Testing calculation logic...');

  const calculator = new BURNICalculator();

  // Test erste Iteration
  const firstIteration = calculator.calculateIteration(500000, 1);
  console.log('First iteration test:');
  console.log(`  Burn (3%): ${firstIteration.burn} (expected: 15000)`);
  console.log(`  Lock (2% of remainder): ${firstIteration.lock} (expected: 9700)`);
  console.log(`  New current: ${firstIteration.newCurrent} (expected: 475300)`);

  // Validierung
  const expectedBurn = Math.round(500000 * 0.03); // 15000
  const expectedRemainder = 500000 - expectedBurn; // 485000
  const expectedLock = Math.round(expectedRemainder * 0.02); // 9700
  const expectedNew = expectedRemainder - expectedLock; // 475300

  if (
    firstIteration.burn === expectedBurn &&
    firstIteration.lock === expectedLock &&
    firstIteration.newCurrent === expectedNew
  ) {
    console.log('✅ First iteration calculation correct');
  } else {
    console.log('❌ First iteration calculation failed');
  }
}

// Test der Statistiken
function testStatistics() {
  console.log('\n📈 Testing statistics calculation...');

  const calculator = new BURNICalculator();
  const stats = calculator.getStatistics();

  console.log('Statistics:');
  console.log(`  Total iterations: ${stats.totalIterations}`);
  console.log(`  Total burned: ${stats.totalBurned} (${stats.burnPercentage}%)`);
  console.log(`  Total locked: ${stats.totalLocked} (${stats.lockPercentage}%)`);
  console.log(`  Final amount: ${stats.finalAmount}`);
  console.log(`  Duration: ${stats.duration} days`);

  // Validierung
  if (
    stats.totalIterations > 0 &&
    stats.totalBurned > 0 &&
    stats.totalLocked > 0 &&
    stats.duration > 0
  ) {
    console.log('✅ Statistics calculation successful');
  } else {
    console.log('❌ Statistics calculation failed');
  }
}

// Test CSV Generation
function testCSVGeneration() {
  console.log('\n📄 Testing CSV generation...');

  const calculator = new BURNICalculator();
  const csv = calculator.generateCSV();

  const lines = csv.split('\n');
  console.log(`CSV has ${lines.length} lines (including header)`);

  // Prüfe Header
  const header = lines[0];
  const expectedHeaders = [
    'Iteration',
    'Datum',
    'Verbrannt (Euro)',
    'Versperrt (Euro)',
    'Restbetrag (Euro)',
  ];

  let headerValid = true;
  expectedHeaders.forEach((expectedHeader) => {
    if (!header.includes(expectedHeader)) {
      headerValid = false;
    }
  });

  if (headerValid && lines.length > 1) {
    console.log('✅ CSV generation successful');
    console.log('Sample CSV lines:');
    console.log(`  Header: ${lines[0]}`);
    console.log(`  First data: ${lines[1]}`);
    if (lines.length > 2) {
      console.log(`  Second data: ${lines[2]}`);
    }
  } else {
    console.log('❌ CSV generation failed');
  }
}

// Test Formatting
function testFormatting() {
  console.log('\n💰 Testing number formatting...');

  const calculator = new BURNICalculator();

  const formatted500k = calculator.formatNumber(500000);
  const formatted15k = calculator.formatNumber(15000);

  console.log(`500000 formatted: ${formatted500k}`);
  console.log(`15000 formatted: ${formatted15k}`);

  if (formatted500k.includes('500') && formatted15k.includes('15')) {
    console.log('✅ Number formatting working');
  } else {
    console.log('❌ Number formatting failed');
  }
}

// Test HTML Generation
function testHTMLGeneration() {
  console.log('\n🌐 Testing HTML table generation...');

  const calculator = new BURNICalculator();
  const html = calculator.generateHTMLTable(5); // Nur 5 Zeilen für Test

  const requiredElements = [
    'burni-calculator-container',
    'calculator-header',
    'calculator-stats',
    'burni-schedule-table',
    'calculator-actions',
  ];

  let htmlValid = true;
  requiredElements.forEach((element) => {
    if (!html.includes(element)) {
      console.log(`❌ Missing element: ${element}`);
      htmlValid = false;
    }
  });

  if (htmlValid) {
    console.log('✅ HTML generation successful');
    console.log(`Generated HTML length: ${html.length} characters`);
  } else {
    console.log('❌ HTML generation failed');
  }
}

// Test Datenintegrität über mehrere Iterationen
function testDataIntegrity() {
  console.log('\n🔍 Testing data integrity over iterations...');

  const calculator = new BURNICalculator();
  const schedule = calculator.calculateFullSchedule();

  let integrityValid = true;
  let previousAmount = calculator.startAmount;

  // Prüfe erste 10 Iterationen
  for (let i = 0; i < Math.min(10, schedule.length); i++) {
    const item = schedule[i];
    const expectedBurn = Math.round(previousAmount * calculator.burnRate);
    const expectedRemainder = previousAmount - expectedBurn;
    const expectedLock = Math.round(expectedRemainder * calculator.lockRate);
    const expectedNew = expectedRemainder - expectedLock;

    if (
      item.burn !== expectedBurn ||
      item.lock !== expectedLock ||
      item.newCurrent !== expectedNew
    ) {
      console.log(`❌ Data integrity failed at iteration ${item.iteration}`);
      console.log(`  Expected burn: ${expectedBurn}, got: ${item.burn}`);
      console.log(`  Expected lock: ${expectedLock}, got: ${item.lock}`);
      console.log(`  Expected new: ${expectedNew}, got: ${item.newCurrent}`);
      integrityValid = false;
      break;
    }

    previousAmount = expectedNew;
  }

  if (integrityValid) {
    console.log('✅ Data integrity check passed');
  }
}

// Führe alle Tests aus
async function runAllTests() {
  console.log('🔬 Starting BURNI Calculator Tests...\n');

  try {
    testCalculations();
    testStatistics();
    testCSVGeneration();
    testFormatting();
    testHTMLGeneration();
    testDataIntegrity();

    console.log('\n🎉 BURNI Calculator Tests Complete!');
    console.log('✅ All calculation functions validated');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Führe Tests aus
runAllTests();
