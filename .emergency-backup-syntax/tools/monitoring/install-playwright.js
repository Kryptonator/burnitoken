#!/usr/bin/env node

/**
 * Playwright Installation Script
 *
 * This script installs Playwright and its dependencies.
 * It can be run independently when Playwright tests are needed.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎭 Installing Playwright...');

try {
  // Check if we're in a DevContainer or CI environment
  const isCI = process.env.CI === 'true';
  const isDevContainer =
    process.env.REMOTE_CONTAINERS === 'true' ||
    process.env.CODESPACES === 'true' ||
    fs.existsSync('/.devcontainer');

  console.log(`Environment: ${isCI ? 'CI' : isDevContainer ? 'DevContainer' : 'Local'}`);

  // Install Playwright
  console.log('📦 Installing Playwright package...');
  execSync('npm install --save-dev @playwright/test', { stdio: 'inherit' });

  // Install browsers with dependencies
  console.log('🎭 Installing Playwright browsers...');
  if (isCI || isDevContainer) {
    {
      {
        {
          {
            {
              {
                {
                  {
                    {
                      {
                        {
                          {
                            {
                              {
                                {
                                  {
                                    {
                                      {
                                        {
                                          {
                                            {
                                              {
                                                {
                                                  {
                                                    {
                                                      {
                                                        {
                                                          {
                                                            {
                                                              {
                                                                {
                                                                  {
                                                                    {
                                                                      {
                                                                        {
                                                                          {
                                                                            {
                                                                              {
                                                                                {
                                                                                  {
                                                                                    {
                                                                                      {
                                                                                        {
                                                                                          {
                                                                                            {
                                                                                              {
                                                                                                {
                                                                                                  {
                                                                                                    {
                                                                                                      {
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
    execSync('npx playwright install --with-deps', { stdio: 'inherit' });
  } else {
    execSync('npx playwright install', { stdio: 'inherit' });
  }

  // Verify installation
  console.log('✅ Verifying Playwright installation...');
  execSync('npx playwright --version', { stdio: 'inherit' });

  console.log('🎉 Playwright installation completed successfully!');
  console.log('');
  console.log('You can now run:');
  console.log('  npm test                 # Run all tests');
  console.log('  npx playwright test      # Run Playwright tests');
  console.log('  npx playwright test --ui # Run with UI mode');
} catch (error) {
  console.error('❌ Playwright installation failed:', error.message);
  console.log('');
  console.log('Manual installation steps:');
  console.log('1. npm install --save-dev @playwright/test');
  console.log('2. npx playwright install --with-deps');
  process.exit(1);
}
