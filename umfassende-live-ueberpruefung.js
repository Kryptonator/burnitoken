console.log('🔥 === BURNITOKEN.WEBSITE UMFASSENDE LIVE-ÜBERPRÜFUNG === 🔥');
console.log('Datum:', new Date().toISOString());
console.log('='.repeat(80));

const https = require('https');
const fs = require('fs');

async function umfassendeLiveUeberpruefung() {
    const testResults = {
        timestamp: new Date().toISOString(),
        domain: 'burnitoken.website',
        tests: {},
        summary: {
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    console.log('🌐 TESTE BURNITOKEN.WEBSITE LIVE-STATUS...\n');

    // Test 1: Grundlegende Erreichbarkeit
    try {
        console.log('📡 Test 1: Domain-Erreichbarkeit...');
        const response = await makeHttpsRequest('https://burnitoken.website');
        
        testResults.tests.connectivity = {
            status: response.statusCode === 200 ? 'PASS' : 'FAIL',
            statusCode: response.statusCode,
            responseTime: response.responseTime,
            headers: response.headers
        };

        if (response.statusCode === 200) {
            console.log('✅ Domain erreichbar (Status: 200)');
            console.log(`⚡ Antwortzeit: ${response.responseTime}ms`);
            testResults.summary.passed++;
        } else {
            console.log(`❌ Unerwarteter Status-Code: ${response.statusCode}`);
            testResults.summary.failed++;
        }
    } catch (error) {
        console.log(`❌ Verbindungsfehler: ${error.message}`);
        testResults.tests.connectivity = { status: 'FAIL', error: error.message };
        testResults.summary.failed++;
    }

    // Test 2: HTML-Struktur-Validierung
    try {
        console.log('\n📄 Test 2: HTML-Struktur-Validierung...');
        const htmlContent = await getWebsiteContent('https://burnitoken.website');
        
        const htmlTests = {
            hasDoctype: htmlContent.includes('<!doctype') || htmlContent.includes('<!DOCTYPE'),
            hasHtmlTag: htmlContent.includes('<html'),
            hasHead: htmlContent.includes('<head>'),
            hasBody: htmlContent.includes('<body'),
            hasTitle: htmlContent.includes('<title>'),
            hasMetaDescription: htmlContent.includes('name="description"'),
            hasCharset: htmlContent.includes('charset='),
            hasViewport: htmlContent.includes('name="viewport"'),
            hasCanonical: htmlContent.includes('rel="canonical"'),
            hasOgTags: htmlContent.includes('property="og:'),
            hasTwitterCard: htmlContent.includes('name="twitter:card"'),
            hasManifest: htmlContent.includes('rel="manifest"'),
            hasServiceWorker: htmlContent.includes('serviceWorker'),
            hasFavicon: htmlContent.includes('favicon') || htmlContent.includes('apple-touch-icon')
        };

        testResults.tests.htmlStructure = htmlTests;
        
        let htmlPassed = 0;
        let htmlTotal = Object.keys(htmlTests).length;
        
        Object.entries(htmlTests).forEach(([test, result]) => {
            if (result) {
                console.log(`✅ ${test}: Vorhanden`);
                htmlPassed++;
            } else {
                console.log(`❌ ${test}: Fehlt`);
            }
        });

        console.log(`📊 HTML-Struktur: ${htmlPassed}/${htmlTotal} Tests bestanden`);
        
        if (htmlPassed === htmlTotal) {
            testResults.summary.passed++;
        } else if (htmlPassed > htmlTotal * 0.8) {
            testResults.summary.warnings++;
        } else {
            testResults.summary.failed++;
        }
    } catch (error) {
        console.log(`❌ HTML-Struktur-Test fehlgeschlagen: ${error.message}`);
        testResults.tests.htmlStructure = { error: error.message };
        testResults.summary.failed++;
    }

    // Test 3: CSS und Assets
    try {
        console.log('\n🎨 Test 3: CSS und Assets Verfügbarkeit...');
        const assetTests = [];
        
        const assetsToTest = [
            'https://burnitoken.website/assets/css/styles.min.css',
            'https://burnitoken.website/assets/scripts.min.js',
            'https://burnitoken.website/assets/images/burni-logo.webp',
            'https://burnitoken.website/manifest.json',
            'https://burnitoken.website/sw.js'
        ];

        for (const asset of assetsToTest) {
            try {
                const assetResponse = await makeHttpsRequest(asset);
                const assetName = asset.split('/').pop();
                
                if (assetResponse.statusCode === 200) {
                    console.log(`✅ ${assetName}: Verfügbar (${assetResponse.statusCode})`);
                    assetTests.push({ asset: assetName, status: 'PASS', statusCode: assetResponse.statusCode });
                } else {
                    console.log(`⚠️ ${assetName}: Status ${assetResponse.statusCode}`);
                    assetTests.push({ asset: assetName, status: 'WARNING', statusCode: assetResponse.statusCode });
                }
            } catch (error) {
                console.log(`❌ ${asset.split('/').pop()}: Nicht erreichbar`);
                assetTests.push({ asset: asset.split('/').pop(), status: 'FAIL', error: error.message });
            }
        }

        testResults.tests.assets = assetTests;
        
        const passedAssets = assetTests.filter(test => test.status === 'PASS').length;
        const totalAssets = assetTests.length;
        
        console.log(`📊 Assets: ${passedAssets}/${totalAssets} verfügbar`);
        
        if (passedAssets === totalAssets) {
            testResults.summary.passed++;
        } else if (passedAssets > totalAssets * 0.7) {
            testResults.summary.warnings++;
        } else {
            testResults.summary.failed++;
        }
    } catch (error) {
        console.log(`❌ Asset-Test fehlgeschlagen: ${error.message}`);
        testResults.tests.assets = { error: error.message };
        testResults.summary.failed++;
    }

    // Test 4: SEO-Kriterien
    try {
        console.log('\n🔍 Test 4: SEO-Optimierung...');
        const htmlContent = await getWebsiteContent('https://burnitoken.website');
        
        const seoTests = {
            titleLength: htmlContent.match(/<title>(.*?)<\/title>/)?.[1]?.length || 0,
            hasMetaDescription: htmlContent.includes('name="description"'),
            hasCanonicalUrl: htmlContent.includes('rel="canonical"'),
            hasOgTags: htmlContent.includes('property="og:title"'),
            hasTwitterCard: htmlContent.includes('name="twitter:card"'),
            hasStructuredData: htmlContent.includes('application/ld+json'),
            hasHreflang: htmlContent.includes('hreflang='),
            robotsDirective: htmlContent.includes('name="robots"')
        };

        testResults.tests.seo = seoTests;
        
        let seoScore = 0;
        
        // Titel-Länge prüfen
        if (seoTests.titleLength > 30 && seoTests.titleLength < 60) {
            console.log(`✅ Titel-Länge optimal: ${seoTests.titleLength} Zeichen`);
            seoScore++;
        } else {
            console.log(`⚠️ Titel-Länge suboptimal: ${seoTests.titleLength} Zeichen`);
        }
        
        // Weitere SEO-Kriterien
        Object.entries(seoTests).forEach(([test, result]) => {
            if (test !== 'titleLength') {
                if (result) {
                    console.log(`✅ ${test}: Vorhanden`);
                    seoScore++;
                } else {
                    console.log(`❌ ${test}: Fehlt`);
                }
            }
        });

        console.log(`📊 SEO-Score: ${seoScore}/8`);
        
        if (seoScore >= 7) {
            testResults.summary.passed++;
        } else if (seoScore >= 5) {
            testResults.summary.warnings++;
        } else {
            testResults.summary.failed++;
        }
    } catch (error) {
        console.log(`❌ SEO-Test fehlgeschlagen: ${error.message}`);
        testResults.tests.seo = { error: error.message };
        testResults.summary.failed++;
    }

    // Test 5: Performance und Sicherheit
    try {
        console.log('\n⚡ Test 5: Performance und Sicherheit...');
        const response = await makeHttpsRequest('https://burnitoken.website');
        
        const securityHeaders = {
            contentSecurityPolicy: response.headers['content-security-policy'],
            xFrameOptions: response.headers['x-frame-options'],
            xContentTypeOptions: response.headers['x-content-type-options'],
            strictTransportSecurity: response.headers['strict-transport-security'],
            referrerPolicy: response.headers['referrer-policy']
        };

        testResults.tests.security = securityHeaders;
        
        let securityScore = 0;
        Object.entries(securityHeaders).forEach(([header, value]) => {
            if (value) {
                console.log(`✅ ${header}: ${value}`);
                securityScore++;
            } else {
                console.log(`⚠️ ${header}: Nicht gesetzt`);
            }
        });

        console.log(`📊 Sicherheits-Score: ${securityScore}/5`);
        
        if (securityScore >= 4) {
            testResults.summary.passed++;
        } else if (securityScore >= 2) {
            testResults.summary.warnings++;
        } else {
            testResults.summary.failed++;
        }
    } catch (error) {
        console.log(`❌ Performance/Sicherheit-Test fehlgeschlagen: ${error.message}`);
        testResults.tests.security = { error: error.message };
        testResults.summary.failed++;
    }

    // Zusammenfassung
    console.log('\n' + '='.repeat(80));
    console.log('📊 LIVE-WEBSITE ZUSAMMENFASSUNG');
    console.log('='.repeat(80));
    console.log(`✅ Tests bestanden: ${testResults.summary.passed}`);
    console.log(`⚠️ Warnungen: ${testResults.summary.warnings}`);
    console.log(`❌ Tests fehlgeschlagen: ${testResults.summary.failed}`);
    
    const totalTests = testResults.summary.passed + testResults.summary.warnings + testResults.summary.failed;
    const successRate = ((testResults.summary.passed + testResults.summary.warnings * 0.5) / totalTests * 100).toFixed(1);
    
    console.log(`📈 Erfolgsrate: ${successRate}%`);
    
    if (successRate >= 90) {
        console.log('🎉 WEBSITE STATUS: EXZELLENT');
    } else if (successRate >= 75) {
        console.log('👍 WEBSITE STATUS: GUT');
    } else if (successRate >= 50) {
        console.log('⚠️ WEBSITE STATUS: VERBESSERUNG NÖTIG');
    } else {
        console.log('❌ WEBSITE STATUS: KRITISCHE PROBLEME');
    }

    // Speichere detaillierte Ergebnisse
    fs.writeFileSync('live-website-test-results.json', JSON.stringify(testResults, null, 2));
    console.log('\n📁 Detaillierte Ergebnisse in live-website-test-results.json gespeichert');
    
    return testResults;
}

// Hilfsfunktionen
function makeHttpsRequest(url) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        https.get(url, (res) => {
            const responseTime = Date.now() - startTime;
            
            resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                responseTime: responseTime
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function getWebsiteContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Führe umfassende Überprüfung aus
umfassendeLiveUeberpruefung().catch(console.error);
