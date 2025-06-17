#!/usr/bin/env node
/**
 * KOMPLETTE LIVE-WEBSITE ÜBERPRÜFUNG
 * Umfassende Diagnose aller Fehler und Probleme auf burnitoken.website
 */

const https = require('https');
const http = require('http');

console.log('🔍 KOMPLETTE LIVE-WEBSITE ÜBERPRÜFUNG GESTARTET');
console.log('='.repeat(70));
console.log('Ziel: burnitoken.website - Alle Fehler und Probleme finden');
console.log('='.repeat(70));

let allProblems = [];
let testResults = {};

// Erweiterte Test-URLs
const testUrls = [
    'https://burnitoken.website',
    'https://www.burnitoken.website',
    'https://burnitoken.website/',
    'https://burnitoken.website/index.html'
];

function testWebsiteComprehensive(url) {
    return new Promise((resolve) => {
        console.log(`\n🔍 TESTE: ${url}`);
        
        const startTime = Date.now();
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        }, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            let data = '';
            res.on('data', chunk => data += chunk);
            
            res.on('end', () => {
                const result = analyzeWebsiteContent(url, res, data, responseTime);
                testResults[url] = result;
                displayDetailedResults(result);
                resolve(result);
            });
        });
        
        req.on('error', (err) => {
            const errorResult = {
                url: url,
                status: 'ERROR',
                error: err.message,
                problems: [`Verbindungsfehler: ${err.message}`]
            };
            testResults[url] = errorResult;
            console.log(`❌ FEHLER: ${err.message}`);
            resolve(errorResult);
        });
        
        req.on('timeout', () => {
            req.destroy();
            const timeoutResult = {
                url: url,
                status: 'TIMEOUT',
                error: 'Request timeout nach 15 Sekunden',
                problems: ['Website zu langsam - Timeout nach 15 Sekunden']
            };
            testResults[url] = timeoutResult;
            console.log('⏰ TIMEOUT: Website zu langsam');
            resolve(timeoutResult);
        });
    });
}

function analyzeWebsiteContent(url, res, content, responseTime) {
    const problems = [];
    const warnings = [];
    const analysis = {
        url: url,
        status: res.statusCode,
        responseTime: responseTime,
        contentLength: content.length,
        problems: problems,
        warnings: warnings,
        headers: res.headers
    };
    
    // STATUS CODE PRÜFUNG
    if (res.statusCode !== 200) {
        problems.push(`HTTP Status ${res.statusCode} - Erwartet: 200`);
    }
    
    // PERFORMANCE PRÜFUNG
    if (responseTime > 3000) {
        problems.push(`Sehr langsame Ladezeit: ${responseTime}ms (Ziel: <3000ms)`);
    } else if (responseTime > 1000) {
        warnings.push(`Langsame Ladezeit: ${responseTime}ms (Ziel: <1000ms)`);
    }
    
    // CONTENT PRÜFUNG
    if (content.length < 1000) {
        problems.push(`Sehr wenig Inhalt: Nur ${content.length} Bytes`);
    }
    
    // HTML STRUKTUR PRÜFUNG
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<!doctype html>')) {
        problems.push('Fehlende DOCTYPE Deklaration');
    }
    
    if (!content.includes('<html')) {
        problems.push('Fehlende HTML-Struktur');
    }
    
    if (!content.includes('<head>')) {
        problems.push('Fehlende HEAD-Sektion');
    }
    
    if (!content.includes('<body>')) {
        problems.push('Fehlende BODY-Sektion');
    }
    
    // SEO PRÜFUNG
    if (!content.includes('<title>') || content.includes('<title></title>')) {
        problems.push('Fehlender oder leerer Title-Tag');
    }
    
    if (!content.includes('<meta name="description"')) {
        problems.push('Fehlende Meta-Description');
    }
    
    if (!content.includes('viewport')) {
        problems.push('Fehlende Viewport Meta-Tag für Mobile');
    }
    
    // FAVICON PRÜFUNG
    if (!content.includes('favicon')) {
        warnings.push('Kein Favicon erkannt');
    }
    
    // BURNITOKEN SPEZIFISCHE PRÜFUNG
    if (!content.toLowerCase().includes('burni')) {
        problems.push('BurniToken Branding fehlt komplett');
    }
    
    if (!content.toLowerCase().includes('token')) {
        warnings.push('Token-Bezug schwach oder fehlend');
    }
    
    // FUNKTIONALITÄT PRÜFUNG
    if (!content.includes('javascript') && !content.includes('.js')) {
        warnings.push('Keine JavaScript-Funktionalität erkannt');
    }
    
    if (!content.includes('css') && !content.includes('style')) {
        problems.push('Kein CSS/Styling erkannt');
    }
    
    // FORMULAR PRÜFUNG
    if (!content.includes('<form') && !content.includes('newsletter')) {
        warnings.push('Keine Formulare oder Newsletter-Anmeldung gefunden');
    }
    
    // HTTPS/SICHERHEIT PRÜFUNG
    if (url.startsWith('http://')) {
        problems.push('Unsichere HTTP-Verbindung (HTTPS erforderlich)');
    }
    
    // FEHLERHAFTE LINKS PRÜFUNG
    const brokenImagePattern = /src=['"](.*?)['"]/g;
    const images = [...content.matchAll(brokenImagePattern)];
    if (images.length === 0) {
        warnings.push('Keine Bilder gefunden');
    }
    
    // JAVASCRIPT FEHLER PRÜFUNG
    if (content.includes('error') || content.includes('Error') || content.includes('undefined')) {
        warnings.push('Mögliche JavaScript-Fehler im Content erkannt');
    }
    
    // CHARSET PRÜFUNG
    if (!content.includes('charset') && !res.headers['content-type']?.includes('charset')) {
        problems.push('Fehlende Charset-Deklaration');
    }
    
    return analysis;
}

function displayDetailedResults(result) {
    console.log(`\n📊 DETAILLIERTE ANALYSE FÜR: ${result.url}`);
    console.log(`Status: ${result.status}`);
    console.log(`Ladezeit: ${result.responseTime}ms`);
    console.log(`Content-Größe: ${result.contentLength} Bytes`);
    
    if (result.problems && result.problems.length > 0) {
        console.log(`\n🚨 PROBLEME (${result.problems.length}):`);
        result.problems.forEach((problem, i) => {
            console.log(`   ${i + 1}. ❌ ${problem}`);
        });
    }
    
    if (result.warnings && result.warnings.length > 0) {
        console.log(`\n⚠️  WARNUNGEN (${result.warnings.length}):`);
        result.warnings.forEach((warning, i) => {
            console.log(`   ${i + 1}. ⚠️ ${warning}`);
        });
    }
    
    if ((!result.problems || result.problems.length === 0) && 
        (!result.warnings || result.warnings.length === 0)) {
        console.log(`\n✅ KEINE PROBLEME GEFUNDEN!`);
    }
}

function generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 UMFASSENDER FEHLER- UND PROBLEM-BERICHT');
    console.log('='.repeat(80));
    
    let totalProblems = 0;
    let totalWarnings = 0;
    let workingUrls = 0;
    
    Object.values(testResults).forEach(result => {
        if (result.status === 200) workingUrls++;
        if (result.problems) totalProblems += result.problems.length;
        if (result.warnings) totalWarnings += result.warnings.length;
    });
    
    console.log(`\n📈 ZUSAMMENFASSUNG:`);
    console.log(`✅ Funktionierende URLs: ${workingUrls}/${Object.keys(testResults).length}`);
    console.log(`🚨 Gesamte Probleme: ${totalProblems}`);
    console.log(`⚠️  Gesamte Warnungen: ${totalWarnings}`);
    
    if (totalProblems > 0) {
        console.log(`\n🔥 DRINGENDE MASSNAHMEN ERFORDERLICH:`);
        console.log(`Die Website hat ${totalProblems} kritische Probleme die sofort behoben werden müssen!`);
        
        console.log(`\n📋 ALLE GEFUNDENEN PROBLEME:`);
        let problemCounter = 1;
        Object.values(testResults).forEach(result => {
            if (result.problems && result.problems.length > 0) {
                console.log(`\n${result.url}:`);
                result.problems.forEach(problem => {
                    console.log(`   ${problemCounter}. ❌ ${problem}`);
                    problemCounter++;
                });
            }
        });
        
        console.log(`\n🔧 EMPFOHLENE SOFORTMASSNAHMEN:`);
        console.log(`1. HTML-Struktur und DOCTYPE überprüfen`);
        console.log(`2. Title-Tags und Meta-Descriptions hinzufügen`);
        console.log(`3. CSS und JavaScript-Einbindung reparieren`);
        console.log(`4. Performance-Optimierung durchführen`);
        console.log(`5. BurniToken-Branding verstärken`);
        
    } else {
        console.log(`\n🎉 WEBSITE IST GRUNDSÄTZLICH FUNKTIONAL!`);
        if (totalWarnings > 0) {
            console.log(`Aber ${totalWarnings} Verbesserungen sind empfohlen.`);
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 KOMPLETTE ÜBERPRÜFUNG ABGESCHLOSSEN');
}

async function runCompleteCheck() {
    try {
        console.log('\n🚀 Starte umfassende Website-Überprüfung...\n');
        
        // Teste alle URLs parallel
        const promises = testUrls.map(url => testWebsiteComprehensive(url));
        await Promise.all(promises);
        
        // Generiere umfassenden Bericht
        generateComprehensiveReport();
        
    } catch (error) {
        console.error('❌ Fehler bei der Überprüfung:', error.message);
    }
}

// Starte die komplette Überprüfung
runCompleteCheck();
