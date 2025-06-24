#!/usr/bin/env node

/**
 * Meta-Tags Optimierer
 * 
 * Optimiert automatisch die Meta-Tags und Social Media Cards für alle wichtigen Seiten
 * - Fügt fehlende Open Graph Tags hinzu
 * - Fügt fehlende Twitter Card Tags hinzu
 * - Optimiert Meta-Beschreibungen
 * - Erstellt konsistente strukturierte Daten
 * 
 * Erstellt: 2025-06-24
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const readline = require('readline');

// Konfiguration
const CONFIG = {
  PAGES: [
    { path: path.join(__dirname, '..', 'index.html'), url: 'https://burnitoken.website/' },
    { path: path.join(__dirname, '..', 'token', 'index.html'), url: 'https://burnitoken.website/token/' },
    { path: path.join(__dirname, '..', 'docs', 'index.html'), url: 'https://burnitoken.website/docs/' },
    { path: path.join(__dirname, '..', 'community', 'index.html'), url: 'https://burnitoken.website/community/' }
  ],
  IMAGES: {
    MAIN: '/assets/images/burni-social.webp',
    TOKEN: '/assets/images/burni-chart.webp',
    DOCS: '/assets/images/burni-versperrt-coins-im-tresor.webp',
    COMMUNITY: '/assets/images/burni-verbrennt-lagerfeuer.webp'
  },
  DEFAULT_META: {
    HOME: {
      title: 'BurniToken - XRPL Deflation Token | Crypto Investment',
      description: 'Die deflationäre Kryptowährung auf dem XRP Ledger mit automatischem Token-Burning. Investieren Sie in eine nachhaltige Zukunft.',
      image: '/assets/images/burni-social.webp',
      type: 'website'
    },
    TOKEN: {
      title: 'BurniToken - Technologie & Tokenomics | XRPL Deflation',
      description: 'Erfahren Sie alles über die Technologie, Tokenomics und den automatischen Burning-Mechanismus des BurniToken auf dem XRP Ledger.',
      image: '/assets/images/burni-chart.webp',
      type: 'article'
    },
    DOCS: {
      title: 'BurniToken Dokumentation | Whitepaper & Anleitungen',
      description: 'Offizielle Dokumentation, Whitepaper und Anleitungen für BurniToken. Erfahren Sie, wie Sie kaufen, lagern und nutzen können.',
      image: '/assets/images/burni-versperrt-coins-im-tresor.webp',
      type: 'article'
    },
    COMMUNITY: {
      title: 'BurniToken Community | Join the Burni Family',
      description: 'Werden Sie Teil der BurniToken Community. Erfahren Sie alles über Events, Diskussionen und wie Sie sich engagieren können.',
      image: '/assets/images/burni-verbrennt-lagerfeuer.webp',
      type: 'article'
    }
  }
};

// Farbige Konsolen-Ausgaben
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * HTML-Datei einlesen und parsen
 */
function parseHTMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return new JSDOM(content);
  } catch (error) {
    printColored(`❌ Fehler beim Lesen der Datei ${filePath}: ${error.message}`, '\x1b[31m');
    return null;
  }
}

/**
 * Aktuellen Meta-Tag-Status überprüfen
 */
function checkMetaTagStatus(document) {
  const metaStatus = {
    title: document.querySelector('title')?.textContent || '',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    hasOgTitle: !!document.querySelector('meta[property="og:title"]'),
    hasOgDescription: !!document.querySelector('meta[property="og:description"]'),
    hasOgImage: !!document.querySelector('meta[property="og:image"]'),
    hasOgUrl: !!document.querySelector('meta[property="og:url"]'),
    hasOgType: !!document.querySelector('meta[property="og:type"]'),
    hasTwitterCard: !!document.querySelector('meta[name="twitter:card"]'),
    hasTwitterTitle: !!document.querySelector('meta[name="twitter:title"]'),
    hasTwitterDescription: !!document.querySelector('meta[name="twitter:description"]'),
    hasTwitterImage: !!document.querySelector('meta[name="twitter:image"]'),
    hasSchemaOrg: document.querySelectorAll('script[type="application/ld+json"]').length > 0
  };
  
  return metaStatus;
}

/**
 * Meta-Tags optimieren
 */
function optimizeMetaTags(document, pageConfig) {
  const head = document.querySelector('head');
  const status = checkMetaTagStatus(document);
  const changes = [];
  
  // Title optimieren
  const title = document.querySelector('title');
  if (title && title.textContent !== pageConfig.title) {
    const oldTitle = title.textContent;
    title.textContent = pageConfig.title;
    changes.push(`Title: "${oldTitle}" -> "${pageConfig.title}"`);
  }
  
  // Description optimieren
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    const oldDescription = description.getAttribute('content');
    if (oldDescription !== pageConfig.description) {
      description.setAttribute('content', pageConfig.description);
      changes.push(`Description aktualisiert: ${oldDescription.substring(0, 40)}... -> ${pageConfig.description.substring(0, 40)}...`);
    }
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', pageConfig.description);
    head.appendChild(meta);
    changes.push(`Description hinzugefügt: ${pageConfig.description.substring(0, 40)}...`);
  }
  
  // Open Graph Tags
  if (!status.hasOgTitle) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', pageConfig.title);
    head.appendChild(meta);
    changes.push('Open Graph Title hinzugefügt');
  } else {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle.setAttribute('content', pageConfig.title);
  }
  
  if (!status.hasOgDescription) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:description');
    meta.setAttribute('content', pageConfig.description);
    head.appendChild(meta);
    changes.push('Open Graph Description hinzugefügt');
  } else {
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription.setAttribute('content', pageConfig.description);
  }
  
  if (!status.hasOgImage) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:image');
    meta.setAttribute('content', pageConfig.url + pageConfig.image);
    head.appendChild(meta);
    changes.push('Open Graph Image hinzugefügt');
  }
  
  if (!status.hasOgUrl) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    meta.setAttribute('content', pageConfig.url);
    head.appendChild(meta);
    changes.push('Open Graph URL hinzugefügt');
  }
  
  if (!status.hasOgType) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:type');
    meta.setAttribute('content', pageConfig.type);
    head.appendChild(meta);
    changes.push('Open Graph Type hinzugefügt');
  }
  
  // Twitter Card Tags
  if (!status.hasTwitterCard) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:card');
    meta.setAttribute('content', 'summary_large_image');
    head.appendChild(meta);
    changes.push('Twitter Card hinzugefügt');
  }
  
  if (!status.hasTwitterTitle) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:title');
    meta.setAttribute('content', pageConfig.title);
    head.appendChild(meta);
    changes.push('Twitter Title hinzugefügt');
  } else {
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    twitterTitle.setAttribute('content', pageConfig.title);
  }
  
  if (!status.hasTwitterDescription) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:description');
    meta.setAttribute('content', pageConfig.description);
    head.appendChild(meta);
    changes.push('Twitter Description hinzugefügt');
  } else {
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    twitterDescription.setAttribute('content', pageConfig.description);
  }
  
  if (!status.hasTwitterImage) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:image');
    meta.setAttribute('content', pageConfig.url + pageConfig.image);
    head.appendChild(meta);
    changes.push('Twitter Image hinzugefügt');
  }
  
  return changes;
}

/**
 * Strukturierte Daten optimieren
 */
function optimizeStructuredData(document, pageConfig) {
  // Entferne alle alten strukturierten Daten
  const oldSchemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (oldSchemaScripts.length > 0) {
    Array.from(oldSchemaScripts).forEach(script => script.remove());
  }
  
  // Erstelle neue strukturierte Daten
  const head = document.querySelector('head');
  
  // Organisation Schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'BurniToken',
    'url': 'https://burnitoken.website/',
    'logo': 'https://burnitoken.website/assets/images/burni-logo.webp',
    'description': 'BurniToken ist eine deflationäre Kryptowährung auf dem XRP Ledger mit automatischem Token-Burning-Mechanismus.',
    'sameAs': [
      'https://twitter.com/BurniToken',
      'https://t.me/burnitoken'
    ]
  };
  
  const orgScript = document.createElement('script');
  orgScript.type = 'application/ld+json';
  orgScript.textContent = JSON.stringify(orgSchema, null, 2);
  head.appendChild(orgScript);
  
  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'BurniToken',
    'url': 'https://burnitoken.website/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://burnitoken.website/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
  
  const websiteScript = document.createElement('script');
  websiteScript.type = 'application/ld+json';
  websiteScript.textContent = JSON.stringify(websiteSchema, null, 2);
  head.appendChild(websiteScript);
  
  // Seitenspezifisches Schema
  if (pageConfig.type === 'article') {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': pageConfig.title,
      'image': pageConfig.url + pageConfig.image,
      'author': {
        '@type': 'Organization',
        'name': 'BurniToken Team'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'BurniToken',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://burnitoken.website/assets/images/burni-logo.webp'
        }
      },
      'datePublished': '2025-06-01',
      'dateModified': new Date().toISOString().split('T')[0],
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': pageConfig.url
      },
      'description': pageConfig.description
    };
    
    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.textContent = JSON.stringify(articleSchema, null, 2);
    head.appendChild(articleScript);
  }
  
  return ['Schema.org strukturierte Daten aktualisiert'];
}

/**
 * HTML-Datei speichern
 */
function saveHTMLFile(dom, filePath) {
  try {
    fs.writeFileSync(filePath, dom.serialize());
    return true;
  } catch (error) {
    printColored(`❌ Fehler beim Speichern der Datei ${filePath}: ${error.message}`, '\x1b[31m');
    return false;
  }
}

/**
 * Eine Seite optimieren
 */
function optimizePage(pagePath, pageUrl, pageConfig) {
  printColored(`\n🔍 Optimiere: ${pageUrl}`, '\x1b[1;36m');
  
  const dom = parseHTMLFile(pagePath);
  if (!dom) return false;
  
  const document = dom.window.document;
  
  // Aktuelle Meta-Tags überprüfen
  const status = checkMetaTagStatus(document);
  printColored(`\n📊 Aktueller Status:`, '\x1b[36m');
  printColored(`   Title: ${status.title}`, '\x1b[33m');
  printColored(`   Description: ${status.description.substring(0, 60)}...`, '\x1b[33m');
  printColored(`   Open Graph Tags: ${status.hasOgTitle && status.hasOgDescription && status.hasOgImage && status.hasOgUrl && status.hasOgType ? '✅ Vollständig' : '❌ Unvollständig'}`, status.hasOgTitle && status.hasOgDescription && status.hasOgImage ? '\x1b[32m' : '\x1b[31m');
  printColored(`   Twitter Card Tags: ${status.hasTwitterCard && status.hasTwitterTitle && status.hasTwitterDescription && status.hasTwitterImage ? '✅ Vollständig' : '❌ Unvollständig'}`, status.hasTwitterCard && status.hasTwitterTitle && status.hasTwitterDescription ? '\x1b[32m' : '\x1b[31m');
  
  // Meta-Tags optimieren
  const changes = optimizeMetaTags(document, pageConfig);
  
  // Strukturierte Daten optimieren
  const schemaChanges = optimizeStructuredData(document, pageConfig);
  
  // Änderungen zusammenfassen
  printColored(`\n✅ Optimierung abgeschlossen:`, '\x1b[32m');
  [...changes, ...schemaChanges].forEach(change => {
    printColored(`   - ${change}`, '\x1b[36m');
  });
  
  // Speichern
  if (saveHTMLFile(dom, pagePath)) {
    printColored(`✅ Datei erfolgreich gespeichert: ${pagePath}`, '\x1b[32m');
    return true;
  } else {
    printColored(`❌ Fehler beim Speichern: ${pagePath}`, '\x1b[31m');
    return false;
  }
}

/**
 * Alle Seiten optimieren
 */
async function optimizeAllPages() {
  printColored('\n=== Meta-Tags & Social Media Cards Optimierer ===\n', '\x1b[1;36m');
  
  // Überprüfe, ob die Seiten existieren
  const existingPages = CONFIG.PAGES.filter(page => fs.existsSync(page.path));
  
  printColored(`🔍 ${existingPages.length} Seiten gefunden.\n`, '\x1b[36m');
  if (existingPages.length === 0) {
    printColored('❌ Keine Seiten gefunden. Bitte überprüfen Sie die Konfiguration.', '\x1b[31m');
    return;
  }
  
  // Frage nach Bestätigung
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    rl.question('Möchten Sie die Meta-Tags für alle Seiten optimieren? (j/n): ', resolve);
  });
  
  if (answer.toLowerCase() !== 'j' && answer.toLowerCase() !== 'ja') {
    printColored('Optimierung abgebrochen.', '\x1b[33m');
    rl.close();
    return;
  }
  
  rl.close();
  
  // Optimiere jede Seite
  let successful = 0;
  
  for (const page of existingPages) {
    let pageConfig;
    
    if (page.url.includes('/token/')) {
      pageConfig = {
        url: page.url,
        ...CONFIG.DEFAULT_META.TOKEN
      };
    } else if (page.url.includes('/docs/')) {
      pageConfig = {
        url: page.url,
        ...CONFIG.DEFAULT_META.DOCS
      };
    } else if (page.url.includes('/community/')) {
      pageConfig = {
        url: page.url,
        ...CONFIG.DEFAULT_META.COMMUNITY
      };
    } else {
      pageConfig = {
        url: page.url,
        ...CONFIG.DEFAULT_META.HOME
      };
    }
    
    if (optimizePage(page.path, page.url, pageConfig)) {
      successful++;
    }
  }
  
  // Zusammenfassung
  printColored(`\n=== Optimierung abgeschlossen ===`, '\x1b[1;36m');
  printColored(`✅ ${successful} von ${existingPages.length} Seiten erfolgreich optimiert.`, '\x1b[32m');
  
  printColored(`\n💡 Nächste Schritte:`, '\x1b[1;33m');
  printColored(`   1. Überprüfen Sie die Social Cards mit den Validierungs-Tools:`, '\x1b[33m');
  printColored(`      - Twitter Card Validator: https://cards-dev.twitter.com/validator`, '\x1b[36m');
  printColored(`      - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/`, '\x1b[36m');
  printColored(`   2. Überprüfen Sie die strukturierten Daten mit dem Google Testing Tool:`, '\x1b[33m');
  printColored(`      - https://search.google.com/test/rich-results`, '\x1b[36m');
}

/**
 * Einzelne Seite optimieren (CLI-Modus)
 */
async function optimizeSinglePage(pageUrl) {
  const pagePath = CONFIG.PAGES.find(p => p.url === pageUrl)?.path;
  
  if (!pagePath) {
    printColored(`❌ Die URL ${pageUrl} ist nicht in der Konfiguration vorhanden.`, '\x1b[31m');
    printColored(`Verfügbare URLs:`, '\x1b[33m');
    CONFIG.PAGES.forEach(p => printColored(`   - ${p.url}`, '\x1b[36m'));
    return;
  }
  
  if (!fs.existsSync(pagePath)) {
    printColored(`❌ Die Datei ${pagePath} existiert nicht.`, '\x1b[31m');
    return;
  }
  
  let pageConfig;
  if (pageUrl.includes('/token/')) {
    pageConfig = {
      url: pageUrl,
      ...CONFIG.DEFAULT_META.TOKEN
    };
  } else if (pageUrl.includes('/docs/')) {
    pageConfig = {
      url: pageUrl,
      ...CONFIG.DEFAULT_META.DOCS
    };
  } else if (pageUrl.includes('/community/')) {
    pageConfig = {
      url: pageUrl,
      ...CONFIG.DEFAULT_META.COMMUNITY
    };
  } else {
    pageConfig = {
      url: pageUrl,
      ...CONFIG.DEFAULT_META.HOME
    };
  }
  
  optimizePage(pagePath, pageUrl, pageConfig);
}

/**
 * Hauptfunktion
 */
async function main() {
  // Kommandozeilenargumente verarbeiten
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Meta-Tags Optimierer
-------------------

Verwendung:
  node meta-tags-optimizer.js [optionen]

Optionen:
  --url=<url>    Einzelne URL optimieren
  --help, -h     Diese Hilfe anzeigen

Ohne Optionen werden alle konfigurierten URLs optimiert.
    `);
    return;
  }
  
  // Einzelne URL
  const urlArg = args.find(arg => arg.startsWith('--url='));
  if (urlArg) {
    const url = urlArg.replace('--url=', '');
    await optimizeSinglePage(url);
    return;
  }
  
  // Alle Seiten
  await optimizeAllPages();
}

// Programm ausführen
main().catch(error => {
  printColored(`❌ Ein Fehler ist aufgetreten: ${error.message}`, '\x1b[31m');
  process.exit(1);
});
