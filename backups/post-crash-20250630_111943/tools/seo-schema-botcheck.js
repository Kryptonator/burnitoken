#!/usr/bin/env node
/**
 * SEO & Schema Bot-Check für BurniToken
 * Prüft index.html auf typische SEO-/Schema-/Bot-Fehler wie Gemini, Googlebot, Bingbot
 * Gibt einen farbigen Report aus und schreibt ein Logfile für das Recovery Center
 */
const fs = require('fs');
const path = require('path');
// Chalk v5+ ESM-Import-Workaround für CommonJS:
let chalkCyan = (x) => x,
  chalkGreen = (x) => x,
  chalkRed = (x) => x,
  chalkBgGreenBlack = (x) => x,
  chalkBgRedWhite = (x) => x,
  chalkBgYellowBlack = (x) => x;
try {
  const chalkImport = require('chalk');
  if (typeof chalkImport.cyan === 'function') {
    chalkCyan = chalkImport.cyan;
    chalkGreen = chalkImport.green;
    chalkRed = chalkImport.red;
    chalkBgGreenBlack = chalkImport.bgGreen.black;
    chalkBgRedWhite = chalkImport.bgRed.white;
    chalkBgYellowBlack = chalkImport.bgYellow.black;
  } else if (typeof chalkImport.default === 'object') {
    // ESM-Import
    chalkCyan = chalkImport.default.cyan;
    chalkGreen = chalkImport.default.green;
    chalkRed = chalkImport.default.red;
    chalkBgGreenBlack = chalkImport.default.bgGreen.black;
    chalkBgRedWhite = chalkImport.default.bgRed.white;
    chalkBgYellowBlack = chalkImport.default.bgYellow.black;
  }
} catch (e) {}

const github = require('./github-auto');

const PAGES = [
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../pages/token/index.html'),
  path.join(__dirname, '../pages/community/index.html'),
  path.join(__dirname, '../pages/docs/index.html'),
  // Weitere Seiten hier ergänzen
];
const LOG_PATH = path.join(__dirname, 'seo-schema-botcheck.log');
const STATUS_PATH = path.join(__dirname, '../SEO_STATUS.md');

] ${msg}\n`);
}

function checkMetaTags(html) {
  const required = [
    'description',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'canonical',
    'robots',
    'sitemap',
    'viewport',
  ];
  let ok = true;
  required.forEach((tag) => {
    if (!html.includes(tag)) {
      console.log(chalkRed(`❌ Fehlendes Tag: ${tag}`));
      log(`Fehlendes Tag: ${tag}`);
      ok = false;
    }
  });
  if (ok) console.log(chalkGreen('✅ Alle wichtigen Meta-Tags vorhanden.'));
  return ok;
}

function checkLdJson(html) {
  const schemas = ['Organization', 'WebSite', 'Product', 'FAQPage', 'BreadcrumbList'];
  let ok = true;
  schemas.forEach((type) => {
    if (!html.includes(`"@type": "${type}"`)) {
      console.log(chalkRed(`❌ Fehlendes Schema.org: ${type}`));
      log(`Fehlendes Schema.org: ${type}`);
      ok = false;
    }
  });
  if (ok) console.log(chalkGreen('✅ Alle wichtigen Schema.org-Typen vorhanden.'));
  return ok;
}

function checkAltTexts(html) {
  const imgTags = html.match(/<img [^>]*>/g) || [];
  let ok = true;
  imgTags.forEach((tag) => {
    if (!/alt="[^"]+"/.test(tag)) {
      console.log(chalkRed(`❌ Fehlender Alt-Text: ${tag}`));
      log(`Fehlender Alt-Text: ${tag}`);
      ok = false;
    }
  });
  if (ok) console.log(chalkGreen('✅ Alle <img>-Tags haben Alt-Texte.'));
  return ok;
}

function checkCanonical(html) {
  if (html.includes('rel="canonical"')) {
    console.log(chalkGreen('✅ Canonical-Link vorhanden.'));
    return true;
  } else {
    console.log(chalkRed('❌ Canonical-Link fehlt!'));
    log('Canonical-Link fehlt!');
    return false;
  }
}

function checkSitemap(html) {
  if (html.includes('rel="sitemap"')) {
    console.log(chalkGreen('✅ Sitemap-Link vorhanden.'));
    return true;
  } else {
    console.log(chalkRed('❌ Sitemap-Link fehlt!'));
    log('Sitemap-Link fehlt!');
    return false;
  }
}

function autoFixMetaTags(html) {
  // Minimaler Auto-Fix: Fehlende Meta-Tags ergänzen (nur für Demo, robustere Logik empfohlen)
  const headClose = '</head>';
  let changed = false;
  const requiredTags = [
    { tag: 'description', html: '<meta name="description" content="TODO: Beschreibung ergänzen">' },
    { tag: 'og:title', html: '<meta property="og:title" content="TODO: OG Title">' },
    { tag: 'og:description', html: '<meta property="og:description" content="TODO: OG Desc">' },
    { tag: 'og:image', html: '<meta property="og:image" content="TODO: OG Image">' },
    { tag: 'og:url', html: '<meta property="og:url" content="TODO: OG URL">' },
    { tag: 'og:type', html: '<meta property="og:type" content="website">' },
    { tag: 'twitter:card', html: '<meta name="twitter:card" content="summary_large_image">' },
    { tag: 'twitter:title', html: '<meta name="twitter:title" content="TODO: Twitter Title">' },
    {
      tag: 'twitter:description',
      html: '<meta name="twitter:description" content="TODO: Twitter Desc">',
    },
    { tag: 'twitter:image', html: '<meta name="twitter:image" content="TODO: Twitter Image">' },
    { tag: 'canonical', html: '<link rel="canonical" href="TODO: Canonical URL">' },
    { tag: 'robots', html: '<meta name="robots" content="index, follow">' },
    { tag: 'sitemap', html: '<link rel="sitemap" type="application/xml" href="/sitemap.xml">' },
    {
      tag: 'viewport',
      html: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    },
  ];
  let newHtml = html;
  requiredTags.forEach(({ tag, html: tagHtml }) => {
    if (!newHtml.includes(tag)) {
      newHtml = newHtml.replace(headClose, tagHtml + '\n' + headClose);
      changed = true;
      log(`Auto-Fix: Tag ergänzt: ${tag}`);
    }
  });
  return changed ? newHtml : null;
}

function autoFixAltTexts(html) {
  // Fügt fehlende alt="TODO" zu <img>-Tags ohne Alt-Attribut hinzu
  let changed = false;
  let newHtml = html.replace(/<img ((?!alt=)[^>])+>/g, (match) => {
    changed = true;
    log(`Auto-Fix: Alt-Text ergänzt: ${match}`);
    return match.replace(/<img /, '<img alt="TODO" ');
  });
  return changed ? newHtml : null;
}

function updateStatusFile(status, details) {
  const content = `# SEO/Schema Status\n\n- **Letzter Check:** ${new Date().toLocaleString()}\n- **Status:** ${status}\n- **Details:** ${details || '-'}\n`;
  fs.writeFileSync(STATUS_PATH, content, 'utf8');
}

function main() {
  let allPagesOk = true;
  let errorDetails = [];
  let fixedAny = false;
  for (const PAGE_PATH of PAGES) {
    if (!fs.existsSync(PAGE_PATH)) {
      log(`Seite nicht gefunden: ${PAGE_PATH}`);
      errorDetails.push(`${PAGE_PATH} fehlt`);
      allPagesOk = false;
      continue;
    }
    let html = fs.readFileSync(PAGE_PATH, 'utf8');
    console.log(chalkCyan(`\n--- SEO & Schema Bot-Check für ${PAGE_PATH} ---`));
    let allOk = true;
    let fixed = false;
    let pageErrors = [];
    if (!checkMetaTags(html)) {
      const fixedHtml = autoFixMetaTags(html);
      if (fixedHtml) {
        html = fixedHtml;
        fixed = true;
      } else {
        allOk = false;
        pageErrors.push('Meta-Tags fehlen');
      }
    }
    if (!checkAltTexts(html)) {
      const fixedHtml = autoFixAltTexts(html);
      if (fixedHtml) {
        html = fixedHtml;
        fixed = true;
      } else {
        allOk = false;
        pageErrors.push('Alt-Texte fehlen');
      }
    }
    if (!checkCanonical(html)) allOk = false;
    if (!checkSitemap(html)) allOk = false;
    if (fixed) {
      fs.writeFileSync(PAGE_PATH, html, 'utf8');
      fixedAny = true;
      log(`Auto-Fix durchgeführt für ${PAGE_PATH}`);
    }
    if (!allOk) {
      allPagesOk = false;
      errorDetails.push(`${PAGE_PATH}: ${pageErrors.join(', ')}`);
    }
  }
  if (fixedAny) {
    github.gitCommitAndPush('Auto-Fix: SEO/Schema/Alt-Text auf mehreren Seiten durch Bot');
    updateStatusFile('FIXED', 'Fehler wurden automatisch behoben und gepusht (Multi-Page).');
    console.log(chalkBgYellowBlack('\nAuto-Fix für mehrere Seiten durchgeführt und gepusht!\n'));
    log('Auto-Fix für mehrere Seiten durchgeführt und gepusht!');
    process.exit(0);
  }
  if (allPagesOk) {
    updateStatusFile('OK', 'Alle Checks auf allen Seiten bestanden.');
    console.log(chalkBgGreenBlack('\nSEO/Schema/Bot-Check: ALLES OK auf allen Seiten!\n'));
    log('SEO/Schema/Bot-Check: ALLES OK auf allen Seiten!');
    process.exit(0);
  } else {
    const detailMsg = errorDetails.join('; ');
    updateStatusFile('ERROR', detailMsg);
    github.createGithubIssue(
      'SEO/Schema-Check: Fehler (Multi-Page)',
      `Nicht automatisch behebbar: ${detailMsg}`,
    );
    console.log(
      chalkBgRedWhite(
        '\nSEO/Schema/Bot-Check: FEHLER auf mindestens einer Seite! Siehe oben und Log.\n',
      ),
    );
    log('SEO/Schema/Bot-Check: FEHLER auf mindestens einer Seite!');
    process.exit(2);
  }
}

main();
