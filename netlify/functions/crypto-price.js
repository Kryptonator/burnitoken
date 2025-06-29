// Netlify Function zur Abfrage aktueller Kryptokurs-Daten
// Endpunkt: /.netlify/functions/crypto-price

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Unterstützte Parameter: ?symbol=ethereum,bitcoin,bnb
    const { symbol = 'ethereum' } = event.queryStringParameters || {};

    // API-Anfrage an CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd,eur&include_24hr_change=true`,
    );

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache-Header für 5 Minuten setzen
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=300', // 5 Minuten Cache
      },
      body: JSON.stringify({
        data,
        timestamp: Date.now(),
        source: 'CoinGecko API',
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch crypto prices',
        message: error.toString(),
      }),
    };
  }
};
