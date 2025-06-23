#!/usr/bin/env node
/**
 * Lighthouse Performance & Core Web Vitals Check
 * Usage: node tools/lighthouse-check.js [url]
 */
const { execSync } = require('child_process');
const url = process.argv[2] || 'http://localhost:8080';

console.log(`Running Lighthouse audit for: ${url}`);

try {
  execSync(`npx lighthouse ${url} --output=json --output-path=./lighthouse-report.json --quiet --chrome-flags=--headless --only-categories=performance,accessibility,seo,best-practices`, { stdio: 'inherit' });
  const report = require('../lighthouse-report.json');
  const perf = report.categories.performance.score * 100;
  const seo = report.categories.seo.score * 100;
  const acc = report.categories.accessibility.score * 100;
  const best = report.categories['best-practices'].score * 100;
  console.log(`Performance: ${perf}\nSEO: ${seo}\nAccessibility: ${acc}\nBest Practices: ${best}`);
  if (perf < 90 || seo < 90 || acc < 90 || best < 90) {
    console.error('Lighthouse check failed: One or more scores below 90.');
    process.exit(1);
  } else {
    console.log('Lighthouse check passed!');
    process.exit(0);
  }
} catch (e) {
  console.error('Lighthouse execution failed:', e.message);
  process.exit(1);
}
