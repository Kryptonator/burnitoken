/**
 * Price Oracle Module
 *
 * Kapselt die Logik zum Abrufen von Preisdaten von mehreren APIs,
 * implementiert einen Fallback-Mechanismus und verwaltet Lade-, Erfolgs- und Fehlerzustände.
 *
 * @version 1.1.0
 * @date 2025-06-25
 */

const PriceOracle = (() => {
  // Konfiguration der API-Endpunkte (primär, sekundär, etc.)
  const API_ENDPOINTS = [
    {
      name: 'CoinGecko',
      buildUrl: (tokenIds, vsCurrency) =>
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.coingecko}&vs_currencies=${vsCurrency}`,
      parser: (data, tokenIds) => data?.[tokenIds.coingecko]?.usd,
    },
    {
      name: 'CoinCap',
      buildUrl: (tokenIds, vsCurrency) =>
        tokenIds.coincap ? `https://api.coincap.io/v2/assets/${tokenIds.coincap}` : null,
      parser: (data, tokenIds) => parseFloat(data?.data?.priceUsd),
    },
    // Weitere Fallback-APIs können hier einfach hinzugefügt werden
  ];

  // Zustand des Moduls, um den aktuellen Status zu verfolgen
  let state = {
    prices: {}, // Speichert Preise für verschiedene Tokens
    status: 'idle', // idle, loading, success, error
    lastUpdated: null,
    error: null,
  };

  /**
   * Aktualisiert UI-Elemente basierend auf dem Token-Namen.
   * @param {string} tokenId - z.B. 'burni', 'xrp'
   * @param {string} status - 'loading', 'success', 'error'
   * @param {object|null} data - Preisdaten bei Erfolg
   */
  function updateUI(tokenId, status, data = null) {
    const elements = document.querySelectorAll(`[data-price-widget="${tokenId}"]`);
    elements.forEach((widget) => {
      const valueEl = widget.querySelector('[data-price-value]');
      const statusEl = widget.querySelector('[data-price-status]');
      widget.dataset.status = status;

      switch (status) {
        case 'loading':
          if (valueEl) valueEl.textContent = '...';
          if (statusEl) statusEl.textContent = 'Updating...';
          break;
        case 'success':
          if (valueEl && data.formatter) {
            valueEl.textContent = data.formatter(data.price);
          } else if (valueEl) {
            valueEl.textContent = `$${data.price.toFixed(6)}`;
          }
          if (statusEl) statusEl.textContent = `Live from ${data.source}`;
          break;
        case 'error':
          if (valueEl) valueEl.textContent = 'N/A';
          if (statusEl) statusEl.textContent = 'Data unavailable';
          break;
        default:
          if (valueEl) valueEl.textContent = '-';
          if (statusEl) statusEl.textContent = 'Idle';
          break;
      }
    });
  }

  /**
   * Ruft den Preis für ein bestimmtes Token von einer einzelnen API ab.
   * @param {object} apiConfig - Die API-Konfiguration mit URL-Builder und Parser.
   * @param {object} tokenIds - Die IDs des Tokens für verschiedene Dienste (z.B. { coingecko: 'ripple' })
   * @param {string} vsCurrency - Die Währung (z.B. 'usd')
   * @returns {Promise<number|null>}
   */
  async function fetchFromAPI(apiConfig, tokenIds, vsCurrency) {
    const apiUrl = apiConfig.buildUrl(tokenIds, vsCurrency);
    if (!apiUrl) return null; // Wenn die API das Token nicht unterstützt

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const price = apiConfig.parser(data, tokenIds);

      if (typeof price !== 'number' || !isFinite(price)) {
        throw new Error('Parsed price is not a valid number.');
      }
      return price;
    } catch (error) {
      console.error(`[PriceOracle] Error fetching from ${apiConfig.name}:`, error.message);
      return null;
    }
  }

  /**
   * Ruft den Preis für ein bestimmtes Token ab und durchläuft die Fallback-APIs.
   * @param {string} widgetId - Die ID des Widgets im HTML (data-price-widget="...")
   * @param {object} tokenIds - Die IDs des Tokens für verschiedene Dienste (z.B. { coingecko: 'ripple', coincap: 'xrp' })
   * @param {string} vsCurrency - Die Währung, in der der Preis angefordert wird (z.B. 'usd').
   * @param {function} formatter - Funktion zur Formatierung des Preises.
   * @returns {Promise<number|null>} - Der abgerufene Preis oder null bei Fehler.
   */
  async function fetchPrice(widgetId, tokenIds, vsCurrency = 'usd', formatter = null) {
    const cacheKey = Object.values(tokenIds).join('-'); // Interner Schlüssel für Caching
    updateUI(widgetId, 'loading');

    for (const api of API_ENDPOINTS) {
      const price = await fetchFromAPI(api, tokenIds, vsCurrency);
      if (price !== null) {
        state.prices[cacheKey] = {
          price,
          source: api.name,
          lastUpdated: new Date(),
          formatter,
        };
        state.status = 'success';
        updateUI(widgetId, 'success', state.prices[cacheKey]);
        console.log(`[PriceOracle] Price for ${widgetId} updated from ${api.name}: $${price}`);
        return price;
      }
    }

    state.status = 'error';
    state.error = `Failed to fetch price for ${widgetId}.`;
    updateUI(widgetId, 'error');
    console.error(`[PriceOracle] All API endpoints failed for ${widgetId}.`);
    return null;
  }

  /**
   * Gibt eine Kopie des aktuellen Zustands des Orakels zurück.
   * @returns {object}
   */
  function getState() {
    return { ...state };
  }

  // Öffentliches Interface des Moduls
  return {
    fetchPrice,
    getState,
  };
})();
