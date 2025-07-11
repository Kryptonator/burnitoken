#!/usr/bin/env node

/**
 * Lightweight BurniToken Dashboard Server
 * Optimiert für Performance und Stabilität
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class LightweightDashboardServer {
  constructor() {
    this.port = 3002; // Anderer Port zur Vermeidung von Konflikten
    this.dashboardPath = path.join(__dirname, 'lightweight-dashboard.html');
  }

  start() {
    const server = http.createServer((req, res) => {
      // CORS Headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Route Handler
      if (req.url === '/' || req.url === '/dashboard') {
        this.serveDashboard(res);
      } else if (req.url.startsWith('/api/')) {
        this.handleAPI(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(this.port, () => {
      console.log(`
🚀 LIGHTWEIGHT DASHBOARD SERVER GESTARTET!

📊 Dashboard URL: http://localhost:$${this.port}
🎯 Status: STABIL & PERFORMANT
⚡ Memory: MINIMAL
🔧 Features: ALLE BOTS SICHTBAR

==============================================
`);
    });

    // Fehlerbehandlung
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port $${this.port} belegt, versuche ${this.port + 1}...`);
        this.port++;
        setTimeout(() => this.start(), 1000);
      } else {
        console.error('Server Fehler:', err.message);
      }
    });

    return server;
  }

  serveDashboard(res) {
    try {
      const content = fs.readFileSync(this.dashboardPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } catch (error) {
      console.error('Dashboard laden fehlgeschlagen:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Dashboard nicht verfügbar');
    }
  }

  handleAPI(req, res) {
    // Einfache Mock-API für Bot-Status
    const mockData = {
      timestamp: Date.now(),
      bots: [
        {
          id: 'deployment-pipeline',
          name: '🚀 Deployment Pipeline',
          status: 'running',
          uptime: '21d',
          memory: '75MB',
        },
        {
          id: 'github-manager',
          name: '📦 GitHub Repository Manager',
          status: 'running',
          uptime: '19d',
          memory: '92MB',
          github: {
            openIssues: 10,
            closedIssues: 13,
            openPRs: 3,
            mergedPRs: 8,
          },
        },
      ],
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData, null, 2));
  }
}

// Server starten
const dashboardServer = new LightweightDashboardServer();
dashboardServer.start();

module.exports = LightweightDashboardServer;
