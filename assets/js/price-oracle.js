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
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=burnitoken&vs_currencies=usd',
            parser: (data) => data?.burnitoken?.usd
        },
        {
            name: 'CoinCap',
            url: 'https://api.coincap.io/v2/assets/burnitoken',
            parser: (data) => parseFloat(data?.data?.priceUsd)
        }
        // Weitere Fallback-APIs können hier einfach hinzugefügt werden
    ];

    // Zustand des Moduls, um den aktuellen Status zu verfolgen
    let state = {
        price: null,
        status: 'idle', // idle, loading, success, error
        lastUpdated: null,
        source: null,
        error: null
    };

    /**
     * Aktualisiert alle UI-Elemente, die den Preis anzeigen.
     * Verwendet data-Attribute für eine saubere Trennung von HTML und JS.
     * @param {string} status - Der aktuelle Ladezustand ('loading', 'success', 'error')
     */
    function updateUI(status) {
        const priceElements = document.querySelectorAll('[data-price-display]');
        priceElements.forEach(el => {
            el.classList.remove('loading', 'error', 'success', 'idle');
            el.classList.add(status);

            const valueEl = el.querySelector('[data-price-value]');
            const statusEl = el.querySelector('[data-price-status]');

            switch (status) {
                case 'loading':
                    if (valueEl) valueEl.textContent = '...';
                    if (statusEl) statusEl.textContent = 'Updating...';
                    break;
                case 'success':
                    if (valueEl) valueEl.textContent = `$${state.price.toFixed(4)}`;
                    if (statusEl) statusEl.textContent = `Live from ${state.source}`;
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
     * Versucht, den Preis von einer einzelnen API abzurufen.
     * Implementiert einen robusten Timeout und eine Fehlerbehandlung.
     * @param {object} api - Das API-Objekt mit URL und Parser-Funktion.
     * @returns {Promise<number|null>} - Der Preis oder null bei einem Fehler.
     */
    async function fetchFromAPI(api) {
        try {
            // AbortController für Timeout-Management
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-Sekunden-Timeout

            const response = await fetch(api.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const price = api.parser(data);

            if (typeof price !== 'number' || !isFinite(price)) {
                throw new Error('Parsed price is not a valid number.');
            }
            return price;
        } catch (error) {
            console.error(`[PriceOracle] Error fetching from ${api.name}:`, error.message);
            return null;
        }
    }

    /**
     * Ruft den Preis ab, indem die konfigurierten APIs nacheinander versucht werden,
     * bis ein erfolgreiches Ergebnis erzielt wird.
     */
    async function fetchPrice() {
        state.status = 'loading';
        updateUI('loading');

        for (const api of API_ENDPOINTS) {
            const price = await fetchFromAPI(api);
            if (price !== null) {
                state.price = price;
                state.status = 'success';
                state.lastUpdated = new Date();
                state.source = api.name;
                state.error = null;
                updateUI('success');
                console.log(`[PriceOracle] Price updated from ${api.name}: $${price}`);
                return; // Erfolg, Schleife beenden
            }
        }

        // Wenn alle APIs fehlschlagen
        state.status = 'error';
        state.error = 'All API endpoints failed to provide a valid price.';
        updateUI('error');
        console.error('[PriceOracle] All API endpoints failed.');
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
        getState
    };
})();

// Initialer Aufruf, um die Preise beim Laden der Seite zu holen.
// Stellt sicher, dass das DOM vollständig geladen ist.
document.addEventListener('DOMContentLoaded', () => {
    PriceOracle.fetchPrice();

    // Optional: Preise alle 60 Sekunden automatisch aktualisieren
    setInterval(PriceOracle.fetchPrice, 60000);
});
