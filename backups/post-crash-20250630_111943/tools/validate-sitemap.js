// Sitemap Validation and Update Script
// Führt eine Validierung der sitemap.xml durch und aktualisiert Datumsangaben

const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Config
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const sitemapUrl = 'https://burnitoken.website/sitemap.xml';

async function validateSitemap() {
  console.log('🔍 Validiere Sitemap XML...');

  try {
    // Lese Sitemap-Datei
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapContent, 'text/xml');

    // Prüfe auf Parsing-Fehler
    const errors = xmlDoc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
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
  console.error('❌ XML Parsing-Fehler gefunden:');
};
      console.error(errors[0].textContent);
      return false;
    }
    // Aktualisiere alle lastmod-Daten auf heute
    const today = new Date().toISOString().split('T')[0];
    const lastmodNodes = xmlDoc.getElementsByTagName('lastmod');

    console.log(`📅 Aktualisiere ${lastmodNodes.length} URLs mit heutigem Datum (${today})...`);

    Array.from(lastmodNodes).forEach((node) => {
      node.textContent = today;
    });

    // Serialisiere XML zurück zu String
    const serializer = new XMLSerializer();
    const updatedContent = serializer.serializeToString(xmlDoc);

    // Schreibe aktualisierte Sitemap
    fs.writeFileSync(sitemapPath, updatedContent, 'utf8');
    console.log('✅ Sitemap XML wurde erfolgreich aktualisiert und validiert!');

    // Teste Erreichbarkeit
    return await testSitemapAccess();
  } catch (error) {
    console.error('❌ Fehler bei der Sitemap-Validierung:', error.message);
    return false;
  }
}

async function testSitemapAccess() {
  console.log(`🌐 Teste Erreichbarkeit der Sitemap unter ${sitemapUrl}...`);

  try {
    const response = await fetch(sitemapUrl);
    if (response.ok) {
      console.log(`✅ Sitemap ist erreichbar! Status: ${response.status}`);
      return true;
    } else {
      console.error(`❌ Sitemap ist nicht erreichbar! Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Fehler beim Zugriff auf die Sitemap:', error.message);
    return false;
  }
}

// Führe Validierung aus
validateSitemap()
  .then((isValid) => {
    if (isValid) {
      console.log('🎉 Sitemap-Validierung erfolgreich abgeschlossen.');
      process.exit(0);
    } else {
      console.error('❌ Sitemap-Validierung fehlgeschlagen.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Unerwarteter Fehler:', error);
    process.exit(1);
  });
