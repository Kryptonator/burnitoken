// Netlify Function: Payment Gateway Service
// Endpunkt: /.netlify/functions/payment-gateway
// Handles token payment processing with database connectivity

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Simulated database connection class
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.lastError = null;
  }

  async connect() {
    this.connectionAttempts++;
    
    // Simulate connection attempts with occasional failures
    if (process.env.NODE_ENV === 'test' && Math.random() < 0.1) {
      this.lastError = new Error('Database connection timeout');
      this.isConnected = false;
      throw this.lastError;
    }
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.isConnected = true;
    this.lastError = null;
    console.log('Database connection established');
    return true;
  }

  async disconnect() {
    this.isConnected = false;
    console.log('Database connection closed');
  }

  async query(sql, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    
    // Simulate database query
    console.log(`Executing query: ${sql}`, params);
    
    // Mock responses based on query type
    if (sql.includes('SELECT')) {
      return [{ id: 1, status: 'active', balance: 1000 }];
    } else if (sql.includes('INSERT')) {
      return { insertId: Date.now(), affectedRows: 1 };
    } else if (sql.includes('UPDATE')) {
      return { affectedRows: 1 };
    }
    
    return [];
  }
}

// Payment processing logic
class PaymentGateway {
  constructor() {
    this.db = new DatabaseConnection();
    this.supportedCurrencies = ['BURNI', 'ETH', 'XRP', 'BTC'];
  }

  async processPayment(paymentData) {
    try {
      // Establish database connection
      await this.db.connect();
      
      // Validate payment data
      this.validatePaymentData(paymentData);
      
      // Check account balance
      const balance = await this.checkBalance(paymentData.fromAccount);
      if (balance < paymentData.amount) {
        throw new Error('Insufficient balance');
      }
      
      // Create payment transaction
      const transaction = await this.createTransaction(paymentData);
      
      // Process the payment
      const result = await this.executePayment(transaction);
      
      // Update balances
      await this.updateBalances(paymentData);
      
      // Close database connection
      await this.db.disconnect();
      
      return {
        success: true,
        transactionId: result.transactionId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        amount: paymentData.amount,
        currency: paymentData.currency
      };
      
    } catch (error) {
      await this.db.disconnect();
      
      // Check if it's a database connection error
      if (error.message.includes('Database') || error.message.includes('connection')) {
        throw new Error('E-12045: Database connection failed - ' + error.message);
      }
      
      throw error;
    }
  }

  validatePaymentData(data) {
    const required = ['fromAccount', 'toAccount', 'amount', 'currency'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!this.supportedCurrencies.includes(data.currency)) {
      throw new Error(`Unsupported currency: ${data.currency}`);
    }
    
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  async checkBalance(account) {
    const result = await this.db.query(
      'SELECT balance FROM accounts WHERE account_id = ?',
      [account]
    );
    return result[0]?.balance || 0;
  }

  async createTransaction(paymentData) {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.query(
      'INSERT INTO transactions (transaction_id, from_account, to_account, amount, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [transactionId, paymentData.fromAccount, paymentData.toAccount, paymentData.amount, paymentData.currency, 'pending', new Date()]
    );
    
    return { transactionId };
  }

  async executePayment(transaction) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update transaction status
    await this.db.query(
      'UPDATE transactions SET status = ? WHERE transaction_id = ?',
      ['completed', transaction.transactionId]
    );
    
    return transaction;
  }

  async updateBalances(paymentData) {
    // Debit from source account
    await this.db.query(
      'UPDATE accounts SET balance = balance - ? WHERE account_id = ?',
      [paymentData.amount, paymentData.fromAccount]
    );
    
    // Credit to destination account
    await this.db.query(
      'UPDATE accounts SET balance = balance + ? WHERE account_id = ?',
      [paymentData.amount, paymentData.toAccount]
    );
  }

  async getSystemHealth() {
    try {
      await this.db.connect();
      
      // Test database connectivity
      await this.db.query('SELECT 1 as test');
      
      await this.db.disconnect();
      
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        service: 'payment-gateway',
        version: '1.0.0'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message.includes('Database') ? 'E-12045' : 'E-12046',
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        service: 'payment-gateway',
        version: '1.0.0'
      };
    }
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const gateway = new PaymentGateway();

  try {
    // Route based on path and method
    const path = event.path.split('/').pop();
    
    if (event.httpMethod === 'GET' && path === 'health') {
      // Health check endpoint
      const health = await gateway.getSystemHealth();
      
      return {
        statusCode: health.status === 'healthy' ? 200 : 503,
        headers,
        body: JSON.stringify(health)
      };
    }
    
    if (event.httpMethod === 'POST' && path === 'process') {
      // Process payment endpoint
      const paymentData = JSON.parse(event.body);
      const result = await gateway.processPayment(paymentData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }
    
    // Default response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Endpoint not found',
        availableEndpoints: [
          'GET /health - System health check',
          'POST /process - Process payment'
        ]
      })
    };
    
  } catch (error) {
    console.error('Payment gateway error:', error);
    
    // Handle specific error codes
    let statusCode = 500;
    let errorCode = 'E-12046'; // Generic error
    
    if (error.message.includes('E-12045')) {
      statusCode = 503; // Service unavailable
      errorCode = 'E-12045';
    } else if (error.message.includes('Insufficient balance')) {
      statusCode = 400; // Bad request
      errorCode = 'E-12047';
    } else if (error.message.includes('Missing required field')) {
      statusCode = 400; // Bad request
      errorCode = 'E-12048';
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: true,
        errorCode,
        message: error.message,
        service: 'payment-gateway',
        timestamp: new Date().toISOString()
      })
    };
  }
};