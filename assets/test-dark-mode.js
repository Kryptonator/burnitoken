/**
 * BURNI DARK MODE TEST SCRIPT
 * Überprüft die Dark-Mode-Funktionalität
 */

console.log('🌙 DARK MODE TEST GESTARTET');

function testDarkMode() {
  console.log('='.repeat(50));
  console.log('🧪 DARK MODE FUNKTIONALITÄTS-TEST');
  console.log('='.repeat(50));

  // 1. Überprüfe, ob BurniDarkModeManager geladen ist
  if (typeof window.BurniDarkModeManager !== 'undefined') 
    console.log('✅ BurniDarkModeManager Klasse geladen');
  } else {
    console.log('❌ BurniDarkModeManager Klasse NICHT geladen');
    return;
  }

  // 2. Überprüfe, ob die Instanz existiert
  if (window.burniDarkMode) {
    console.log('✅ burniDarkMode Instanz existiert');
  } else {
    console.log('⚠️ burniDarkMode Instanz noch nicht erstellt - erstelle jetzt...');
    window.burniDarkMode = new window.BurniDarkModeManager();
  }

  // 3. Überprüfe Toggle-Button
  const toggleButton = document.getElementById('burni-dark-mode-toggle');
  if (toggleButton) {
    console.log('✅ Dark Mode Toggle-Button gefunden');
    console.log('📍 Button Position:', toggleButton.style.position || 'CSS-gesteuert');
  } else {
    console.log('❌ Dark Mode Toggle-Button NICHT gefunden');
  }

  // 4. Überprüfe aktuelle Theme-Einstellung
  const currentTheme = window.burniDarkMode?.getCurrentTheme() || 'unbekannt';
  console.log('🎨 Aktuelles Theme:', currentTheme);

  // 5. Überprüfe HTML-Klassen
  const htmlClasses = document.documentElement.classList;
  const bodyClasses = document.body.classList;

  console.log('📄 HTML Klassen:', Array.from(htmlClasses).join(', ') || 'keine');
  console.log('📄 Body Klassen:', Array.from(bodyClasses).join(', ') || 'keine');

  // 6. Teste Theme-Wechsel
  console.log('\n🔄 TESTE THEME-WECHSEL...');

  if (window.burniDarkMode) {
    const originalTheme = window.burniDarkMode.getCurrentTheme();
    console.log('🎯 Original Theme:', originalTheme);

    // Wechsle Theme
    window.burniDarkMode.toggle();

    setTimeout(() => {
      const newTheme = window.burniDarkMode.getCurrentTheme();
      console.log('🎯 Neues Theme:', newTheme);

      if (newTheme !== originalTheme) {
        console.log('✅ Theme-Wechsel ERFOLGREICH');
      } else {
        console.log('❌ Theme-Wechsel FEHLGESCHLAGEN');
      }

      // Überprüfe CSS-Klassen nach dem Wechsel
      const htmlAfter = document.documentElement.classList.contains('dark');
      const bodyAfter = document.body.classList.contains('dark-mode');

      console.log('📄 HTML hat "dark" Klasse:', htmlAfter);
      console.log('📄 Body hat "dark-mode" Klasse:', bodyAfter);

      // Überprüfe LocalStorage
      try {
        const stored = localStorage.getItem('burni-dark-mode');
        console.log('💾 LocalStorage Wert:', stored);
      } catch (error) {
        console.log('⚠️ LocalStorage nicht verfügbar');
      }

      // Teste noch einmal zurück
      console.log('\n🔄 TESTE RÜCKWECHSEL...');
      window.burniDarkMode.toggle();

      setTimeout(() => {
        const finalTheme = window.burniDarkMode.getCurrentTheme();
        console.log('🎯 Finales Theme:', finalTheme);

        if (finalTheme === originalTheme) {
          console.log('✅ Rückwechsel ERFOLGREICH');
        } else {
          console.log('❌ Rückwechsel FEHLGESCHLAGEN');
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 DARK MODE TEST ABGESCHLOSSEN');
        console.log('='.repeat(50));
      }, 100);
    }, 100);
  }

  // 7. Überprüfe CSS-Variablen
  console.log('\n🎨 CSS-VARIABLEN TEST...');
  const rootStyles = getComputedStyle(document.documentElement);
  const bgPrimary = rootStyles.getPropertyValue('--bg-primary').trim();
  const textPrimary = rootStyles.getPropertyValue('--text-primary').trim();

  console.log('🎨 --bg-primary:', bgPrimary || 'nicht gefunden');
  console.log('🎨 --text-primary:', textPrimary || 'nicht gefunden');

  // 8. Teste Keyboard-Shortcut (simuliert)
  console.log('\n⌨️ KEYBOARD-SHORTCUT TEST...');
  console.log('💡 Teste manuell: Ctrl+Shift+D sollte Theme wechseln');

  // 9. Überprüfe auf Konflikte
  console.log('\n🔍 KONFLIKT-ÜBERPRÜFUNG...');

  const conflictingElements = [
    '#theme-toggle',
    '#theme-toggle-container',
    '#dark-mode-toggle',
    '[data-dark-mode-toggle]',
  ];

  let conflicts = 0;
  conflictingElements.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`⚠️ Konflikt gefunden: ${selector} (${elements.length} Elemente)`);
      conflicts++;
    }
  });

  if (conflicts === 0) {
    console.log('✅ Keine Konflikte gefunden');
  } else {
    console.log(`❌ ${conflicts} Konflikte gefunden`);
  }
}

// Event Listener für Theme-Changes
document.addEventListener('burni-theme-change', (event) => {
  console.log('🎭 Theme-Change Event empfangen:', event.detail);
});

// Starte Test automatisch nach 2 Sekunden
setTimeout(testDarkMode, 2000);

// Exportiere für manuelle Tests
window.testDarkMode = testDarkMode;


// Auto-generierte Implementierungen für fehlende Funktionen
/**
 * log - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * repeat - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function repeat(...args) {
  console.log('repeat aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * if - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * BurniDarkModeManager - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function BurniDarkModeManager(...args) {
  console.log('BurniDarkModeManager aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getElementById - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getElementById(...args) {
  console.log('getElementById aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getCurrentTheme - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getCurrentTheme(...args) {
  console.log('getCurrentTheme aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * from - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function from(...args) {
  console.log('from aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * join - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function join(...args) {
  console.log('join aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * toggle - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function toggle(...args) {
  console.log('toggle aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * contains - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function contains(...args) {
  console.log('contains aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getItem - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getItem(...args) {
  console.log('getItem aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * catch - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * getComputedStyle - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getComputedStyle(...args) {
  console.log('getComputedStyle aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getPropertyValue - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getPropertyValue(...args) {
  console.log('getPropertyValue aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * trim - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function trim(...args) {
  console.log('trim aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * Shortcut - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function Shortcut(...args) {
  console.log('Shortcut aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * forEach - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function forEach(...args) {
  console.log('forEach aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * querySelectorAll - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function querySelectorAll(...args) {
  console.log('querySelectorAll aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * addEventListener - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function addEventListener(...args) {
  console.log('addEventListener aufgerufen mit Argumenten:', args);
  return undefined;
}
