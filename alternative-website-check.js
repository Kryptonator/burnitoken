/**
 * ALTERNATIVE WEBSITE CHECK - Direkte GitHub Pages URL
 */

console.log('🔍 ALTERNATIVE WEBSITE-VERFÜGBARKEIT CHECK');
console.log('Prüfe direkte GitHub Pages URL...');

const https = require('https');

function checkAlternativeUrl() {
    const urls = [
        'https://kryptonator.github.io/burnitoken/',
        'https://kryptonator.github.io/burnitoken/index.html',
        'https://burnitoken.website',
        'http://burnitoken.website'
    ];

    urls.forEach((url, index) => {
        setTimeout(() => {
            console.log(`\n${index + 1}. Teste: ${url}`);
            
            https.get(url, (res) => {
                console.log(`   Status: ${res.statusCode}`);
                console.log(`   Server: ${res.headers.server || 'Unknown'}`);
                
                if (res.statusCode === 200) {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        const hasTitle = data.includes('<title>');
                        const hasBurni = data.includes('BurniToken') || data.includes('BURNI');
                        console.log(`   ✅ ERFOLG! Website verfügbar`);
                        console.log(`   📄 Title-Tag: ${hasTitle ? 'Ja' : 'Nein'}`);
                        console.log(`   🔥 BURNI Content: ${hasBurni ? 'Ja' : 'Nein'}`);
                    });
                } else {
                    console.log(`   ⚠️ Unerwarteter Status`);
                }
            }).on('error', (error) => {
                console.log(`   ❌ Fehler: ${error.message}`);
            });
        }, index * 2000);
    });
}

checkAlternativeUrl();
