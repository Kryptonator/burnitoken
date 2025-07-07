// Überprüft, ob die Sitemap ordnungsgemäß von externen Diensten abgerufen werden kann
// Simpler Test der Sitemap-URL mit Fetch

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');

const SITEMAP_URL = 'https://burnitoken.website/sitemap.xml';
const USER_AGENTS = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Twitterbot/1.0',
];

async function checkSitemapAccess() {
  console.log(`🌐 Überprüfe Erreichbarkeit der Sitemap: ${SITEMAP_URL}`);
  console.log(
    '⚠️ Hinweis: Wenn die Website noch nicht öffentlich erreichbar ist, können Fehler auftreten.\n',
  );

  const agent = new https.Agent({
    rejectUnauthorized: false, // Erlaubt selbstsignierte Zertifikate (nur für Tests!)
  });

  for (const userAgent of USER_AGENTS) {
    try {
      console.log(`🤖 Teste mit User-Agent: ${userAgent.split(' ')[0]}...`);

      const response = await fetch(SITEMAP_URL, {
        headers: { 'User-Agent': userAgent },
        agent,
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
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
        const content = await response.text();
        const contentLength = content.length;
        const isXml = content.trim().startsWith('<?xml');

        console.log(`   Inhaltsgröße: ${contentLength} Bytes`);
        console.log(`   XML-Format: ${isXml ? '✅ Gültig' : '❌ Ungültig'}`);

        if (isXml && contentLength > 100) {
          console.log(
            `   ✅ Sitemap scheint für ${userAgent.split(' ')[0]} korrekt abrufbar zu sein`,
          );
        } else {
          console.log(`   ❌ Sitemap-Inhalt erscheint fehlerhaft für ${userAgent.split(' ')[0]}`);
        }
      } else {
        console.log(`   ❌ Fehler beim Abrufen der Sitemap für ${userAgent.split(' ')[0]}`);
      }
    } catch (error) {
      console.error(`   ❌ Zugriffsversuch fehlgeschlagen: ${error.message}`);
    }
    console.log('');
  }

  console.log('🔍 Prüfungshinweise:');
  console.log('1. Überprüfe, ob die Domain korrekt eingerichtet ist');
  console.log('2. Stelle sicher, dass die robots.txt die Sitemap korrekt referenziert');
  console.log('3. Überprüfe die Netlify-Konfiguration für Redirect-Regeln');
  console.log('4. Warte ggf. auf die vollständige DNS-Propagation');
}

checkSitemapAccess().catch((err) => {
  console.error('❌ Unerwarteter Fehler:', err);
  process.exit(1);
});
