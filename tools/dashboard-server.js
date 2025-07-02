#!/usr/bin/env node

/**
 * Bot Dashboard Server - API Backend für das VS Code Bot Dashboard
 * 
 * Stellt REST-API für Bot-Steuerung und Status-Abfragen bereit
 * Läuft auf http://localhost:3001 für VS Code Simple Browser
 * 
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

class DashboardServer {
  constructor() {
    this.port = 3001;
    this.toolsDir = __dirname;
    this.orchestratorScript = path.join(this.toolsDir, 'bot-orchestrator.js');
    this.dashboardHtml = path.join(this.toolsDir, 'bot-dashboard.html');
    
    this.server = null;
    this.orchestrator = null;
  }

  /**
   * Startet den Dashboard-Server
   */
  async start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`🌐 Bot Dashboard Server gestartet auf http://localhost:${this.port}`);
      console.log(`📊 Dashboard URL: http://localhost:${this.port}/dashboard`);
      
      // Bot Orchestrator starten
      this.startOrchestrator();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * HTTP-Request Handler
   */
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS Headers für lokale Entwicklung
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      // Routen
      if (pathname === '/' || pathname === '/dashboard') {
        await this.serveDashboard(res);
      }
      else if (pathname === '/api/bot-status' && method === 'GET') {
        await this.getBotStatus(res);
      }
      else if (pathname.startsWith('/api/bot-action/') && method === 'POST') {
        await this.handleBotAction(req, res, pathname);
      }
      else if (pathname === '/api/health' && method === 'GET') {
        await this.getHealthStatus(res);
      }
      else if (pathname === '/api/logs' && method === 'GET') {
        await this.getLogs(res, parsedUrl.query);
      }
      else {
        this.send404(res);
      }

    } catch (error) {
      console.error('Request-Fehler:', error);
      this.sendError(res, 500, 'Internal Server Error');
    }
  }

  /**
   * Dashboard HTML ausliefern
   */
  async serveDashboard(res) {
    try {
      if (fs.existsSync(this.dashboardHtml)) {
        const html = fs.readFileSync(this.dashboardHtml, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        this.sendError(res, 404, 'Dashboard nicht gefunden');
      }
    } catch (error) {
      this.sendError(res, 500, 'Fehler beim Laden des Dashboards');
    }
  }

  /**
   * Bot-Status API
   */
  async getBotStatus(res) {
    try {
      const statusFile = path.join(this.toolsDir, 'bot-status.json');
      
      if (fs.existsSync(statusFile)) {
        const status = fs.readFileSync(statusFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(status);
      } else {
        // Fallback-Status wenn noch keine Daten vorhanden
        const fallbackStatus = {
          timestamp: Date.now(),
          orchestratorStatus: 'initializing',
          bots: []
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fallbackStatus));
      }
    } catch (error) {
      this.sendError(res, 500, 'Fehler beim Laden des Bot-Status');
    }
  }

  /**
   * Bot-Actions API
   */
  async handleBotAction(req, res, pathname) {
    const parts = pathname.split('/');
    const action = parts[3]; // /api/bot-action/{action}
    const botId = parts[4]; // /api/bot-action/{action}/{botId}

    try {
      let result;
      
      switch (action) {
        case 'start':
          if (botId) {
            result = await this.executeOrchestratorCommand('restart', botId);
          } else {
            result = await this.executeOrchestratorCommand('start');
          }
          break;
          
        case 'stop':
          if (botId) {
            result = await this.executeOrchestratorCommand('stop', botId);
          } else {
            result = await this.executeOrchestratorCommand('stop');
          }
          break;
          
        case 'restart':
          if (botId) {
            result = await this.executeOrchestratorCommand('restart', botId);
          } else {
            result = await this.executeOrchestratorCommand('restart');
          }
          break;
          
        case 'start-all':
          result = await this.executeOrchestratorCommand('start');
          break;
          
        case 'stop-all':
          result = await this.executeOrchestratorCommand('stop');
          break;
          
        case 'restart-all':
          result = await this.executeOrchestratorCommand('restart');
          break;
          
        default:
          this.sendError(res, 400, 'Unbekannte Aktion');
          return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        action: action, 
        botId: botId,
        result: result,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Bot-Action Fehler:', error);
      this.sendError(res, 500, `Fehler bei Aktion ${action}: ${error.message}`);
    }
  }

  /**
   * Health-Status API
   */
  async getHealthStatus(res) {
    try {
      const health = {
        server: 'healthy',
        orchestrator: this.orchestrator ? 'running' : 'stopped',
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health));
    } catch (error) {
      this.sendError(res, 500, 'Fehler beim Health-Check');
    }
  }

  /**
   * Logs API
   */
  async getLogs(res, query) {
    try {
      const logsDir = path.join(this.toolsDir, 'bot-logs');
      const botId = query.bot;
      const limit = parseInt(query.limit) || 100;

      let logs = [];

      if (botId && fs.existsSync(path.join(logsDir, `${botId}.log`))) {
        // Logs für spezifischen Bot
        const logContent = fs.readFileSync(path.join(logsDir, `${botId}.log`), 'utf8');
        logs = logContent.split('\n')
          .filter(line => line.trim())
          .slice(-limit)
          .map(line => ({ bot: botId, message: line }));
      } else {
        // Alle Logs
        if (fs.existsSync(logsDir)) {
          const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
          
          for (const file of logFiles) {
            const bot = file.replace('.log', '');
            const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
            const lines = content.split('\n')
              .filter(line => line.trim())
              .slice(-20) // Pro Bot max 20 Zeilen
              .map(line => ({ bot, message: line }));
            
            logs.push(...lines);
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs, count: logs.length }));

    } catch (error) {
      this.sendError(res, 500, 'Fehler beim Laden der Logs');
    }
  }

  /**
   * Orchestrator-Kommandos ausführen
   */
  async executeOrchestratorCommand(command, botId = null) {
    return new Promise((resolve, reject) => {
      const args = [this.orchestratorScript, command];
      if (botId) args.push(botId);

      const process = spawn('node', args, {
        cwd: this.toolsDir,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });

      // Timeout nach 30 Sekunden
      setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Command timeout'));
      }, 30000);
    });
  }

  /**
   * Bot Orchestrator starten
   */
  startOrchestrator() {
    try {
      console.log('🤖 Starte Bot Orchestrator...');
      
      this.orchestrator = spawn('node', [this.orchestratorScript, 'start'], {
        cwd: this.toolsDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.orchestrator.stdout.on('data', (data) => {
        console.log(`[Orchestrator] ${data.toString().trim()}`);
      });

      this.orchestrator.stderr.on('data', (data) => {
        console.error(`[Orchestrator Error] ${data.toString().trim()}`);
      });

      this.orchestrator.on('close', (code) => {
        console.log(`🤖 Bot Orchestrator beendet mit Code ${code}`);
        this.orchestrator = null;
      });

      console.log(`✅ Bot Orchestrator gestartet (PID: ${this.orchestrator.pid})`);

    } catch (error) {
      console.error('❌ Fehler beim Starten des Orchestrators:', error);
    }
  }

  /**
   * Hilfsmethoden
   */
  sendError(res, statusCode, message) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: true, 
      message: message, 
      statusCode: statusCode,
      timestamp: Date.now()
    }));
  }

  send404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Not Found');
  }

  async shutdown() {
    console.log('🛑 Shutting down Dashboard Server...');
    
    // Orchestrator stoppen
    if (this.orchestrator) {
      try {
        await this.executeOrchestratorCommand('stop');
        this.orchestrator.kill('SIGTERM');
      } catch (error) {
        console.error('Fehler beim Stoppen des Orchestrators:', error);
      }
    }
    
    // Server stoppen
    if (this.server) {
      this.server.close(() => {
        console.log('✅ Dashboard Server gestoppt');
        process.exit(0);
      });
    }
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const server = new DashboardServer();
  
  switch (command) {
    case 'start':
    case undefined:
      server.start();
      break;
      
    case 'stop':
      console.log('🛑 Stoppe Dashboard Server...');
      process.exit(0);
      break;
      
    default:
      console.log('🌐 Bot Dashboard Server');
      console.log('');
      console.log('Verwendung:');
      console.log('  node dashboard-server.js [start]  - Server starten');
      console.log('  node dashboard-server.js stop     - Server stoppen');
      console.log('');
      console.log('Nach dem Start verfügbar unter:');
      console.log('  http://localhost:3001/dashboard');
      break;
  }
}

module.exports = DashboardServer;
