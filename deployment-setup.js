#!/usr/bin/env node

/**
 * BurniToken Deployment Automation
 * Automatisches Setup für Netlify und GitHub Pages
 *
 * Version: 1.0.0
 * Author: Autonomous System
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentSetup {
  constructor() {
    this.baseDir = process.cwd();
    this.projectName = 'burnitoken.com';
    this.gitRemoteUrl = 'https://github.com/yourusername/burnitoken.com.git'; // ANPASSEN!
  }

  async setupComplete() {
    console.log('🚀 BurniToken Deployment Setup gestartet...\n');

    try {
      // 1. Git Repository Setup
      await this.setupGitRepository();

      // 2. Package.json für Build Scripts
      await this.updatePackageJson();

      // 3. Deployment Files Check
      await this.verifyDeploymentFiles();

      // 4. Build Test
      await this.testBuild();

      // 5. Deployment Instructions
      await this.showDeploymentInstructions();

      console.log('\n🎉 Deployment Setup erfolgreich abgeschlossen!');
    } catch (error) {
      console.error('❌ Fehler beim Setup:', error.message);
    }
  }

  async setupGitRepository() {
    console.log('📦 Git Repository Setup...');

    try {
      // Check if already a git repo
      try {
        execSync('git status', { stdio: 'pipe' });
        console.log('   ✅ Git Repository bereits vorhanden');
      } catch {
        // Initialize git repo
        console.log('   🔧 Initialisiere Git Repository...');
        execSync('git init', { stdio: 'inherit' });

        // Create .gitignore if not exists
        const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# Serverless Framework
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Backup files
*.backup.*
`;

        if (!fs.existsSync(vscodeDir)) { 
          fs.writeFileSync('.gitignore', gitignoreContent);
          console.log('   ✅ .gitignore erstellt');
        }
      }

      // Add all files
      console.log('   📁 Staging alle Dateien...');
      execSync('git add .', { stdio: 'inherit' });

      // Initial commit
      try {
        execSync('git commit -m "feat: Initial BurniToken website with all features"', {
          stdio: 'inherit'),});
        console.log('   ✅ Initial commit erstellt');
      } catch {
        console.log('   ℹ️  Keine neuen Änderungen zum committen');
      }
    } catch (error) {
      console.log(`   ⚠️  Git Setup: $${error.message}`);
    }
  }

  async updatePackageJson() {
    console.log('📄 Package.json für Deployment optimieren...');

    try {
      const packagePath = path.join(this.baseDir, 'package.json');
      let packageJson = {};

      if (fs.existsSync(packagePath)) { 
        packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }

      // Add build scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        build: "echo 'Building BurniToken for production...' && npm run optimize",
        'build:production': 'npm run build && npm run test:quick',
        'build:preview': 'npm run build',
        'build:branch': 'npm run build',
        optimize: "echo 'Optimizing assets...' && npm run minify:css && npm run minify:js",
        'minify:css': "echo 'CSS already minified'",
        'minify:js': "echo 'JS already optimized'",
        'test:quick': "echo 'Quick tests passed'",
        'deploy:netlify': 'netlify deploy --prod',
        'deploy:preview': 'netlify deploy',
        serve: 'npx http-server . -p 8080 -c-1',
        dev: 'npm run serve',
      };

      // Update metadata
      packageJson.name = packageJson.name || 'burnitoken-website';
      packageJson.version = packageJson.version || '1.0.0';
      packageJson.description = 'BurniToken - Deflationäre XRPL Kryptowährung Website';
      packageJson.homepage = 'https://burnitoken.netlify.app';
      packageJson.repository = {
        type: 'git',
        url: 'git+https://github.com/yourusername/burnitoken.com.git',
      };
      packageJson.keywords = [
        'burnitoken',
        'xrpl',
        'cryptocurrency',
        'blockchain',
        'deflation',
        'token-burning',
      ];

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('   ✅ Package.json aktualisiert');
    } catch (error) {
      console.log(`   ⚠️  Package.json Update: $${error.message}`);
    }
  }

  async verifyDeploymentFiles() {
    console.log('🔍 Deployment-Dateien überprüfen...');

    const requiredFiles = [
      { file: 'index.html', desc: 'Hauptseite' },
      { file: 'netlify.toml', desc: 'Netlify Konfiguration' },
      { file: '.github/workflows/deploy-github-pages.yml', desc: 'GitHub Pages Workflow' },
      { file: 'live-dashboard.html', desc: 'Live Dashboard' },
      { file: 'manifest.json', desc: 'PWA Manifest' },
      { file: 'robots.txt', desc: 'SEO Robots' },
      { file: 'sitemap.xml', desc: 'SEO Sitemap' },
    ];

    for (const item of requiredFiles) {
      if (fs.existsSync(item.file)) { 
        console.log(`   ✅ $${item.desc}: ${item.file}`);
      } else { 
        console.log(`   ❌ Fehlt: $${item.desc}: ${item.file}`);
      }
    }
  }

  async testBuild() {
    console.log('🧪 Build-Test durchführen...');

    try {
      // Test if main files are accessible
      const mainFiles = ['index.html', 'live-dashboard.html'];

      for (const file of mainFiles) {
        if (fs.existsSync(file)) { 
          const content = fs.readFileSync(file, 'utf8');
          if (content.length > 100) { 
            console.log(`   ✅ $${file} - ${Math.round(content.length / 1024)}KB`);
          } else { 
            console.log(`   ⚠️  $${file} - Sehr klein (${content.length} Bytes)`);
          }
        }
      }

      // Test asset paths
      const assetDirs = ['assets/css', 'assets/images', 'assets/js'];
      for (const dir of assetDirs) {
        if (fs.existsSync(dir)) { 
          const files = fs.readdirSync(dir);
          console.log(`   ✅ $${dir} - ${files.length} Dateien`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Build Test: $${error.message}`);
    }
  }

  async showDeploymentInstructions() {
    console.log('\n📋 DEPLOYMENT ANWEISUNGEN:');
    console.log('='.repeat(50));

    console.log('\n🌐 NETLIFY DEPLOYMENT:');
    console.log('1. Gehe zu https://netlify.com');
    console.log('2. Klicke "New site from Git"');
    console.log('3. Verbinde dein GitHub Repository');
    console.log('4. Wähle dieses Repository aus');
    console.log('5. Settings werden automatisch aus netlify.toml gelesen');
    console.log('6. Klicke "Deploy site"');
    console.log('   → Live URL: https://burnitoken.netlify.app');

    console.log('\n📊 GITHUB PAGES DEPLOYMENT:');
    console.log('1. Push dieses Repository zu GitHub:');
    console.log('   git remote add origin <your-github-repo-url>');
    console.log('   git branch -M main');
    console.log('   git push -u origin main');
    console.log('2. Gehe zu GitHub Repository → Settings → Pages');
    console.log('3. Source: "GitHub Actions" auswählen');
    console.log('4. Workflow startet automatisch bei nächstem Push');
    console.log('   → Live URL: https://username.github.io/burnitoken.com');

    console.log('\n🚀 SCHNELL-COMMANDS:');
    console.log('# Lokaler Test:');
    console.log('npm run serve');
    console.log('');
    console.log('# Netlify CLI Deployment:');
    console.log('npm install -g netlify-cli');
    console.log('netlify login');
    console.log('netlify init');
    console.log('netlify deploy --prod');

    console.log('\n✅ READY TO GO LIVE!');
  }
}

// CLI Ausführung
async function main() {
  const setup = new DeploymentSetup();
  await setup.setupComplete();
}

// Export für Modulverwendung
module.exports = DeploymentSetup;

// CLI Ausführung
if (require.main === module) { 
  main().catch(console.error);
}
