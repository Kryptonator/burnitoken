// Automatisierter Lighthouse- und Accessibility-Check für burnitoken.com
const { writeFileSync } = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const AxeBuilder = require('@axe-core/webdriverjs');
const { Builder } = require('selenium-webdriver');

(async () => {
  // Lighthouse-Report
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  };
  const runnerResult = await lighthouse('https://burnitoken.com', options);
  writeFileSync('lighthouse-report.html', runnerResult.report);
  console.log('Lighthouse-Report gespeichert: lighthouse-report.html');
  await chrome.kill();

  // Accessibility-Check mit axe-core
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.get('https://burnitoken.com');
  const results = await new AxeBuilder(driver).analyze();
  writeFileSync('axe-accessibility-report.json', JSON.stringify(results, null, 2));
  console.log('Accessibility-Report gespeichert: axe-accessibility-report.json');
  await driver.quit();
})();

/**
 * Führt einen Lighthouse-Audit durch und gibt die wichtigsten Kennzahlen für das Dashboard zurück.
 * @returns {Promise<{status: string, performance: number, accessibility: number, seo: number}>}
 */
async function runLighthouseAudit() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'seo'],
    port: chrome.port,
  };
  const runnerResult = await lighthouse('https://burnitoken.com', options);
  await chrome.kill();

  const categories = runnerResult.lhr.categories;
  return {
    status: (categories.performance.score > 0.9 && categories.accessibility.score > 0.9 && categories.seo.score > 0.9) ? 'GOOD' : 'WARNING',
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    seo: Math.round(categories.seo.score * 100)
  };
}

module.exports = { runLighthouseAudit };
