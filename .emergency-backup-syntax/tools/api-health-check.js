/**
 * API Health Check
 *
 * Checks the status of critical external API endpoints the website relies on.
 */

const https = require('https');

// --- Configuration ---
const API_ENDPOINTS = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
  },
  // Add other critical API endpoints here
];

const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * Logs a message to the console with a timestamp.
 * @param {string} message The message to log.
 * @param {'info' | 'success' | 'error' | 'warn'} level The log level.
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [API Check] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

/**
 * Checks a single API endpoint.
 * @param {{name: string, url: string}} endpoint The API endpoint to check.
 * @returns {Promise<boolean>} True if the endpoint is healthy, false otherwise.
 */
function checkApiEndpoint(endpoint) {
  return new Promise((resolve) => {
    log(`Checking API: ${endpoint.name}...`);
    const request = https.get(endpoint.url, { timeout: REQUEST_TIMEOUT }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
          log(`SUCCESS: ${endpoint.name} is responsive. Status: ${res.statusCode}`, 'success');
          resolve(true);
        } else {
          log(`ERROR: ${endpoint.name} returned status ${res.statusCode}.`, 'error');
          resolve(false);
        }
      });
    });

    request.on('timeout', () => {
      log(`ERROR: ${endpoint.name} request timed out after ${REQUEST_TIMEOUT}ms.`, 'error');
      request.destroy();
      resolve(false);
    });

    request.on('error', (err) => {
      log(`ERROR: Failed to check ${endpoint.name}. Details: ${err.message}`, 'error');
      resolve(false);
    });

    request.end();
  });
}

/**
 * Runs the health check for all configured API endpoints.
 */
async function runApiHealthCheck() {
  log('Starting API Health Check for all endpoints...');
  let allApisHealthy = true;
  let unhealthyApis = [];

  for (const endpoint of API_ENDPOINTS) {
    const isHealthy = await checkApiEndpoint(endpoint);
    if (!isHealthy) {
      allApisHealthy = false;
      unhealthyApis.push(endpoint.name);
    }
  }

  if (allApisHealthy) {
    log('All API endpoints are healthy. ✅', 'success');
  } else {
    const errorMessage = `API Health Check Failed. Unhealthy services: ${unhealthyApis.join(', ')}`;
    log(errorMessage, 'error');
    // The main health check script will handle alerts and todos.
  }
  log('API Health Check finished.');
  return { allHealthy: allApisHealthy, unhealthy: unhealthyApis };
}

// If run directly, execute the check
if (require.main === module) {
  runApiHealthCheck().catch((error) => {
    log(`A critical error occurred during the API health check: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runApiHealthCheck,
};
