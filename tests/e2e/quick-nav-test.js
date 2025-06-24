
      const { test, expect } = require('@playwright/test');
      
      test('Navigation und Statusüberprüfung für https://burnitoken.website/', async ({ page }) => {
        console.log('🔍 Teste Navigation nach: https://burnitoken.website/');
        
        // Seite aufrufen und auf Laden warten
        const response = await page.goto('https://burnitoken.website/', { waitUntil: 'networkidle' });
        
        // Status-Code prüfen
        console.log('🔢 HTTP-Status-Code:', response.status());
        expect(response.ok()).toBeTruthy();
        
        // Titel prüfen
        const title = await page.title();
        console.log('📝 Seitentitel:', title);
        expect(title).not.toBe('');
        
        // Screenshot machen
        await page.screenshot({ path: 'C:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools\.web-vitals-reports\_burnitoken_website_.png' });
      });
    