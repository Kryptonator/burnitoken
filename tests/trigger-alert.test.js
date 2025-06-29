/**
 * Fehlerhafter Test, der absichtlich fehlschlägt, um das Alert-System zu testen
 */

describe('Alert System Test', () => {
  test('Dieser Test schlägt absichtlich fehl, um das Alert-System zu triggern', () => {
    // Dieser Test wird absichtlich fehlschlagen
    expect(true).toBe(false); // Dies wird immer fehlschlagen
  });
});
