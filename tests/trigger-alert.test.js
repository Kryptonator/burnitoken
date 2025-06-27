/**
 * Fehlerhafter Test, der absichtlich fehlschlägt, um das Alert-System zu testen
 */

describe('Alert System Test', () => {
  test('Dieser Test sollte fehlschlagen, um das Alert-System auszulösen', () => {
    // Dieser Test wird absichtlich fehlschlagen, um die CI-Pipeline und die Benachrichtigungen zu testen.
    expect(true).toBe(false); // Dies wird immer fehlschlagen.
  });
});
