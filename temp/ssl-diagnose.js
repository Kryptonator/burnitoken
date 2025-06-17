/**
 * 🚨 HTTPS/SSL ZERTIFIKAT DIAGNOSE
 * Prüft warum GitHub Pages als "untrusted" angezeigt wird
 */

const https = require('https');
const { URL } = require('url');

async function diagnoseSSLProblem() {
    console.log('🔍 SSL/HTTPS DIAGNOSE STARTING...');
    console.log('================================');
    
    const testUrls = [
        'https://kryptonator.github.io/burnitoken',
        'https://burnitoken.website',
        'https://github.com/Kryptonator/burnitoken'
    ];
    
    for (const urlString of testUrls) {
        console.log(`\n🔐 Testing: ${urlString}`);
        
        try {
            const url = new URL(urlString);
            
            // Test HTTPS-Verbindung
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'HEAD',
                timeout: 10000,
                rejectUnauthorized: false // Zeigt auch ungültige Zertifikate
            };
            
            const req = https.request(options, (res) => {
                console.log(`   ✅ Status: ${res.statusCode}`);
                console.log(`   🔐 TLS Version: ${res.socket.getProtocol()}`);
                console.log(`   📜 Cipher: ${res.socket.getCipher()?.name || 'Unknown'}`);
                
                // Zertifikat-Info
                const cert = res.socket.getPeerCertificate();
                if (cert) {
                    console.log(`   📋 Certificate Subject: ${cert.subject.CN}`);
                    console.log(`   🏢 Certificate Issuer: ${cert.issuer.CN}`);
                    console.log(`   📅 Valid From: ${cert.valid_from}`);
                    console.log(`   📅 Valid To: ${cert.valid_to}`);
                    console.log(`   ✅ Certificate Valid: ${cert.valid_to > new Date()}`);
                } else {
                    console.log(`   ❌ No certificate information available`);
                }
            });
            
            req.on('error', (error) => {
                console.log(`   💥 HTTPS Error: ${error.message}`);
                if (error.code === 'CERT_UNTRUSTED') {
                    console.log(`   🚨 CERTIFICATE UNTRUSTED!`);
                } else if (error.code === 'ENOTFOUND') {
                    console.log(`   🚨 DOMAIN NOT FOUND!`);
                } else if (error.code === 'ECONNREFUSED') {
                    console.log(`   🚨 CONNECTION REFUSED!`);
                }
            });
            
            req.on('timeout', () => {
                console.log(`   ⏰ REQUEST TIMEOUT`);
                req.destroy();
            });
            
            req.end();
            
            // Warte zwischen Requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
    }
    
    console.log('\n🎯 MÖGLICHE URSACHEN FÜR "UNTRUSTED":');
    console.log('=====================================');
    console.log('1. 🚨 Abgelaufenes SSL-Zertifikat');
    console.log('2. 🚨 Selbstsigniertes Zertifikat');
    console.log('3. 🚨 Falscher Domain-Name im Zertifikat');
    console.log('4. 🚨 GitHub Pages noch nicht vollständig propagiert');
    console.log('5. 🚨 CNAME-Konfiguration fehlerhaft');
    console.log('6. 🚨 GitHub Pages Settings Problem');
    
    console.log('\n💡 SOFORT-LÖSUNGEN:');
    console.log('===================');
    console.log('✅ 1. GitHub Pages Settings überprüfen');
    console.log('✅ 2. CNAME-Datei validieren');
    console.log('✅ 3. Custom Domain neu konfigurieren');
    console.log('✅ 4. DNS-Settings beim Domain-Provider prüfen');
    console.log('✅ 5. "Enforce HTTPS" in GitHub Pages aktivieren');
}

// Diagnose starten
diagnoseSSLProblem().catch(console.error);
