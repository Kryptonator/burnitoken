const https = require('https');
const fs = require('fs');

function checkLiveWebsite() {
    console.log('🔍 Prüfe Live-Website HTML-Struktur...\n');
    
    const url = 'https://burnitoken.website';
    
    https.get(url, (res) => {
        let data = '';
        
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log('\n' + '='.repeat(80));
        console.log('HTML CONTENT:');
        console.log('='.repeat(80));
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(data);
            console.log('\n' + '='.repeat(80));
            console.log('ANALYSE:');
            console.log('='.repeat(80));
            
            // HTML-Struktur analysieren
            const hasDoctype = data.includes('<!doctype') || data.includes('<!DOCTYPE');
            const hasHtmlTag = data.includes('<html');
            const hasHead = data.includes('<head>');
            const hasBody = data.includes('<body');
            const hasTitle = data.includes('<title>');
            const hasMetaDesc = data.includes('name="description"');
            const hasCharset = data.includes('charset=');
            const hasViewport = data.includes('name="viewport"');
            
            console.log(`✅ DOCTYPE vorhanden: ${hasDoctype}`);
            console.log(`✅ HTML-Tag vorhanden: ${hasHtmlTag}`);
            console.log(`✅ HEAD-Tag vorhanden: ${hasHead}`);
            console.log(`✅ BODY-Tag vorhanden: ${hasBody}`);
            console.log(`✅ TITLE-Tag vorhanden: ${hasTitle}`);
            console.log(`✅ Meta-Description vorhanden: ${hasMetaDesc}`);
            console.log(`✅ Charset vorhanden: ${hasCharset}`);
            console.log(`✅ Viewport vorhanden: ${hasViewport}`);
            
            // Speichere für weitere Analyse
            fs.writeFileSync('live-website-html.txt', data);
            console.log('\n📁 HTML-Inhalt in live-website-html.txt gespeichert');
        });
        
    }).on('error', (err) => {
        console.error('❌ Fehler beim Abrufen der Website:', err.message);
    });
}

checkLiveWebsite();
