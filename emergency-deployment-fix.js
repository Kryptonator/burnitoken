#!/usr/bin/env node
/**
 * EMERGENCY DEPLOYMENT FIX
 * Behebt das Website-Zugänglichkeitsproblem für burnitoken.website
 */

const { exec } = require('child_process');
const https = require('https');

console.log('🚨 EMERGENCY DEPLOYMENT FIX GESTARTET');
console.log('='.repeat(60));
console.log('Problem: burnitoken.website nicht zugänglich');
console.log('Lösung: GitHub Pages Deployment reparieren');
console.log('='.repeat(60));

async function diagnoseAndFix() {
    console.log('\n1️⃣ GitHub Pages Settings überprüfen...');
    
    // Teste verschiedene URLs
    const testUrls = [
        'https://burnitoken.website',
        'https://kryptonator.github.io/burnitoken',
        'https://kryptonator.github.io/burnitoken'
    ];
    
    console.log('\n🔍 Teste alle möglichen URLs:');
    
    for (const url of testUrls) {
        await testUrl(url);
    }
    
    console.log('\n2️⃣ Force Deployment triggern...');
    
    // Empty commit to trigger deployment
    exec('git add . && git commit --allow-empty -m "🚨 EMERGENCY: Fix burnitoken.website deployment - Force GitHub Pages rebuild" && git push origin master', 
        (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Git Fehler: ${error.message}`);
            } else {
                console.log('✅ Emergency deployment getriggert!');
                console.log('\n📋 NÄCHSTE SCHRITTE:');
                console.log('1. Warte 2-5 Minuten für GitHub Actions');
                console.log('2. Prüfe GitHub Repository > Settings > Pages');
                console.log('3. Stelle sicher dass Source auf "Deploy from branch" steht');
                console.log('4. Branch sollte "gh-pages" oder "main" sein');
                console.log('5. Custom domain: burnitoken.website');
                console.log('\n⏰ GitHub Actions URL:');
                console.log('https://github.com/kryptonator/burnitoken/actions');
                
                setTimeout(() => {
                    console.log('\n3️⃣ Teste Website nach Deployment...');
                    testUrl('https://burnitoken.website');
                }, 180000); // 3 Minuten warten
            }
        });
}

function testUrl(url) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing: ${url}`);
        
        const startTime = Date.now();
        
        https.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`✅ Status: ${res.statusCode}`);
            console.log(`⚡ Response Time: ${responseTime}ms`);
            
            if (res.statusCode === 200) {
                console.log(`🎉 ${url} - FUNKTIONIERT!`);
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
                console.log(`🔄 ${url} - Redirect zu: ${res.headers.location}`);
            } else {
                console.log(`⚠️ ${url} - Unerwarteter Status`);
            }
            
            resolve();
        }).on('error', (err) => {
            console.log(`❌ ${url} - FEHLER: ${err.message}`);
            resolve();
        }).on('timeout', () => {
            console.log(`⏰ ${url} - TIMEOUT`);
            resolve();
        });
    });
}

console.log('\n🚀 Starte Emergency Deployment Fix...');
diagnoseAndFix().catch(console.error);
