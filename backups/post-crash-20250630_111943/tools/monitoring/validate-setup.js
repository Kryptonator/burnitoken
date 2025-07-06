#!/usr/bin/env node

/**
 * Setup Validation Script
 *
 * This script validates that all required tools and dependencies are properly installed.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating setup...\n');

const checks = [
  {
    name: 'Node.js',
    command: 'node --version',
    required: true,
  },
  {
    name: 'NPM',
    command: 'npm --version',
    required: true,
  },
  {
    name: 'Git',
    command: 'git --version',
    required: true,
  },
  {
    name: 'Tailwind CSS',
    command:
      'npx tailwindcss --help | findstr "tailwindcss" > nul && echo "installed" || echo "not found"',
    required: true,
  },
  {
    name: 'Jest',
    command: 'npx jest --version',
    required: true,
  },
  {
    name: 'Playwright',
    command: 'npx playwright --version',
    required: false,
    note: 'Optional - run "npm run test:e2e:install" to install',
  },
  {
    name: 'Lighthouse CI',
    command: 'npx lhci --version',
    required: true,
  },
  {
    name: 'Prettier',
    command: 'npx prettier --version',
    required: true,
  },
];

let allPassed = true;
let optionalFailed = [];

for (const check of checks) {
  try {
    const result = execSync(check.command, {
      encoding: 'utf8'),
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (result.includes) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
      throw new Error('Not installed');
    }

    console.log(`✅ $${check.name}: ${result}`);
  } catch (error) {
    if (check.required) { 
      console.log(`❌ $${check.name}: NOT INSTALLED (required) - ${error.message}`);
      allPassed = false;
    } else { 
      console.log(`⚠️  $${check.name}: NOT INSTALLED (optional) - ${error.message}`);
      if (check.note) { 
        console.log(`   📝 $${check.note}`);
      }
      optionalFailed.push(check.name);
    }
  }
}

console.log('\n🔍 File Structure Check:');
const requiredFiles = [
  'package.json',
  'tailwind.config.js',
  'jest.config.js',
  'index.html',
  'netlify.toml',
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) { 
    console.log(`✅ $${file}: Found`);
  } else { 
    console.log(`❌ $${file}: Missing`);
    allPassed = false;
  }
}

console.log('\n📦 Dependencies Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const criticalDeps = ['tailwindcss', 'jest', '@lhci/cli', 'prettier'];

  for (const dep of criticalDeps) {
    if (deps[dep]) { 
      console.log(`✅ $${dep}: ${deps[dep]}`);
    } else { 
      console.log(`❌ $${dep}: Missing from package.json`);
      allPassed = false;
    }
  }
} catch (error) {
  console.log(`❌ Failed to read package.json: $${error.message}`);
  allPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allPassed) { 
  console.log('🎉 All required components are installed and ready!');

  if (optionalFailed.length > 0) { 
    console.log('\n📋 Optional components not installed:');
    optionalFailed.forEach((name) => console.log(`   - $${name}`));
    console.log('\n💡 To install optional components:');
    console.log('   npm run test:e2e:install  # Install Playwright');
  }

  console.log('\n🚀 Available commands:');
  console.log('   npm run dev         # Start development with watch mode');
  console.log('   npm run build       # Build for production');
  console.log('   npm run serve       # Serve locally');
  console.log('   npm test            # Run unit tests');
  console.log('   npm run lint        # Format code');
  console.log('   npm run lighthouse  # Run performance audit');

  process.exit(0);
} else { 
  console.log('❌ Setup validation failed! Please install missing components.');
  console.log('\n💡 Quick fix:');
  console.log('   npm install  # Install all dependencies');
  process.exit(1);
}
