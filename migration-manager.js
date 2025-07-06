#!/usr/bin/env node

/**
 * IONOS zu Netlify Migration & Google Integration
 * Automatisches Setup für Domain-Transfer und SEO-Optimierung
 */

const fs = require('fs');
const { execSync } = require('child_process');

class MigrationManager {
  constructor() {
    this.domain = 'burnitoken.website';
    this.netlifyUrl = 'endearing-mandazi-d7b985.netlify.app';
    this.migrationSteps = [];
  }

  async executeMigration() {
    console.log('🚀 IONOS → Netlify Migration gestartet...\n');

    try {
      // 1. Netlify Konfiguration finalisieren
      await this.finalizeNetlifyConfig();

      // 2. Google Analytics Integration vorbereiten
      await this.prepareGoogleIntegration();

      // 3. SEO Optimierungen
      await this.optimizeSEO();

      // 4. Deployment mit neuen Konfigurationen
      await this.deployUpdates();

      // 5. Migrations-Anweisungen generieren
      await this.generateMigrationInstructions();

      console.log('\n🎉 Migration Setup abgeschlossen!');
    } catch (error) {
      console.error('❌ Migration Fehler:', error.message);
    }
  }

  async finalizeNetlifyConfig() {
    console.log('⚙️  Netlify Konfiguration finalisieren...');

    // Überprüfe netlify.toml
    if (fs.existsSync('netlify.toml')) {
      const content = fs.readFileSync('netlify.toml', 'utf8');
      if (content.includes('burnitoken.website')) {
        console.log('   ✅ netlify.toml enthält Domain-Redirects');
        this.migrationSteps.push('✅ Netlify Redirects konfiguriert');
      } else {
        console.log('   ⚠️  Domain-Redirects fehlen in netlify.toml');
      }
    }
  }

  async prepareGoogleIntegration() {
    console.log('🔍 Google Integration vorbereiten...');

    // Analytics Code vorbereiten
    if (fs.existsSync('google-analytics-integration.html')) {
      console.log('   ✅ Google Analytics Code bereit');
      this.migrationSteps.push('✅ Google Analytics vorbereitet');
    }

    // Sitemap prüfen
    if (fs.existsSync('sitemap.xml')) {
      const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
      if (sitemap.includes('burnitoken.website')) {
        console.log('   ✅ Sitemap für burnitoken.website konfiguriert');
        this.migrationSteps.push('✅ Sitemap URL korrekt');
      }
    }

    // robots.txt prüfen
    if (fs.existsSync('robots.txt')) {
      const robots = fs.readFileSync('robots.txt', 'utf8');
      if (robots.includes('burnitoken.website') || robots.includes('sitemap.xml')) {
        console.log('   ✅ robots.txt enthält Sitemap-Verweis');
        this.migrationSteps.push('✅ robots.txt optimiert');
      }
    }
  }

  async optimizeSEO() {
    console.log('📈 SEO Optimierungen prüfen...');

    const htmlFiles = ['index.html', 'live-dashboard.html'];

    for (const file of htmlFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Meta Tags prüfen
        const hasTitle = content.includes('<title>');
        const hasDescription = content.includes('name="description"');
        const hasOG = content.includes('property="og:');
        const hasTwitter = content.includes('name="twitter:');

        console.log(`   📄 ${file}:`);
        console.log(`      ${hasTitle ? '✅' : '❌'} Title Tag`);
        console.log(`      ${hasDescription ? '✅' : '❌'} Meta Description`);
        console.log(`      ${hasOG ? '✅' : '❌'} Open Graph Tags`);
        console.log(`      ${hasTwitter ? '✅' : '❌'} Twitter Cards`);

        if (hasTitle && hasDescription && hasOG && hasTwitter) {
          this.migrationSteps.push(`✅ ${file} SEO-optimiert`);
        }
      }
    }
  }

  async deployUpdates() {
    console.log('🚀 Deployment Updates...');

    try {
      // Git Status prüfen
      execSync('git status --porcelain', { stdio: 'pipe' });
      const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;

      if (hasChanges) {
        console.log('   📁 Neue Änderungen gefunden, committe...');
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "feat: IONOS to Netlify migration setup with Google integration"', {
          stdio: 'inherit',
        });
        console.log('   ✅ Changes committed');
        this.migrationSteps.push('✅ Git Changes committed');
      } else {
        console.log('   ℹ️  Keine neuen Änderungen');
      }

      // Check if we can push (remote exists)
      try {
        execSync('git remote get-url origin', { stdio: 'pipe' });
        console.log('   🔄 Pushing zu GitHub...');
        execSync('git push', { stdio: 'inherit' });
        console.log('   ✅ Pushed zu GitHub → Netlify Deployment startet automatisch');
        this.migrationSteps.push('✅ Auto-Deployment zu Netlify ausgelöst');
      } catch {
        console.log('   ℹ️  Git Remote nicht konfiguriert - manueller Push erforderlich');
      }
    } catch (error) {
      console.log(`   ⚠️  Git Operation: ${error.message}`);
    }
  }

  async generateMigrationInstructions() {
    console.log('📋 Migrations-Anweisungen erstellen...');

    const instructions = `# 🎯 MIGRATION BEREIT - NÄCHSTE SCHRITTE

## ✅ Completed Setup
${this.migrationSteps.map((step) => `- ${step}`).join('\n')}

## 🔧 IONOS DNS Setup (KRITISCH)

### In IONOS Domain Center:
1. **Gehe zu:** Domains & SSL → burnitoken.website → DNS
2. **Lösche:** Bestehende A/CNAME Records
3. **Setze:** Neue Netlify DNS Records

\`\`\`dns
# Hauptdomain
A Record:    @      75.2.60.5
AAAA Record: @      2600:1f18:3fff:c001::5

# WWW Subdomain  
CNAME:       www    ${this.netlifyUrl}

# TTL für alle: 300 (5 Minuten)
\`\`\`

## 🌐 Netlify Custom Domain Setup

### In Netlify Dashboard:
1. **Site:** ${this.netlifyUrl}
2. **Gehe zu:** Site settings → Domain management
3. **Add custom domain:** ${this.domain}
4. **DNS Verification:** Folge den Anweisungen
5. **SSL Certificate:** Automatisch nach DNS-Setup

## 🔍 Google Search Console Update

### Neue Sitemap einreichen:
1. **Property:** ${this.domain}
2. **Sitemaps:** https://${this.domain}/sitemap.xml
3. **URL-Prüfung:** Teste neue Domain URLs

### Google Analytics Setup:
1. **Erstelle:** GA4 Property für ${this.domain}
2. **Integration:** Code aus google-analytics-integration.html kopieren
3. **Tracking ID:** Ersetze die Platzhalter-ID durch die echte ID in den entsprechenden Dateien.

## ⏰ Timeline

### Sofort (0-2h):
- ✅ Netlify Custom Domain Setup
- ✅ IONOS DNS Records setzen
- ✅ Google Analytics Property erstellen

### 24-48h (DNS Propagation):
- 🔄 SSL Certificate aktivierung
- 🔄 Domain-Redirects testen
- 🔄 Google Search Console Sitemap

### Nach Go-Live:
- 📊 Performance Monitoring
- 📈 Google Analytics Daten
- 🔍 SEO Rankings überwachen

## 🎯 Erwartete Live URLs

- **Hauptdomain:** https://${this.domain}
- **Dashboard:** https://${this.domain}/live-dashboard.html
- **Redirects:** www.${this.domain} → ${this.domain}
- **Old Netlify:** ${this.netlifyUrl} → ${this.domain}

## ✅ Success Checklist

- [ ] IONOS DNS Records gesetzt
- [ ] Netlify Custom Domain hinzugefügt
- [ ] SSL Certificate aktiv (24-48h)
- [ ] Google Search Console Sitemap eingereicht
- [ ] Google Analytics aktiv
- [ ] Performance Tests bestanden

---

**Status:** 🚀 **READY FOR MIGRATION**
**Next:** IONOS DNS Setup → 24-48h → Full Live Migration

*Alle Konfigurationen sind bereit. Domain-Migration kann JETZT starten!*
`;

    fs.writeFileSync('MIGRATION_INSTRUCTIONS.md', instructions);
    console.log('   ✅ MIGRATION_INSTRUCTIONS.md erstellt');
  }
}

// CLI Ausführung
async function main() {
  const migration = new MigrationManager();
  await migration.executeMigration();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MigrationManager;
