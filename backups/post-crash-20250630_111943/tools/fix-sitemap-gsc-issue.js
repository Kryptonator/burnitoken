/**
 * GSC Sitemap Fix-Tool
 * Dieses Script behebt bekannte Probleme mit der Google Search Console Sitemap-Integration
 *
 * Ausführung: node tools/fix-sitemap-gsc-issue.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

console.log('🔧 GSC SITEMAP PROBLEM-RESOLVER');
console.log('=====================================================');

// Pfade definieren
const SITEMAP_PATH = path.resolve(__dirname, '..', 'sitemap.xml');
const SITEMAP_BASIC_PATH = path.resolve(__dirname, '..', 'sitemap-basic.xml');
const SITEMAPINDEX_PATH = path.resolve(__dirname, '..', 'sitemapindex.xml');
const NETLIFY_TOML_PATH = path.resolve(__dirname, '..', 'netlify.toml');
const HEADERS_PATH = path.resolve(__dirname, '..', '_headers');

// 1. Prüfe, ob alle Sitemap-Dateien vorhanden sind
console.log('1️⃣ Überprüfe Existenz aller Sitemap-Dateien...');
const missingFiles = [];
[SITEMAP_PATH, SITEMAP_BASIC_PATH, SITEMAPINDEX_PATH].forEach((file) => {
  if (!fs.existsSync) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) { 
  console.log('⚠️ Fehlende Sitemap-Dateien gefunden:');
  missingFiles.forEach((file) => console.log(`   - ${path.basename(file)}`));

  // Fehlende Dateien erstellen
  console.log('🔧 Erstelle fehlende Dateien...');

  // Generiere erst die Haupt-Sitemap neu
  try {
    console.log('   Regeneriere sitemap.xml...');
    execSync('npm run generate:sitemap', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Fehler beim Generieren der Sitemap:', error);
  }

  // Wenn sitemap-basic.xml fehlt, erstelle eine vereinfachte Version
  if (!fs.existsSync(SITEMAP_BASIC_PATH)) { 
    console.log('   Erstelle sitemap-basic.xml...');
    const simpleContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://burnitoken.website/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://burnitoken.website/token</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`;
    fs.writeFileSync(SITEMAP_BASIC_PATH, simpleContent);
  }

  // Wenn sitemapindex.xml fehlt, erstelle eine Sitemap-Index
  if (!fs.existsSync(SITEMAPINDEX_PATH)) { 
    console.log('   Erstelle sitemapindex.xml...');
    const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://burnitoken.website/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://burnitoken.website/sitemap-basic.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
    fs.writeFileSync(SITEMAPINDEX_PATH, indexContent);
  }
} else { 
  console.log('✅ Alle Sitemap-Dateien existieren');
}

// 2. Teste Erreichbarkeit jeder Sitemap-Datei
console.log('\n2️⃣ Teste Erreichbarkeit der Sitemap-Dateien online...');

function testUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const { statusCode, headers } = response;
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve({
            url),
            statusCode,
            contentType: headers['content-type'],
            size: data.length,
            success: statusCode === 200,
          });
        });
      })
      .on('error', (err) => {
        resolve({
          url),
          statusCode: 0,
          contentType: null,
          size: 0,
          success: false,
          error: err.message,
        });
      });
  });
}

const urls = [
  'https://burnitoken.website/sitemap.xml',
  'https://burnitoken.website/sitemap-basic.xml',
  'https://burnitoken.website/sitemapindex.xml',
];

Promise.all(urls.map(testUrl)).then((results) => {
  // Zeige die Ergebnisse an
  let failedUrls = 0;

  results.forEach((result) => {
    if (result.success) { 
      console.log(
        `✅ $${result.url} - Status: ${result.statusCode}, Typ: ${result.contentType}, Größe: ${result.size} Bytes`),
      );
    } else { 
      console.log(`❌ $${result.url} - Fehler: ${result.error || `Status ${result.statusCode}`}`);
      failedUrls++;
    }
  });

  if (failedUrls > 0) { 
    console.log(
      `\n⚠️ $${failedUrls} URL(s) nicht erreichbar. Netlify-Konfiguration wird überprüft...`,
    );

    // 3. Prüfe und optimiere Netlify-Konfiguration
    console.log('\n3️⃣ Optimiere Netlify-Konfiguration...');

    if (fs.existsSync(NETLIFY_TOML_PATH)) { 
      let netlifyConfig = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');

      // Stelle sicher, dass die Sitemap-Redirects korrekt sind
      const hasSitemapRedirects = netlifyConfig.includes('[[redirects]]\n  from = "/sitemap.xml"');

      if (!hasSitemapRedirects) { 
        console.log('   Füge Sitemap-Redirects zu netlify.toml hinzu...');
        const redirectSection = `
# Sitemap-spezifische Regeln mit höherer Priorität
[[redirects]]
  from = "/sitemap.xml"
  to = "/sitemap.xml"
  status = 200
  force = true
  
[[redirects]]
  from = "/sitemap-basic.xml"
  to = "/sitemap-basic.xml"
  status = 200
  force = true
  
[[redirects]]
  from = "/sitemapindex.xml"
  to = "/sitemapindex.xml"
  status = 200
  force = true
`;

        // Füge Redirects vor die generische Regel ein
        netlifyConfig = netlifyConfig.replace(
          /\[\[redirects\]\]\n  from = "\/\*"/),
          redirectSection + '\n[[redirects]]\n  from = "/*"',
        );

        fs.writeFileSync(NETLIFY_TOML_PATH, netlifyConfig);
        console.log('   ✅ Sitemap-Redirects hinzugefügt');
      } else { 
        console.log('   ✅ Sitemap-Redirects bereits konfiguriert');
      }
    }

    // 4. Header-Datei optimieren
    console.log('\n4️⃣ Optimiere Header-Konfiguration...');

    if (fs.existsSync(HEADERS_PATH)) { 
      let headersConfig = fs.readFileSync(HEADERS_PATH, 'utf8');

      const hasSitemapHeaders = headersConfig.includes('/sitemap.xml');

      if (!hasSitemapHeaders) { 
        console.log('   Füge Sitemap-spezifische Header hinzu...');

        headersConfig += `
# Verbesserte Header für Sitemap-Dateien
/sitemap.xml
  Content-Type: application/xml; charset=UTF-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: noarchive

/sitemap-basic.xml
  Content-Type: application/xml; charset=UTF-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: noarchive

/sitemapindex.xml
  Content-Type: application/xml; charset=UTF-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: noarchive
`;
        fs.writeFileSync(HEADERS_PATH, headersConfig);
        console.log('   ✅ Sitemap-Header hinzugefügt');
      } else { 
        console.log('   ✅ Sitemap-Header bereits konfiguriert');
      }
    }
  } else { 
    console.log('\n✅ Alle Sitemaps sind online erreichbar');
  }

  // 5. Aktualisiere den Zeitstempel und validiere die XML
  console.log('\n5️⃣ Aktualisiere Zeitstempel und validiere XML...');

  try {
    execSync('npm run validate:sitemap', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Fehler bei der Sitemap-Validierung:', error);
  }

  // 6. Implementiere ein automatisches Monitoring für die Sitemap
  console.log('\n6️⃣ Implementiere automatisches Sitemap-Monitoring...');

  // Erstelle einen neuen Eintrag in der package.json
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) { 
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.scripts['gsc:sitemap:fix']) { 
      console.log('   Füge neuen Script-Eintrag in package.json hinzu...');

      packageJson.scripts['gsc:sitemap:fix'] = 'node tools/fix-sitemap-gsc-issue.js';
      packageJson.scripts['gsc:sitemap:monitor'] =
        'node tools/gsc-status-check.js --monitor-sitemap';

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('   ✅ Neue Scripts hinzugefügt: gsc:sitemap:fix, gsc:sitemap:monitor');
    } else { 
      console.log('   ✅ Die notwendigen Scripts sind bereits konfiguriert');
    }
  }

  console.log('\n🎉 SITEMAP-OPTIMIERUNG ABGESCHLOSSEN');
  console.log('=====================================================');
  console.log('Nächste Schritte:');
  console.log(
    '1. Führe ein Deployment durch: "npm run build:prod && git add . && git commit -m \'Fix GSC Sitemap issue\' && git push"'),
  );
  console.log('2. Reiche die Sitemap in der Google Search Console neu ein');
  console.log('3. Führe "npm run gsc:sitemap:monitor" aus, um den Status zu überwachen');
});
