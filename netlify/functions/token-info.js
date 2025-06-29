// Netlify Function to provide token information
// Endpunkt: /.netlify/functions/token-info

exports.handler = async (event, context) => {
  try {
    // CORS-Header für Anfragen von verschiedenen Ursprüngen
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Basis-Token-Informationen
    const tokenInfo = {
      name: 'BURNI Token',
      symbol: 'BURNI',
      contract: '0x0000000000000000000000000000000000000000', // Hier echte Adresse einsetzen
      network: 'Ethereum',
      decimals: 18,
      totalSupply: '1000000000000000000000000', // 1 Million tokens
      currentPrice: {
        usd: 0.023, // Dynamisch von API abrufen
        eth: 0.0000085, // Dynamisch von API abrufen
      },
      marketCap: {
        usd: 23000000, // Dynamisch berechnen
      },
      links: {
        website: 'https://burnitoken.website',
        twitter: 'https://twitter.com/burnitoken',
        telegram: 'https://t.me/burnitoken',
        github: 'https://github.com/burnitoken',
      },
      lastUpdated: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokenInfo),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', message: error.toString() }),
    };
  }
};
