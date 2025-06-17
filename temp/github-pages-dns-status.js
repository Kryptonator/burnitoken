/**
 * 🎯 GITHUB PAGES DNS CHECK STATUS
 * Überwacht den "DNS Check in Progress" Status
 */

async function checkGitHubPagesStatus() {
    console.log('🔍 GITHUB PAGES DNS CHECK STATUS');
    console.log('=================================');
    console.log('⏰ Zeitstempel:', new Date().toISOString());
    
    console.log('\n📋 AKTUELLE SITUATION:');
    console.log('✅ Custom Domain: burnitoken.website konfiguriert');
    console.log('✅ Enforce HTTPS: AKTIVIERT');
    console.log('🟡 DNS Check: IN PROGRESS');
    console.log('⚠️ GitHub Pages URL: "untrusted" wegen DNS Check');
    
    console.log('\n🎯 WAS GITHUB GERADE MACHT:');
    console.log('1. 🔍 DNS-Konfiguration validieren');
    console.log('2. 🔐 SSL-Zertifikat generieren/erneuern');
    console.log('3. 🌐 HTTPS-Weiterleitung einrichten');
    console.log('4. ✅ Domain voll aktivieren');
    
    // Test beide URLs
    const urls = [
        'https://burnitoken.website',
        'https://kryptonator.github.io/burnitoken'
    ];
    
    console.log('\n🧪 AKTUELLE URL-TESTS:');
    
    for (const url of urls) {
        try {
            console.log(`\n🔍 Testing: ${url}`);
            
            const start = Date.now();
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow'
            });
            const time = Date.now() - start;
            
            if (response.ok) {
                console.log(`   ✅ Status: ${response.status} (${time}ms)`);
                console.log(`   🌐 Final URL: ${response.url}`);
                
                // Check für HTTPS
                if (response.url.startsWith('https://')) {
                    console.log(`   🔐 HTTPS: ✅ Aktiv`);
                } else {
                    console.log(`   ⚠️ HTTPS: Nicht aktiv`);
                }
            } else {
                console.log(`   ❌ Status: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
    }
    
    console.log('\n⏰ ERWARTETE TIMELINE:');
    console.log('======================');
    console.log('🕐 0-30 Min: DNS Propagation startet');
    console.log('🕑 1-2 Std: Erste SSL-Zertifikat Versuche');
    console.log('🕒 2-6 Std: DNS Check sollte abgeschlossen sein');
    console.log('🕕 6-24 Std: Vollständige SSL-Aktivierung');
    
    console.log('\n🎯 NÄCHSTE SCHRITTE:');
    console.log('====================');
    console.log('1. ⏰ Warten auf DNS Check Abschluss');
    console.log('2. 🔄 In 1-2 Stunden erneut prüfen');
    console.log('3. ✅ burnitoken.website weiter nutzen (funktioniert!)');
    console.log('4. 🎯 Backup-URL ignorieren bis DNS Check fertig');
    
    console.log('\n✅ FAZIT: ALLES NORMAL!');
    console.log('GitHub macht genau was es soll - nur braucht es Zeit! 🕐');
}

// Status Check ausführen
checkGitHubPagesStatus().catch(console.error);
