#!/usr/bin/env node
/**
 * OnPage SEO Check Script for BurniToken
 * Checks: Headings, Alt-Texts, Internal Links, Structured Data
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlDir = path.resolve(__dirname, '../');
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

let hasError = false;

function logIssue(file, msg) {
  hasError = true;
  console.error(`[${file}] ${msg}`);
}

function checkHeadings(dom, file) {
  const headings = Array.from(dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (!headings.some(h => h.tagName === 'H1')) {
    logIssue(file, 'No <h1> found.');
  }
  let lastLevel = 0;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (lastLevel && level > lastLevel + 1) {
      logIssue(file, `Heading level jumps from h${lastLevel} to h${level}.`);
    }
    lastLevel = level;
  });
}

function checkAltTexts(dom, file) {
  const imgs = Array.from(dom.window.document.querySelectorAll('img'));
  imgs.forEach(img => {
    if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
      logIssue(file, `<img> missing alt text.`);
    }
  });
}

function checkInternalLinks(dom, file) {
  const links = Array.from(dom.window.document.querySelectorAll('a[href]'));
  const internal = links.filter(a => a.getAttribute('href').startsWith('/') || a.getAttribute('href').startsWith('#'));
  if (internal.length === 0) {
    logIssue(file, 'No internal links found.');
  }
}

function checkStructuredData(dom, file) {
  const ldJson = dom.window.document.querySelector('script[type="application/ld+json"]');
  if (!ldJson) {
    logIssue(file, 'No structured data (ld+json) found.');
  }
}

console.log('Running OnPage SEO Checks...');

htmlFiles.forEach(file => {
  const html = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  const dom = new JSDOM(html);
  checkHeadings(dom, file);
  checkAltTexts(dom, file);
  checkInternalLinks(dom, file);
  checkStructuredData(dom, file);
});

if (hasError) {
  console.error('OnPage SEO checks failed.');
  process.exit(1);
} else {
  console.log('All OnPage SEO checks passed!');
  process.exit(0);
}
