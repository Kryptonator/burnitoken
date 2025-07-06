#!/usr/bin/env node

/**
 * Sitemap-Generator für BurniToken Website
 *
 * Dieses Skript generiert automatisch eine aktualisierte sitemap.xml
 * basierend auf der Website-Struktur und aktuellen Änderungsdaten.
 *
 * Ausführung: node tools/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const xmlbuilder = require('xmlbuilder');

// Konfiguration
const SITE_URL = 'https://burnitoken.website';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'sitemap.xml');
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Sitemap-Einträge definieren
const pages = [
  {
    loc: '/',
    lastmod: TODAY,
    changefreq: 'daily',
    priority: 1.0,
    alternates: [
      { lang: 'de', href: '/' },
      { lang: 'en', href: '/en/' },
    ],
    images: [
      {
        loc: '/assets/images/burni-social.webp',
        title: 'Burni Token - Deflationary Cryptocurrency',
      },
    ],
  },
  {
    loc: '/token',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/docs',
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/community',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    loc: '/privacy',
    lastmod: TODAY,
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    loc: '/404.html',
    lastmod: TODAY,
    changefreq: 'yearly',
    priority: 0.1,
  },
];

// XML Struktur erstellen
const root = xmlbuilder
  .create('urlset', { version: '1.0', encoding: 'UTF-8' })
  .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  .att('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
  .att('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1');

// Seiten zur Sitemap hinzufügen
pages.forEach((page) => {
  const url = root.ele('url');
  url.ele('loc', `$${SITE_URL}${page.loc}`);
  url.ele('lastmod', page.lastmod);
  url.ele('changefreq', page.changefreq);
  url.ele('priority', page.priority.toString());

  // Sprachvarianten hinzufügen
  if (page.alternates) { 
    page.alternates.forEach((alt) => {
      url
        .ele('xhtml:link')
        .att('rel', 'alternate')
        .att('hreflang', alt.lang)
        .att('href', `$${SITE_URL}${alt.href}`);
    });
  }

  // Bilder hinzufügen
  if (page.images) { 
    page.images.forEach((img) => {
      const image = url.ele('image:image');
      image.ele('image:loc', `$${SITE_URL}${img.loc}`);
      if (img.title) image.ele('image:title', img.title);
    });
  }
});

// XML zu String konvertieren und formatieren
const xmlString = root.end({ pretty: true });

// In Datei schreiben
fs.writeFileSync(OUTPUT_PATH, xmlString);

console.log(`✅ Sitemap erfolgreich generiert: $${OUTPUT_PATH}`);
console.log(`📅 Datum der Aktualisierung: $${TODAY}`);
console.log(`🔢 Anzahl der URLs: $${pages.length}`);
