/**
 * 🔥 BURNI TOKEN INTERACTIVE BURN CALCULATOR
 * Enterprise-Grade Deflation Calculator with Chart.js Visualization
 */

class BurniCalculator {
  constructor() {
    this.initialSupply = 1000000;
    this.burnRate = 0.03; // 3% burn rate
    this.lockRate = 0.02; // 2% lock rate
    this.processInterval = 3; // 3 days
    this.maxIterations = 256;

    this.currentSupply = this.initialSupply;
    this.totalBurned = 0;
    this.totalLocked = 0;
    this.currentIteration = 0;

    this.chart = null;
    this.animationId = null;

    this.init();
  }

  init() {
    this.createCalculatorUI();
    this.attachEventListeners();
    this.loadChartJS();
  }

  createCalculatorUI() {
    const container = document.getElementById('calculator-display');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Input Section -->
          <div class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="burn-percentage" class="block text-sm font-medium text-gray-700 mb-2">
                  🔥 Burn Rate (%)
                </label>
                <input 
                  type="range" 
                  id="burn-percentage" 
                  min="0.1" 
                  max="10" 
                  step="0.1" 
                  value="3"
                  class="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0.1%</span>
                  <span id="burn-rate-display" class="font-semibold text-orange-600">3.0%</span>
                  <span>10%</span>
                </div>
              </div>

              <div>
                <label for="lock-percentage" class="block text-sm font-medium text-gray-700 mb-2">
                  🔒 Lock Rate (%)
                </label>
                <input 
                  type="range" 
                  id="lock-percentage" 
                  min="0" 
                  max="5" 
                  step="0.1" 
                  value="2"
                  class="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span id="lock-rate-display" class="font-semibold text-blue-600">2.0%</span>
                  <span>5%</span>
                </div>
              </div>

              <div>
                <label for="iterations" class="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Iterations (cycles)
                </label>
                <input 
                  type="range" 
                  id="iterations" 
                  min="1" 
                  max="256" 
                  step="1" 
                  value="50"
                  class="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1</span>
                  <span id="iterations-display" class="font-semibold text-purple-600">50</span>
                  <span>256</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4">
              <button 
                id="calculate-btn" 
                class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                🔥 Calculate Burn
              </button>
              <button 
                id="animate-btn" 
                class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                ▶️ Animate
              </button>
            </div>

            <!-- Stats Display -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-orange-50 p-4 rounded-lg">
                <div class="text-orange-600 text-sm font-medium">Total Burned</div>
                <div id="total-burned" class="text-2xl font-bold text-orange-800">0</div>
              </div>
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-blue-600 text-sm font-medium">Total Locked</div>
                <div id="total-locked" class="text-2xl font-bold text-blue-800">0</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-green-600 text-sm font-medium">Remaining Supply</div>
                <div id="remaining-supply" class="text-2xl font-bold text-green-800">1,000,000</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-purple-600 text-sm font-medium">Deflation %</div>
                <div id="deflation-percentage" class="text-2xl font-bold text-purple-800">0%</div>
              </div>
            </div>
          </div>

          <!-- Chart Section -->
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <canvas id="burn-chart" width="400" height="300"></canvas>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600">
                Each iteration represents a 3-day burn cycle
              </div>
            </div>
          </div>
        </div>

        <!-- Formula Explanation -->
        <div class="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
          <h4 class="text-lg font-semibold text-gray-800 mb-3">🧮 How It Works</h4>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div class="bg-white p-3 rounded">
              <div class="font-semibold text-orange-600">1. Burn Process</div>
              <div class="text-gray-600">CurrentSupply × BurnRate = BurnedTokens</div>
            </div>
            <div class="bg-white p-3 rounded">
              <div class="font-semibold text-blue-600">2. Lock Process</div>
              <div class="text-gray-600">RemainingSupply × LockRate = LockedTokens</div>
            </div>
            <div class="bg-white p-3 rounded">
              <div class="font-semibold text-green-600">3. New Supply</div>
              <div class="text-gray-600">CurrentSupply - Burned - Locked</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Range inputs
    const burnRange = document.getElementById('burn-percentage');
    const lockRange = document.getElementById('lock-percentage');
    const iterationsRange = document.getElementById('iterations');

    if (burnRange) {
      burnRange.addEventListener('input', (e) => {
        document.getElementById('burn-rate-display').textContent =
          `${parseFloat(e.target.value).toFixed(1)}%`;
        this.burnRate = parseFloat(e.target.value) / 100;
      });
    }

    if (lockRange) {
      lockRange.addEventListener('input', (e) => {
        document.getElementById('lock-rate-display').textContent =
          `${parseFloat(e.target.value).toFixed(1)}%`;
        this.lockRate = parseFloat(e.target.value) / 100;
      });
    }

    if (iterationsRange) {
      iterationsRange.addEventListener('input', (e) => {
        document.getElementById('iterations-display').textContent = e.target.value;
        this.maxIterations = parseInt(e.target.value);
      });
    }

    // Action buttons
    const calculateBtn = document.getElementById('calculate-btn');
    const animateBtn = document.getElementById('animate-btn');

    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.calculateBurn());
    }

    if (animateBtn) {
      animateBtn.addEventListener('click', () => this.animateBurn());
    }
  }

  async loadChartJS() {
    if (typeof Chart !== 'undefined') {
      this.initChart();
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.initChart();
      document.head.appendChild(script);
    } catch (error) {
      console.log('Chart.js loading failed, using fallback');
      this.createFallbackChart();
    }
  }

  initChart() {
    const ctx = document.getElementById('burn-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Circulating Supply',
            data: [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Burned Tokens',
            data: [],
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Locked Tokens',
            data: [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'BURNI Token Burn Schedule',
          },
          legend: {
            position: 'bottom',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tokens',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Burn Cycles (3-day intervals)',
            },
          },
        },
      },
    });
  }

  calculateBurn() {
    this.resetValues();

    const data = {
      labels: [],
      circulating: [],
      burned: [],
      locked: [],
    };

    for (let i = 0; i < this.maxIterations; i++) {
      // Burn tokens
      const burnAmount = this.currentSupply * this.burnRate;
      this.totalBurned += burnAmount;
      this.currentSupply -= burnAmount;

      // Lock tokens
      const lockAmount = this.currentSupply * this.lockRate;
      this.totalLocked += lockAmount;
      this.currentSupply -= lockAmount;

      // Record data
      data.labels.push(`Cycle ${i + 1}`);
      data.circulating.push(Math.round(this.currentSupply));
      data.burned.push(Math.round(this.totalBurned));
      data.locked.push(Math.round(this.totalLocked));

      // Stop if supply becomes too low
      if (this.currentSupply < 1000) break;
    }

    this.updateChart(data);
    this.updateStats();
  }

  animateBurn() {
    this.resetValues();
    this.currentIteration = 0;

    const data = {
      labels: [],
      circulating: [],
      burned: [],
      locked: [],
    };

    const animateStep = () => {
      if (this.currentIteration >= this.maxIterations || this.currentSupply < 1000) {
        return;
      }

      // Burn tokens
      const burnAmount = this.currentSupply * this.burnRate;
      this.totalBurned += burnAmount;
      this.currentSupply -= burnAmount;

      // Lock tokens
      const lockAmount = this.currentSupply * this.lockRate;
      this.totalLocked += lockAmount;
      this.currentSupply -= lockAmount;

      // Record data
      data.labels.push(`Cycle ${this.currentIteration + 1}`);
      data.circulating.push(Math.round(this.currentSupply));
      data.burned.push(Math.round(this.totalBurned));
      data.locked.push(Math.round(this.totalLocked));

      this.updateChart(data);
      this.updateStats();

      this.currentIteration++;
      this.animationId = setTimeout(animateStep, 100);
    };

    animateStep();
  }

  updateChart(data) {
    if (!this.chart) return;

    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.circulating;
    this.chart.data.datasets[1].data = data.burned;
    this.chart.data.datasets[2].data = data.locked;
    this.chart.update('none');
  }

  updateStats() {
    const totalBurnedEl = document.getElementById('total-burned');
    const totalLockedEl = document.getElementById('total-locked');
    const remainingSupplyEl = document.getElementById('remaining-supply');
    const deflationEl = document.getElementById('deflation-percentage');

    if (totalBurnedEl) totalBurnedEl.textContent = this.formatNumber(this.totalBurned);
    if (totalLockedEl) totalLockedEl.textContent = this.formatNumber(this.totalLocked);
    if (remainingSupplyEl) remainingSupplyEl.textContent = this.formatNumber(this.currentSupply);

    const deflationPercentage = (
      ((this.initialSupply - this.currentSupply) / this.initialSupply) *
      100
    ).toFixed(2);
    if (deflationEl) deflationEl.textContent = `${deflationPercentage}%`;
  }

  resetValues() {
    this.currentSupply = this.initialSupply;
    this.totalBurned = 0;
    this.totalLocked = 0;
    this.currentIteration = 0;

    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = null;
    }
  }

  formatNumber(num) {
    return Math.round(num).toLocaleString();
  }

  createFallbackChart() {
    const canvas = document.getElementById('burn-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Chart.js loading...', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Use the calculate button for results', canvas.width / 2, canvas.height / 2 + 25);
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calculator-display')) {
    new BurniCalculator();
  }
});

// Export for external use
window.BurniCalculator = BurniCalculator;
