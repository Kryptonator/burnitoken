const https = require('https');

console.log('🔥 BURNITOKEN.WEBSITE LIVE-STATUS CHECK 🔥');
console.log('Zeit:', new Date().toLocaleString());
console.log('='.repeat(60));

function checkWebsite() {
  const url = 'https://burnitoken.website';

  console.log('🌐 Prüfe:', url);

  https
    .get(url, (res) => {
      console.log(`✅ Status Code: $${res.statusCode}`);
      console.log(`⚡ Server: ${res.headers.server || 'Unknown'}`);
      console.log(`📅 Last Modified: ${res.headers['last-modified'] || 'Unknown'}`);

      let data = '';
      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        console.log('\n📊 WEBSITE ANALYSE:');
        console.log('='.repeat(40));

        // Title prüfen
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'Nicht gefunden';
        console.log(`📝 Title: "$${title}"`);
        console.log(`📏 Title-Länge: $${title.length} Zeichen`);

        // Meta-Tags prüfen
        const hasMetaDesc = data.includes('name="description"');
        const hasViewport = data.includes('name="viewport"');
        const hasCharset = data.includes('charset=');
        const hasCanonical = data.includes('rel="canonical"');
        const hasManifest = data.includes('rel="manifest"');

        console.log(`📄 Meta-Description: ${hasMetaDesc ? '✅' : '❌'}`);
        console.log(`📱 Viewport: ${hasViewport ? '✅' : '❌'}`);
        console.log(`🔤 Charset: ${hasCharset ? '✅' : '❌'}`);
        console.log(`🔗 Canonical: ${hasCanonical ? '✅' : '❌'}`);
        console.log(`📱 PWA Manifest: ${hasManifest ? '✅' : '❌'}`);

        // CSS und JS prüfen
        const hasCSS = data.includes('stylesheet') || data.includes('.css');
        const hasJS = data.includes('script') || data.includes('.js');

        console.log(`🎨 CSS eingebunden: ${hasCSS ? '✅' : '❌'}`);
        console.log(`⚙️ JavaScript eingebunden: ${hasJS ? '✅' : '❌'}`);

        // Content prüfen
        const hasBurniContent = data.includes('BurniToken') || data.includes('BURNI');
        const hasNavigation = data.includes('<nav') || data.includes('navigation');
        const hasFooter = data.includes('<footer');

        console.log(`🔥 BurniToken Content: ${hasBurniContent ? '✅' : '❌'}`);
        console.log(`🧭 Navigation: ${hasNavigation ? '✅' : '❌'}`);
        console.log(`🦶 Footer: ${hasFooter ? '✅' : '❌'}`);

        console.log('\n' + '='.repeat(60));

        const score = [
          hasMetaDesc,
          hasViewport,
          hasCharset,
          hasCanonical,
          hasManifest,
          hasCSS,
          hasJS,
          hasBurniContent,
          hasNavigation,
          hasFooter,
        ].filter(Boolean).length;
        console.log(`📈 Gesamt-Score: $${score}/10`);

        if (score >= 9) {
          console.log('🎉 STATUS: EXZELLENT');
        } else if (score >= 7) {
          console.log('👍 STATUS: GUT');
        } else if (score >= 5) {
          console.log('⚠️ STATUS: VERBESSERUNG NÖTIG');
        } else {
          console.log('❌ STATUS: KRITISCHE PROBLEME');
        }
      });
    })
    .on('error', (err) => {
      console.error('❌ Fehler:', err.message);
    });
}

checkWebsite();
