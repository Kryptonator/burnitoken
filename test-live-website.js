#!/usr/bin/env node
/**
 * Automatischer Live-Website Test
 * Testet burnitoken.com nach jedem lokalen Build
 */

const https = require('https');
const http = require('http');

console.log('🔍 AUTOMATISCHER LIVE-WEBSITE TEST GESTARTET...\n');

function testWebsite(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        const req = protocol.get(url, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    responseTime: responseTime,
                    contentLength: data.length,
                    hasContent: data.length > 0,
                    hasTitle: data.includes('<title>'),
                    hasBurniToken: data.toLowerCase().includes('burnitoken'),
                    hasFormHandler: data.includes('form-handler.js'),
                    hasEnhancedContrast: data.includes('enhanced-contrast.css'),
                    hasFormsEnhanced: data.includes('forms-enhanced.css')
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function runTests() {
    const testUrls = [
        'https://burnitoken.webseit',
        'https://kryptonator.github.io/burnitoken'
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`🌐 Testing: ${url}`);
            const result = await testWebsite(url);
            
            console.log(`✅ Status: ${result.status}`);
            console.log(`⚡ Response Time: ${result.responseTime}ms`);
            console.log(`📄 Content Length: ${result.contentLength} bytes`);
            console.log(`🏷️  Has Title: ${result.hasTitle ? '✅' : '❌'}`);
            console.log(`🪙 Has BurniToken: ${result.hasBurniToken ? '✅' : '❌'}`);
            console.log(`📝 Has Form Handler: ${result.hasFormHandler ? '✅' : '❌'}`);
            console.log(`🎨 Has Enhanced Contrast: ${result.hasEnhancedContrast ? '✅' : '❌'}`);
            console.log(`📋 Has Forms Enhanced: ${result.hasFormsEnhanced ? '✅' : '❌'}`);
            
            if (result.status === 200 && result.hasContent) {
                console.log(`🎉 ${url} - ERFOLGREICH!\n`);
            } else {
                console.log(`⚠️  ${url} - PROBLEM ERKANNT!\n`);
            }
            
        } catch (error) {
            console.log(`❌ ${url} - FEHLER: ${error.message}\n`);
        }
    }
    
    console.log('🔍 AUTOMATISCHER LIVE-WEBSITE TEST ABGESCHLOSSEN');
}

runTests().catch(console.error);
