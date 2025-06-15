// Test Script für Live-Preise
console.log('Testing Live Price Updates...');

// Aktuelle bekannte Preise (basierend auf Screenshot)
const expectedPrices = {
  BURNI: 0.0013,
  XRP: 0.5,
  XPM: 0.024,
};

// Test der Price Tracker Funktionalität
async function testPriceTracker() {
  try {
    console.log('🔍 Initialisiere Price Tracker...');

    // Simuliere den Price Tracker
    const testTracker = {
      async fetchXRPPrice() {
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true',
          );
          const data = await response.json();

          if (data.ripple) {
            return {
              price: data.ripple.usd,
              change24h: data.ripple.usd_24h_change || 0,
            };
          }
        } catch (error) {
          console.warn('CoinGecko API failed, using fallback:', error);
        }

        return {
          price: expectedPrices.XRP,
          change24h: 0,
        };
      },

      async fetchStaticPrices() {
        return {
          XRP: {
            price: expectedPrices.XRP,
            change24h: 0,
          },
          XPM: {
            price: expectedPrices.XPM,
            change24h: 0,
            priceInXRP: 0.048,
          },
          BURNI: {
            price: expectedPrices.BURNI,
            change24h: 0,
            priceInXRP: 0.0026,
          },
        };
      },
    };

    console.log('📊 Teste XRP Preis-Abruf...');
    const xrpData = await testTracker.fetchXRPPrice();
    console.log('XRP:', xrpData);

    console.log('📊 Teste Fallback-Preise...');
    const staticPrices = await testTracker.fetchStaticPrices();
    console.log('Alle Preise:', staticPrices);

    // Vergleiche mit erwarteten Preisen
    console.log('\n🎯 Preis-Vergleich:');
    console.log(`BURNI: Erwartet $${expectedPrices.BURNI}, Erhalten $${staticPrices.BURNI.price}`);
    console.log(`XRP: Erwartet $${expectedPrices.XRP}, Erhalten $${xrpData.price}`);
    console.log(`XPM: Erwartet $${expectedPrices.XPM}, Erhalten $${staticPrices.XPM.price}`);

    // Aktualisiere das Display
    updatePriceDisplay(staticPrices);
  } catch (error) {
    console.error('❌ Test fehlgeschlagen:', error);
  }
}

function updatePriceDisplay(prices) {
  console.log('\n🔄 Aktualisiere Preis-Display...');

  Object.keys(prices).forEach((symbol) => {
    const priceData = prices[symbol];
    console.log(
      `${symbol}: $${priceData.price.toFixed(symbol === 'XRP' ? 4 : 6)} (${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`,
    );
  });
}

// Test sofort ausführen
testPriceTracker();

// Test alle 10 Sekunden wiederholen
setInterval(() => {
  console.log('\n⏰ Erneuter Test...');
  testPriceTracker();
}, 10000);

console.log('\n💡 Tipp: Drücken Sie Ctrl+Shift+P im Browser, um den Price Tracker zu öffnen!');
