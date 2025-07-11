const { describe, it, expect } = require('@jest/globals');

describe('Browser Compatibility Tests', () => {
  it('should have a global window object', () => {
    expect(typeof window).not.toBe('undefined');
  });
});
