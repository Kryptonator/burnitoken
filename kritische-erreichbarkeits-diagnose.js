console.log('🚨 KRITISCHE WEBSITE-ERREICHBARKEITS-DIAGNOSE');
console.log('🔍 Analysiere burnitoken.website Verfügbarkeitsprobleme...');
console.log('='.repeat(70));

const https = require('https');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);

async function kritischeDiagnose() {
    const domain = 'burnitoken.website';
    const url = `https://${domain}`;
    
    console.log(`🎯 Target: ${url}`);
    console.log(`⏰ Zeit: ${new Date().toISOString()}\n`);

    // 1. DNS-Auflösung testen
    console.log('1️⃣ DNS-AUFLÖSUNG TEST...');
    try {
        const dnsResult = await dnsLookup(domain);
        console.log(`✅ DNS aufgelöst: ${dnsResult.address} (${dnsResult.family})`);
        
        // Weitere DNS-Records prüfen
        try {
            const aRecords = await dnsResolve(domain, 'A');
            console.log(`📍 A-Records: ${aRecords.join(', ')}`);
        } catch (error) {
            console.log(`⚠️ A-Records: ${error.message}`);
        }

        try {
            const cnameRecords = await dnsResolve(domain, 'CNAME');
            console.log(`📍 CNAME-Records: ${cnameRecords.join(', ')}`);
        } catch (error) {
            console.log(`⚠️ CNAME-Records: ${error.message}`);
        }

    } catch (error) {
        console.log(`❌ DNS-Auflösung fehlgeschlagen: ${error.message}`);
        console.log('🚨 KRITISCH: Domain nicht auflösbar!');
        return;
    }

    // 2. HTTP-Verbindung testen
    console.log('\n2️⃣ HTTP-VERBINDUNG TEST...');
    
    for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`\n🔄 Versuch ${attempt}/5...`);
        
        try {
            const result = await testHttpConnection(url);
            console.log(`✅ Status: ${result.statusCode}`);
            console.log(`⚡ Antwortzeit: ${result.responseTime}ms`);
            console.log(`🖥️ Server: ${result.server || 'Unbekannt'}`);
            console.log(`📅 Last-Modified: ${result.lastModified || 'Unbekannt'}`);
            
            if (result.statusCode === 200) {
                console.log(`📄 Content-Length: ${result.contentLength || 'Unbekannt'}`);
                console.log(`🎯 Content-Type: ${result.contentType || 'Unbekannt'}`);
                
                // Inhalt teilweise lesen
                if (result.content) {
                    const hasTitle = result.content.includes('<title>');
                    const hasBurni = result.content.includes('BurniToken') || result.content.includes('BURNI');
                    console.log(`📝 Hat Title-Tag: ${hasTitle ? '✅' : '❌'}`);
                    console.log(`🔥 Hat BURNI Content: ${hasBurni ? '✅' : '❌'}`);
                }
                
                console.log('🎉 Website ist ERREICHBAR und funktional!');
                break;
            } else if (result.statusCode >= 300 && result.statusCode < 400) {
                console.log(`🔄 Redirect zu: ${result.location || 'Unbekannt'}`);
            } else {
                console.log(`⚠️ Unerwarteter Status-Code: ${result.statusCode}`);
            }
            
        } catch (error) {
            console.log(`❌ Verbindung fehlgeschlagen: ${error.message}`);
            
            if (error.code === 'ENOTFOUND') {
                console.log('🚨 KRITISCH: Domain nicht gefunden (DNS-Problem)');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('🚨 KRITISCH: Verbindung verweigert (Server offline)');
            } else if (error.code === 'ETIMEDOUT') {
                console.log('⏰ TIMEOUT: Server antwortet nicht rechtzeitig');
            } else {
                console.log(`🔍 Error Code: ${error.code || 'Unbekannt'}`);
            }
        }
        
        if (attempt < 5) {
            console.log('⏳ Warte 3 Sekunden vor nächstem Versuch...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // 3. GitHub Pages Status prüfen
    console.log('\n3️⃣ GITHUB PAGES STATUS...');
    try {
        const githubPagesResult = await testHttpConnection('https://kryptonator.github.io/burnitoken/');
        console.log(`📍 GitHub Pages direkt: Status ${githubPagesResult.statusCode}`);
        
        if (githubPagesResult.statusCode === 200) {
            console.log('✅ GitHub Pages ist online - Problem liegt bei Custom Domain');
        }
    } catch (error) {
        console.log(`❌ GitHub Pages Test fehlgeschlagen: ${error.message}`);
    }

    // 4. Alternative URLs testen
    console.log('\n4️⃣ ALTERNATIVE URLS TESTEN...');
    const alternativeUrls = [
        'http://burnitoken.website',
        'https://www.burnitoken.website',
        'http://www.burnitoken.website'
    ];

    for (const altUrl of alternativeUrls) {
        try {
            const result = await testHttpConnection(altUrl);
            console.log(`📍 ${altUrl}: Status ${result.statusCode}`);
        } catch (error) {
            console.log(`📍 ${altUrl}: ${error.message}`);
        }
    }

    // 5. EMPFOHLENE SOFORTMASSNAHMEN
    console.log('\n' + '='.repeat(70));
    console.log('🛠️ EMPFOHLENE SOFORTMASSNAHMEN:');
    console.log('='.repeat(70));
    
    console.log('1. 🔧 GitHub Pages Einstellungen überprüfen');
    console.log('2. 📋 CNAME-Datei validieren');
    console.log('3. 🌐 DNS-Einstellungen bei Domain-Provider prüfen');
    console.log('4. 🚀 GitHub Actions Deployment-Logs analysieren');
    console.log('5. 📊 Repository Visibility überprüfen');
    console.log('6. ⚡ Force-Deployment auslösen');
    
    console.log('\n🚨 KRITISCHE PRIORITÄT: Website-Stabilität wiederherstellen!');
}

function testHttpConnection(url) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const request = https.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'BurniToken-Diagnostics/1.0'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                resolve({
                    statusCode: res.statusCode,
                    responseTime: responseTime,
                    server: res.headers.server,
                    lastModified: res.headers['last-modified'],
                    contentLength: res.headers['content-length'],
                    contentType: res.headers['content-type'],
                    location: res.headers.location,
                    content: data.substring(0, 1000) // Erste 1000 Zeichen
                });
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Starte kritische Diagnose
kritischeDiagnose().catch(console.error);
