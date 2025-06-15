// Test the updated live prices
async function testLivePrices() {
  console.log('Testing updated live prices...');

  try {
    // Test XRP price
    const xrpResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true',
    );
    const xrpData = await xrpResponse.json();
    console.log('XRP Price from CoinGecko:', xrpData.ripple);

    // Test BURNI token info
    const burniIssuer = 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2';
    console.log('BURNI Issuer Address:', burniIssuer);

    // Test XRPScan API for BURNI
    try {
      const xrpScanResponse = await fetch(
        `https://api.xrpscan.com/api/v1/account/${burniIssuer}/tokens`,
      );
      const xrpScanData = await xrpScanResponse.json();
      console.log('XRPScan data for BURNI issuer:', xrpScanData);
    } catch (error) {
      console.warn('XRPScan API failed:', error);
    }

    // Test Bithomp API for BURNI
    try {
      const bithompResponse = await fetch(`https://bithomp.com/api/v2/token/${burniIssuer}.BURNI`);
      const bithompData = await bithompResponse.json();
      console.log('Bithomp data for BURNI:', bithompData);
    } catch (error) {
      console.warn('Bithomp API failed:', error);
    }

    // Test direct XRPL orderbook
    try {
      const orderBookRequest = {
        method: 'book_offers',
        params: [
          {
            taker_gets: {
              currency: 'BURNI',
              issuer: burniIssuer,
            },
            taker_pays: 'XRP',
            limit: 5,
          },
        ],
      };

      const xrplResponse = await fetch('https://xrplcluster.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBookRequest),
      });

      const xrplData = await xrplResponse.json();
      console.log('XRPL orderbook for BURNI/XRP:', xrplData);
    } catch (error) {
      console.warn('XRPL orderbook API failed:', error);
    }
  } catch (error) {
    console.error('Live price test failed:', error);
  }
}

// Run the test
testLivePrices();
