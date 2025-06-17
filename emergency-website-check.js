cons    const urls = [
        'https://burnitoken.website',
        'https://kryptonator.github.io/burnitoken',
        'https://www.burnitoken.website'
    ];rgencyCheck = async () => {
    console.log('🚨 EMERGENCY WEBSITE CHECK STARTING...');
    console.log('Timestamp:', new Date().toISOString());
    
    const urls = [
        'https://burnitoken.website',
        'https://kryptonator.github.io/burnitoken.com',
        'https://www.burnitoken.website'
    ];
    
    const results = [];
    
    for (const url of urls) {
        try {
            console.log(`\n🔍 Testing: ${url}`);
            
            const start = Date.now();
            const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-cache',
                headers: {
                    'User-Agent': 'Emergency-Check/1.0'
                }
            });
            const loadTime = Date.now() - start;
            
            const result = {
                url,
                status: response.status,
                statusText: response.statusText,
                loadTime,
                success: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            };
            
            results.push(result);
            
            if (response.ok) {
                console.log(`✅ SUCCESS: ${response.status} ${response.statusText} (${loadTime}ms)`);
            } else {
                console.log(`❌ FAILED: ${response.status} ${response.statusText} (${loadTime}ms)`);
            }
            
        } catch (error) {
            console.log(`💥 ERROR: ${error.message}`);
            results.push({
                url,
                error: error.message,
                success: false
            });
        }
    }
    
    console.log('\n📊 EMERGENCY CHECK SUMMARY:');
    console.log('================================');
    results.forEach(result => {
        const status = result.success ? '✅ ONLINE' : '❌ OFFLINE';
        console.log(`${status} - ${result.url}`);
        if (result.status) console.log(`   Status: ${result.status} (${result.loadTime}ms)`);
        if (result.error) console.log(`   Error: ${result.error}`);
    });
    
    const onlineCount = results.filter(r => r.success).length;
    console.log(`\n🎯 RESULT: ${onlineCount}/${results.length} URLs online`);
    
    if (onlineCount === 0) {
        console.log('🚨 CRITICAL: ALL URLs OFFLINE - EMERGENCY DEPLOYMENT REQUIRED!');
    } else if (onlineCount < results.length) {
        console.log('⚠️ WARNING: Some URLs offline - Investigate DNS/redirect issues');
    } else {
        console.log('✅ SUCCESS: All URLs online - Website stable');
    }
    
    return results;
};

// Run emergency check
emergencyCheck().catch(console.error);
