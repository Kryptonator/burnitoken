/**
 * Test for the API CSP fix (Issue #27)
 * Verifies that the Content Security Policy allows CoinGecko API connections
 */

const fs = require('fs');
const path = require('path');

describe('API CSP Fix for Issue #27', () => {
  let indexHtml;

  beforeAll(() => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    indexHtml = fs.readFileSync(indexPath, 'utf8');
  });

  test('CSP should allow connections to CoinGecko API', () => {
    expect(indexHtml).toContain('connect-src \'self\' https://api.coingecko.com');
  });

  test('CSP should maintain security for other connections', () => {
    expect(indexHtml).toContain('default-src \'self\'');
    expect(indexHtml).toContain('script-src \'self\'');
    expect(indexHtml).toContain('style-src \'self\'');
  });

  test('API endpoints should be present in HTML', () => {
    expect(indexHtml).toContain('api.coingecko.com');
  });

  test('Enhanced functionality should use CoinGecko API', () => {
    const enhancedPath = path.join(__dirname, '..', 'assets', 'enhanced-functionality.js');
    const enhancedJs = fs.readFileSync(enhancedPath, 'utf8');
    
    expect(enhancedJs).toContain('api.coingecko.com/api/v3/simple/price');
    expect(enhancedJs).toContain('ids=ripple');
  });

  test('API error handling should be present', () => {
    const enhancedPath = path.join(__dirname, '..', 'assets', 'enhanced-functionality.js');
    const enhancedJs = fs.readFileSync(enhancedPath, 'utf8');
    
    expect(enhancedJs).toContain('.catch(function (error)');
    expect(enhancedJs).toContain('Failed to update XRP price');
  });
});