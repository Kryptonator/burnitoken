#!/usr/bin/env node

/**
 * Mock Payment Gateway Server for Testing
 * Simulates the payment gateway service to test E-12045 database connection failures
 */

const http = require('http');
const url = require('url');

class MockPaymentGateway {
  constructor() {
    this.databaseConnected = Math.random() > 0.3; // 70% chance of success, 30% chance of E-12045
    this.port = 3001;
  }

  handleRequest(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`📝 ${req.method} ${pathname}`);

    if (pathname === '/health') {
      this.handleHealthCheck(req, res);
    } else if (pathname === '/process' && req.method === 'POST') {
      this.handlePaymentProcess(req, res);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  }

  handleHealthCheck(req, res) {
    if (this.databaseConnected) {
      const response = {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        service: 'payment-gateway',
        version: '1.0.0'
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
    } else {
      const response = {
        status: 'unhealthy',
        database: 'disconnected',
        error: 'E-12045',
        errorMessage: 'Database connection failed - Die Verbindung zur Datenbank konnte nicht hergestellt werden',
        timestamp: new Date().toISOString(),
        service: 'payment-gateway',
        version: '1.0.0'
      };
      res.writeHead(503);
      res.end(JSON.stringify(response));
    }
  }

  handlePaymentProcess(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const paymentData = JSON.parse(body);
        
        // Simulate database connection check
        if (!this.databaseConnected) {
          const errorResponse = {
            error: true,
            errorCode: 'E-12045',
            message: 'Database connection failed - Die Verbindung zur Datenbank konnte nicht hergestellt werden. Dieser Test überprüft die gesamte Kette.',
            service: 'payment-gateway',
            timestamp: new Date().toISOString()
          };
          res.writeHead(503);
          res.end(JSON.stringify(errorResponse));
          return;
        }

        // Validate required fields
        const required = ['fromAccount', 'toAccount', 'amount', 'currency'];
        for (const field of required) {
          if (!paymentData[field]) {
            const errorResponse = {
              error: true,
              errorCode: 'E-12048',
              message: `Missing required field: ${field}`,
              service: 'payment-gateway',
              timestamp: new Date().toISOString()
            };
            res.writeHead(400);
            res.end(JSON.stringify(errorResponse));
            return;
          }
        }

        // Successful payment
        const successResponse = {
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'completed',
          timestamp: new Date().toISOString(),
          amount: paymentData.amount,
          currency: paymentData.currency
        };
        res.writeHead(200);
        res.end(JSON.stringify(successResponse));

      } catch (error) {
        const errorResponse = {
          error: true,
          errorCode: 'E-12046',
          message: 'Invalid JSON data',
          service: 'payment-gateway',
          timestamp: new Date().toISOString()
        };
        res.writeHead(400);
        res.end(JSON.stringify(errorResponse));
      }
    });
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log('🚀 Mock Payment Gateway Server Started');
      console.log(`📡 Server running on http://localhost:${this.port}`);
      console.log(`💾 Database Connected: ${this.databaseConnected ? 'Yes' : 'No (E-12045 will occur)'}`);
      console.log('=====================================');
      
      if (!this.databaseConnected) {
        console.log('🚨 SIMULATING E-12045 DATABASE CONNECTION FAILURE');
        console.log('All requests will fail with database connection error');
      }
    });

    // Simulate database connection changes
    setInterval(() => {
      this.databaseConnected = Math.random() > 0.3;
      console.log(`💾 Database status changed: ${this.databaseConnected ? 'Connected' : 'Disconnected (E-12045)'}`);
    }, 30000); // Change every 30 seconds

    return server;
  }
}

// Start the mock server if run directly
if (require.main === module) {
  const gateway = new MockPaymentGateway();
  const server = gateway.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down mock payment gateway server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

module.exports = MockPaymentGateway;