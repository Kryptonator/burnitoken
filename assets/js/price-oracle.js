/**
 * @file price-oracle.js
 * @description Ein robustes Preis-Orakel für Kryptowährungen mit API-Fallback und Timeout.
 *              Exportiert eine einzige Funktion: fetchPrice(tokenId, currency).
 * @author GitHub Copilot (als technischer Visionär)
 * @version 1.0.0 - 2025-06-24
 */

const PriceOracle = (() => {
    // Konfiguration der Endpunkte und Timeouts. Leicht erweiterbar.
    const CONFIG = {
        TIMEOUT_MS: 5000, // 5 Sekunden Timeout pro API-Anfrage
        PRIMARY_API: {
            // CoinGecko: tokenId ist z.B. 'ripple'
            url: (tokenId, currency) => `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency}`,
            parser: (data, tokenId, currency) => data[tokenId]?.[currency]
        },
        FALLBACK_API: {
            // CoinCap: tokenId ist z.B. 'xrp'
            url: (tokenId, currency) => `https://api.coincap.io/v2/assets/${tokenId}`,
            parser: (data) => parseFloat(data.data?.priceUsd) // CoinCap gibt nur USD zurück, ggf. Umrechnung nötig
        }
    };

    /**
     * Führt einen Fetch-Request mit einem Timeout durch.
     * @param {string} url - Die URL zum Abrufen.
     * @param {number} timeout - Timeout in Millisekunden.
     * @returns {Promise<Response>}
     */
    async function fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(id);
        return response;
    }

    /**
     * Ruft den Preis von einer einzelnen API-Quelle ab.
     * @param {object} api - Das API-Konfigurationsobjekt.
     * @param {string} tokenId - Die ID des Tokens für die jeweilige API.
     * @param {string} currency - Die Zielwährung (z.B. 'usd').
     * @returns {Promise<number|null>}
     */
    async function fetchFromSource(api, tokenId, currency) {
        try {
            const response = await fetchWithTimeout(api.url(tokenId, currency), CONFIG.TIMEOUT_MS);
            if (!response.ok) {
                throw new Error(`API response not OK: ${response.status}`);
            }
            const data = await response.json();
            const price = api.parser(data, tokenId, currency);
            if (typeof price !== 'number' || isNaN(price)) {
                throw new Error('Failed to parse price from API response.');
            }
            return price;
        } catch (error) {
            console.warn(`PriceOracle: Failed to fetch from ${api.url(tokenId, currency)}. Reason:`, error.message);
            return null;
        }
    }

    /**
     * Ruft den Preis für einen Token ab. Versucht zuerst die primäre API,
     * bei einem Fehler wird die Fallback-API verwendet.
     *
     * @param {object} tokenIds - Ein Objekt mit den IDs für die APIs. z.B. { coingecko: 'ripple', coincap: 'xrp' }
     * @param {string} [currency='usd'] - Die gewünschte Währung.
     * @returns {Promise<number|null>} Der Preis als Zahl oder null bei komplettem Fehlschlag.
     */
    async function fetchPrice(tokenIds, currency = 'usd') {
        // 1. Versuch: Primäre API (CoinGecko)
        let price = await fetchFromSource(CONFIG.PRIMARY_API, tokenIds.coingecko, currency);
        if (price !== null) {
            return price;
        }

        // 2. Versuch: Fallback-API (CoinCap)
        console.warn('PriceOracle: Primary API failed. Trying fallback...');
        price = await fetchFromSource(CONFIG.FALLBACK_API, tokenIds.coincap, currency);
        if (price !== null) {
            return price;
        }

        console.error('PriceOracle: All API sources failed. Could not retrieve price.');
        return null;
    }

    // Exportiert nur die öffentliche fetchPrice-Funktion.
    return {
        fetchPrice
    };
})();
