// Live-Preis Konfiguration für Burni Token
const PRICE_CONFIG = {
  // API-Endpunkte
  APIs: {
    coingecko: 'https://api.coingecko.com/api/v3',
    xrplData: 'https://data.ripple.com/v2',
    xrpScan: 'https://api.xrpscan.com/api/v1',
    bitrue: 'https://www.bitrue.com/api/v1',
    backup: 'https://s1.ripple.com:51234',
    xrplLivenet: 'https://livenet.xrpl.org',
    rippleExplorer: 'https://github.com/ripple/explorer',
    xrplServices: 'https://s1.ripple.com:51234',
    xrplMainnet: 'wss://xrplcluster.com',
  },

  // Token-Konfiguration (diese müssen mit echten Daten aktualisiert werden)
  TOKENS: {
    XRP: {
      symbol: 'XRP',
      decimals: 6,
      sources: ['coingecko'],
      coingeckoId: 'ripple',
    },
    XPM: {
      symbol: 'XPM',
      issuer: 'rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa',
      decimals: 6,
      sources: ['xrpl'],
      currentPrice: 0.024, // Fallback basierend auf Screenshot
      priceInXRP: 0.048,
    },
    BURNI: {
      symbol: 'BURNI',
      issuer: 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2', // Korrekte BURNI Issuer-Adresse
      decimals: 6,
      sources: ['xrpl'],
      currentPrice: 0.0013, // Fallback basierend auf Screenshot
      priceInXRP: 0.0026,
    },
  },

  // Update-Einstellungen
  UPDATE_INTERVALS: {
    fast: 10000, // 10 Sekunden für Tests
    normal: 30000, // 30 Sekunden Standard
    slow: 60000, // 1 Minute für Produktion
  },

  // Preis-Formatierung
  FORMATTING: {
    XRP: { decimals: 4, prefix: '$' },
    XPM: { decimals: 6, prefix: '$' },
    BURNI: { decimals: 6, prefix: '$' },
  },
};

// Utility-Funktionen für Live-Preise
class LivePriceUtils {
  static async fetchXRPPrice() {
    try {
      const response = await fetch(
        `${PRICE_CONFIG.APIs.coingecko}/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true`,
      );
      const data = await response.json();

      if (data.ripple) {
        return {
          price: data.ripple.usd,
          change24h: data.ripple.usd_24h_change || 0,
          source: 'coingecko',
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.warn('CoinGecko XRP fetch failed:', error);
    }

    return {
      price: 0.5, // Fallback
      change24h: 0,
      source: 'fallback',
      timestamp: Date.now(),
    };
  }

  static async fetchXRPLTokenPrice(tokenSymbol) {
    const tokenConfig = PRICE_CONFIG.TOKENS[tokenSymbol];
    if (!tokenConfig || !tokenConfig.issuer) {
      return {
        price: tokenConfig.currentPrice,
        change24h: 0,
        source: 'static',
        timestamp: Date.now(),
      };
    }

    // Verschiedene XRPL-APIs versuchen
    const endpoints = [
      `${PRICE_CONFIG.APIs.xrplData}/accounts/${tokenConfig.issuer}/orders`,
      `${PRICE_CONFIG.APIs.xrpScan}/token/${tokenSymbol}/${tokenConfig.issuer}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        // API-spezifische Datenverarbeitung
        if (data.orders && data.orders.length > 0) {
          const order = data.orders[0];
          const priceInXRP = parseFloat(order.price) || tokenConfig.priceInXRP;

          // XRP-Preis für USD-Konvertierung abrufen
          const xrpData = await LivePriceUtils.fetchXRPPrice();

          return {
            price: priceInXRP * xrpData.price,
            priceInXRP: priceInXRP,
            change24h: 0, // TODO: Historische Daten implementieren
            source: endpoint,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch ${tokenSymbol} from ${endpoint}:`, error);
        continue;
      }
    }

    // Fallback zu statischen Preisen
    const xrpData = await LivePriceUtils.fetchXRPPrice();
    return {
      price: tokenConfig.priceInXRP * xrpData.price,
      priceInXRP: tokenConfig.priceInXRP,
      change24h: 0,
      source: 'fallback',
      timestamp: Date.now(),
    };
  }

  static formatPrice(symbol, price) {
    const format = PRICE_CONFIG.FORMATTING[symbol];
    if (!format) return `$${price.toFixed(6)}`;

    return `${format.prefix}${price.toFixed(format.decimals)}`;
  }

  static async getAllPrices() {
    const prices = {};

    // XRP-Preis abrufen
    prices.XRP = await LivePriceUtils.fetchXRPPrice();

    // XPM-Preis abrufen
    prices.XPM = await LivePriceUtils.fetchXRPLTokenPrice('XPM');

    // BURNI-Preis abrufen
    prices.BURNI = await LivePriceUtils.fetchXRPLTokenPrice('BURNI');

    return prices;
  }
}

// Globale Verfügbarkeit für Price Tracker
window.PRICE_CONFIG = PRICE_CONFIG;
window.LivePriceUtils = LivePriceUtils;

// Automatischer Test beim Laden
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Live-Preis System initialisiert');
  console.log('📊 Teste Live-Preise...');

  try {
    const prices = await LivePriceUtils.getAllPrices();
    console.log('✅ Live-Preise erfolgreich abgerufen:', prices);

    // Event für Price Tracker
    const event = new CustomEvent('livePricesReady', { detail: prices });
    document.dispatchEvent(event);
  } catch (error) {
    console.error('❌ Live-Preis Test fehlgeschlagen:', error);
  }
});

export { PRICE_CONFIG, LivePriceUtils };
