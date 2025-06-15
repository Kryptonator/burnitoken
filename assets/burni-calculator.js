/**
 * BURNI Token Burn & Lock Calculator
 * Berechnet den Verbrennungs- und Sperrplan für BURNI Token
 */

class BURNICalculator {
  constructor() {
    this.startAmount = 500000; // Startbetrag in Euro
    this.burnRate = 0.03; // 3% Verbrennung
    this.lockRate = 0.02; // 2% Sperrung
    this.iterationDays = 3; // Alle 3 Tage
    this.maxIterations = 256;
    this.startDate = new Date('2025-06-01');
  }

  /**
   * Berechnet eine einzelne Iteration
   */
  calculateIteration(current, iteration) {
    // 1. 3% des aktuellen Betrags verbrennen
    const burn = Math.round(current * this.burnRate);

    // 2. Von dem verbleibenden Betrag 2% versperren
    const remainder = current - burn;
    const lock = Math.round(remainder * this.lockRate);

    // 3. Neuer aktiver Restbetrag
    const newCurrent = remainder - lock;

    // Datum berechnen
    const iterationDate = new Date(this.startDate);
    iterationDate.setDate(this.startDate.getDate() + this.iterationDays * (iteration - 1));

    return {
      iteration,
      date: iterationDate,
      dateString: iterationDate.toLocaleDateString('de-DE'),
      burn,
      lock,
      newCurrent,
      totalBurned: 0, // Wird später berechnet
      totalLocked: 0, // Wird später berechnet
    };
  }

  /**
   * Berechnet den kompletten Burn/Lock Schedule
   */
  calculateFullSchedule() {
    const schedule = [];
    let current = this.startAmount;
    let totalBurned = 0;
    let totalLocked = 0;

    for (let i = 1; i <= this.maxIterations; i++) {
      const iteration = this.calculateIteration(current, i);

      totalBurned += iteration.burn;
      totalLocked += iteration.lock;

      iteration.totalBurned = totalBurned;
      iteration.totalLocked = totalLocked;

      schedule.push(iteration);
      current = iteration.newCurrent;

      // Stop wenn praktisch nichts mehr übrig ist
      if (current < 1) break;
    }

    return schedule;
  }

  /**
   * Generiert CSV-Export
   */
  generateCSV() {
    const schedule = this.calculateFullSchedule();
    const headers = [
      'Iteration',
      'Datum',
      'Verbrannt (Euro)',
      'Versperrt (Euro)',
      'Restbetrag (Euro)',
      'Gesamt Verbrannt',
      'Gesamt Versperrt',
    ];

    let csv = headers.join(',') + '\n';

    schedule.forEach((item) => {
      csv +=
        [
          item.iteration,
          item.dateString,
          item.burn,
          item.lock,
          item.newCurrent,
          item.totalBurned,
          item.totalLocked,
        ].join(',') + '\n';
    });

    return csv;
  }

  /**
   * Berechnet Statistiken
   */
  getStatistics() {
    const schedule = this.calculateFullSchedule();
    const lastItem = schedule[schedule.length - 1];

    return {
      totalIterations: schedule.length,
      finalDate: lastItem.date,
      totalBurned: lastItem.totalBurned,
      totalLocked: lastItem.totalLocked,
      finalAmount: lastItem.newCurrent,
      duration: Math.ceil((lastItem.date - this.startDate) / (1000 * 60 * 60 * 24)),
      burnPercentage: ((lastItem.totalBurned / this.startAmount) * 100).toFixed(2),
      lockPercentage: ((lastItem.totalLocked / this.startAmount) * 100).toFixed(2),
    };
  }

  /**
   * Formatiert Zahlen für die Anzeige
   */
  formatNumber(num) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  /**
   * Erstellt HTML-Tabelle für die Anzeige
   */
  generateHTMLTable(maxRows = 20) {
    const schedule = this.calculateFullSchedule();
    const stats = this.getStatistics();

    let html = `
        <div class="burni-calculator-container">
            <div class="calculator-header">
                <h3>🔥 BURNI Token Burn & Lock Schedule</h3>
                <div class="calculator-stats">
                    <div class="stat-item">
                        <span class="stat-label">Gesamt Iterationen:</span>
                        <span class="stat-value">${stats.totalIterations}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gesamt verbrannt:</span>
                        <span class="stat-value text-red-500">${this.formatNumber(stats.totalBurned)} (${stats.burnPercentage}%)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gesamt versperrt:</span>
                        <span class="stat-value text-yellow-500">${this.formatNumber(stats.totalLocked)} (${stats.lockPercentage}%)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Dauer:</span>
                        <span class="stat-value">${stats.duration} Tage</span>
                    </div>
                </div>
            </div>
            
            <div class="calculator-table-container">
                <table class="burni-schedule-table">
                    <thead>
                        <tr>
                            <th>Iteration</th>
                            <th>Datum</th>
                            <th>Verbrannt</th>
                            <th>Versperrt</th>
                            <th>Restbetrag</th>
                            <th>% Verbrannt</th>
                        </tr>
                    </thead>
                    <tbody>`;

    // Zeige erste maxRows Einträge
    const displayItems = schedule.slice(0, maxRows);

    displayItems.forEach((item) => {
      const burnPercentage = ((item.totalBurned / this.startAmount) * 100).toFixed(1);
      html += `
                        <tr>
                            <td>${item.iteration}</td>
                            <td>${item.dateString}</td>
                            <td class="text-red-500">${this.formatNumber(item.burn)}</td>
                            <td class="text-yellow-500">${this.formatNumber(item.lock)}</td>
                            <td class="text-green-500">${this.formatNumber(item.newCurrent)}</td>
                            <td class="text-blue-500">${burnPercentage}%</td>
                        </tr>`;
    });

    if (schedule.length > maxRows) {
      html += `
                        <tr class="show-more-row">
                            <td colspan="6" class="text-center">
                                <button onclick="showFullSchedule()" class="btn-show-more">
                                    Alle ${schedule.length} Einträge anzeigen
                                </button>
                            </td>
                        </tr>`;
    }

    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="calculator-actions">
                <button onclick="downloadCSV()" class="btn-download">
                    📁 CSV Download
                </button>
                <button onclick="calculateCustom()" class="btn-custom">
                    🔧 Benutzerdefinierte Berechnung
                </button>
            </div>
        </div>`;

    return html;
  }
}

// Globale Instanz erstellen
const burniCalculator = new BURNICalculator();

// Hilfsfunktionen für UI
function showFullSchedule() {
  const container = document.querySelector('.burni-calculator-container');
  if (container) {
    container.innerHTML = burniCalculator.generateHTMLTable(1000); // Alle anzeigen
  }
}

function downloadCSV() {
  const csv = burniCalculator.generateCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'burni-burn-schedule.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function calculateCustom() {
  const startAmount = prompt('Startbetrag (Euro):', '500000');
  const burnRate = prompt('Verbrennungsrate (%):', '3');
  const lockRate = prompt('Sperrrate (%):', '2');

  if (startAmount && burnRate && lockRate) {
    const customCalculator = new BURNICalculator();
    customCalculator.startAmount = parseFloat(startAmount);
    customCalculator.burnRate = parseFloat(burnRate) / 100;
    customCalculator.lockRate = parseFloat(lockRate) / 100;

    const container = document.querySelector('.burni-calculator-container');
    if (container) {
      container.innerHTML = customCalculator.generateHTMLTable();
    }
  }
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNICalculator;
}
