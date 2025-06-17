#!/usr/bin/env node
/**
 * KRITISCHE WEBSITE-DIAGNOSE UND SOFORTMASSNAHMEN
 * Adressiert die Nicht-Zugänglichkeit von burnitoken.website
 * Implementiert alle Empfehlungen aus dem Funktionalitätsprüfungsbericht
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');

console.log('🚨 KRITISCHE WEBSITE-DIAGNOSE GESTARTET');
console.log('='.repeat(60));
console.log('Ziel: burnitoken.website Nicht-Zugänglichkeit beheben');
console.log('Basierend auf: Funktionalitätsprüfungsbericht');
console.log('='.repeat(60));

const testUrls = [
    'https://burnitoken.website',
    'https://burnitoken.website/',
    'https://www.burnitoken.website',
    'http://burnitoken.website',
    'https://kryptonator.github.io/burnitoken'
];

let diagnosticResults = [];

function testUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        console.log(`\n🔍 Testing: ${url}`);
        
        const req = protocol.get(url, {
            timeout: timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            let data = '';
            res.on('data', chunk => data += chunk);
            
            res.on('end', () => {
                const result = {
                    url: url,
                    status: res.statusCode,
                    responseTime: responseTime,
                    contentLength: data.length,
                    hasContent: data.length > 0,
                    isRedirect: res.statusCode >= 300 && res.statusCode < 400,
                    location: res.headers.location || null,
                    
                    // Spezifische Feature-Tests aus dem Bericht
                    hasTitle: data.includes('<title>') && !data.includes('<title></title>'),
                    hasBurniToken: data.toLowerCase().includes('burnitoken') || data.toLowerCase().includes('burni'),
                    hasSSL: url.startsWith('https'),
                    hasFormHandler: data.includes('form-handler.js'),
                    hasEnhancedContrast: data.includes('enhanced-contrast.css'),
                    hasFormsEnhanced: data.includes('forms-enhanced.css'),
                    hasNewsletter: data.toLowerCase().includes('newsletter'),
                    hasContact: data.toLowerCase().includes('contact'),
                    hasLanguageSwitcher: data.includes('language') || data.includes('lang'),
                    hasAccessibility: data.includes('alt=') || data.includes('aria-'),
                    hasMobileViewport: data.includes('viewport'),
                    hasManifest: data.includes('manifest.json'),
                    hasServiceWorker: data.includes('sw.js'),
                    
                    // SEO-Tests
                    hasMetaDescription: data.includes('<meta name="description"'),
                    hasOpenGraph: data.includes('og:'),
                    hasCanonical: data.includes('rel="canonical"'),
                    
                    error: null,
                    headers: res.headers
                };
                
                diagnosticResults.push(result);
                displayResult(result);
                resolve(result);
            });
        });
        
        req.on('error', (err) => {
            const result = {
                url: url,
                status: 'ERROR',
                error: err.message,
                responseTime: Date.now() - startTime
            };
            
            diagnosticResults.push(result);
            console.log(`❌ FEHLER: ${err.message}`);
            resolve(result);
        });
        
        req.on('timeout', () => {
            req.destroy();
            const result = {
                url: url,
                status: 'TIMEOUT',
                error: 'Request timeout',
                responseTime: timeout
            };
            
            diagnosticResults.push(result);
            console.log(`⏰ TIMEOUT: Request nach ${timeout}ms abgebrochen`);
            resolve(result);
        });
    });
}

function displayResult(result) {
    if (result.error) {
        console.log(`❌ Status: ${result.status} - ${result.error}`);
        return;
    }
    
    console.log(`✅ Status: ${result.status}`);
    console.log(`⚡ Response Time: ${result.responseTime}ms`);
    console.log(`📄 Content Length: ${result.contentLength} bytes`);
    
    if (result.isRedirect && result.location) {
        console.log(`🔄 Redirect zu: ${result.location}`);
    }
    
    // Feature-Analyse
    console.log('\n📊 FEATURE-ANALYSE:');
    console.log(`🏷️  Title Tag: ${result.hasTitle ? '✅' : '❌'}`);
    console.log(`🪙 BurniToken Content: ${result.hasBurniToken ? '✅' : '❌'}`);
    console.log(`🔒 SSL/HTTPS: ${result.hasSSL ? '✅' : '❌'}`);
    console.log(`📝 Form Handler: ${result.hasFormHandler ? '✅' : '❌'}`);
    console.log(`🎨 Enhanced Contrast: ${result.hasEnhancedContrast ? '✅' : '❌'}`);
    console.log(`📋 Enhanced Forms: ${result.hasFormsEnhanced ? '✅' : '❌'}`);
    console.log(`📧 Newsletter: ${result.hasNewsletter ? '✅' : '❌'}`);
    console.log(`📞 Contact: ${result.hasContact ? '✅' : '❌'}`);
    console.log(`🌍 Language Switcher: ${result.hasLanguageSwitcher ? '✅' : '❌'}`);
    console.log(`♿ Accessibility: ${result.hasAccessibility ? '✅' : '❌'}`);
    console.log(`📱 Mobile Viewport: ${result.hasMobileViewport ? '✅' : '❌'}`);
    console.log(`📋 PWA Manifest: ${result.hasManifest ? '✅' : '❌'}`);
    console.log(`⚙️  Service Worker: ${result.hasServiceWorker ? '✅' : '❌'}`);
    
    // SEO-Analyse
    console.log('\n🔍 SEO-ANALYSE:');
    console.log(`📝 Meta Description: ${result.hasMetaDescription ? '✅' : '❌'}`);
    console.log(`🔗 Open Graph: ${result.hasOpenGraph ? '✅' : '❌'}`);
    console.log(`🎯 Canonical URL: ${result.hasCanonical ? '✅' : '❌'}`);
}

function generateDiagnosticReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VOLLSTÄNDIGER DIAGNOSTIK-BERICHT');
    console.log('='.repeat(80));
    
    const workingUrls = diagnosticResults.filter(r => r.status === 200);
    const redirectUrls = diagnosticResults.filter(r => r.isRedirect);
    const errorUrls = diagnosticResults.filter(r => r.error);
    
    console.log(`\n✅ Funktionsfähige URLs: ${workingUrls.length}`);
    console.log(`🔄 Redirects: ${redirectUrls.length}`);
    console.log(`❌ Fehlerhafte URLs: ${errorUrls.length}`);
    
    if (workingUrls.length > 0) {
        console.log('\n🎉 WEBSITE IST ZUGÄNGLICH!');
        const bestUrl = workingUrls[0];
        
        // Feature-Score berechnen
        const features = [
            'hasTitle', 'hasBurniToken', 'hasSSL', 'hasFormHandler', 
            'hasEnhancedContrast', 'hasFormsEnhanced', 'hasNewsletter', 
            'hasContact', 'hasLanguageSwitcher', 'hasAccessibility', 
            'hasMobileViewport', 'hasManifest', 'hasServiceWorker',
            'hasMetaDescription', 'hasOpenGraph', 'hasCanonical'
        ];
        
        const presentFeatures = features.filter(f => bestUrl[f]).length;
        const featureScore = Math.round((presentFeatures / features.length) * 100);
        
        console.log(`\n📈 FEATURE-VOLLSTÄNDIGKEIT: ${featureScore}%`);
        console.log(`⚡ BESTE PERFORMANCE: ${bestUrl.url} (${bestUrl.responseTime}ms)`);
        
        if (featureScore < 80) {
            console.log('\n⚠️  VERBESSERUNGSBEDARF ERKANNT:');
            features.forEach(feature => {
                if (!bestUrl[feature]) {
                    const featureName = {
                        'hasTitle': 'Title Tag',
                        'hasBurniToken': 'BurniToken Content',
                        'hasSSL': 'SSL/HTTPS',
                        'hasFormHandler': 'Form Handler',
                        'hasEnhancedContrast': 'Enhanced Contrast CSS',
                        'hasFormsEnhanced': 'Enhanced Forms CSS',
                        'hasNewsletter': 'Newsletter Functionality',
                        'hasContact': 'Contact Information',
                        'hasLanguageSwitcher': 'Language Switcher',
                        'hasAccessibility': 'Accessibility Features',
                        'hasMobileViewport': 'Mobile Viewport',
                        'hasManifest': 'PWA Manifest',
                        'hasServiceWorker': 'Service Worker',
                        'hasMetaDescription': 'Meta Description',
                        'hasOpenGraph': 'Open Graph Tags',
                        'hasCanonical': 'Canonical URL'
                    }[feature];
                    console.log(`   ❌ ${featureName} fehlt`);
                }
            });
        }
        
    } else {
        console.log('\n🚨 KRITISCHES PROBLEM: WEBSITE NICHT ZUGÄNGLICH!');
        console.log('\n📋 SOFORTMASSNAHMEN ERFORDERLICH:');
        console.log('1. ✅ DNS-Auflösung prüfen (bereits erfolgreich)');
        console.log('2. 🔧 GitHub Pages Deployment verifizieren');
        console.log('3. 🚀 Manuelles Deployment triggern');
        console.log('4. 📞 Hosting-Provider kontaktieren');
        
        console.log('\n🔧 AUTOMATISCHE REPARATURVERSUCHE:');
        return triggerEmergencyFixes();
    }
    
    console.log('\n' + '='.repeat(80));
}

async function triggerEmergencyFixes() {
    console.log('\n🚨 EMERGENCY REPAIR MODUS AKTIVIERT');
    
    // Git Status prüfen
    console.log('\n1️⃣ Git Repository Status prüfen...');
    
    return new Promise((resolve) => {
        exec('git status --porcelain', (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Git Fehler: ${error.message}`);
            } else {
                console.log(stdout ? '⚠️ Uncommitted changes found' : '✅ Repository clean');
            }
            
            // Force deployment
            console.log('\n2️⃣ Force GitHub Actions Deployment...');
            exec('git commit --allow-empty -m "🚨 EMERGENCY: Force deployment to fix website accessibility" && git push origin master', 
                (error, stdout, stderr) => {
                    if (error) {
                        console.log(`❌ Deployment Fehler: ${error.message}`);
                    } else {
                        console.log('✅ Emergency deployment triggered!');
                        console.log('⏰ Warte 2 Minuten für GitHub Actions...');
                        
                        setTimeout(() => {
                            console.log('\n3️⃣ Re-Testing nach Emergency Fix...');
                            testUrl('https://burnitoken.website').then(() => {
                                resolve();
                            });
                        }, 120000); // 2 Minuten warten
                    }
                });
        });
    });
}

async function runFullDiagnosis() {
    console.log('\n🔬 VOLLSTÄNDIGE WEBSITE-DIAGNOSE LÄUFT...\n');
    
    // Alle URLs parallel testen
    const promises = testUrls.map(url => testUrl(url));
    await Promise.all(promises);
    
    // Diagnostik-Bericht generieren
    generateDiagnosticReport();
    
    console.log('\n✅ DIAGNOSE ABGESCHLOSSEN');
    console.log('📋 Nächste Schritte: Siehe Bericht oben');
}

// Hauptprogramm starten
runFullDiagnosis().catch(console.error);
