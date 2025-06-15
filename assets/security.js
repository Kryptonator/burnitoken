// security.js - Sichere DOM-Manipulationen ohne innerHTML
class SecureDOM {
  static createSafeElement(tagName, className = '', textContent = '') {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  static createSafeHTML(template, data = {}) {
    // Template mit sicheren Ersetzungen
    const container = document.createElement('div');

    // Sichere Template-Engine ohne innerHTML
    const safeParts = template.split(/{{(\w+)}}/g);
    for (let i = 0; i < safeParts.length; i += 2) {
      if (safeParts[i]) {
        container.appendChild(document.createTextNode(safeParts[i]));
      }
      if (safeParts[i + 1] && data[safeParts[i + 1]]) {
        container.appendChild(document.createTextNode(data[safeParts[i + 1]]));
      }
    }

    return container;
  }

  static showNotification(message, type = 'info') {
    const notification = this.createSafeElement(
      'div',
      `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      }`,
    );

    const icon = this.createSafeElement('span', 'mr-2');
    icon.textContent = type === 'error' ? '⚠️' : 'ℹ️';

    const text = this.createSafeElement('span', '', message);

    notification.appendChild(icon);
    notification.appendChild(text);

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
  }

  static createSecureTable(data, headers) {
    const table = this.createSafeElement(
      'table',
      'w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden',
    );
    const thead = this.createSafeElement('thead');
    const tbody = this.createSafeElement('tbody');

    // Header erstellen mit besseren Farben
    const headerRow = this.createSafeElement(
      'tr',
      'bg-gradient-to-r from-orange-500 to-orange-600',
    );
    headers.forEach((header) => {
      const th = this.createSafeElement(
        'th',
        'border border-orange-300 p-4 text-white font-bold text-left',
        header,
      );
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Daten-Rows erstellen mit alternativen Farben
    data.forEach((row, index) => {
      const isEven = index % 2 === 0;
      const rowClass = isEven ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50';
      const tr = this.createSafeElement('tr', rowClass);

      Object.values(row).forEach((cell, cellIndex) => {
        const cellText = String(cell);
        let cellClass = 'border border-gray-200 p-4 text-gray-800 font-medium';

        // Spezielle Formatierung für bestimmte Spalten
        if (cellIndex === 0) {
          // Datum
          cellClass += ' text-orange-600 font-semibold';
        } else if (cellIndex === 3) {
          // Remaining Coins
          cellClass += ' text-right font-mono text-green-700';
        }

        const td = this.createSafeElement('td', cellClass, cellText);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  }
}

// Globale sichere Funktionen
window.SecureDOM = SecureDOM;
