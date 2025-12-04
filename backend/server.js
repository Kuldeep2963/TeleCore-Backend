const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authenticateToken, requireClient, requireInternal, requireAdmin } = require('./middleware/auth');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 10000 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'TeleCore Backend API', version: '1.0.0' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes - require authentication
app.use('/api/users', authenticateToken, require('./routes/users'));
app.use('/api/wallet', authenticateToken, require('./routes/wallet'));
app.use('/api/customers', authenticateToken, require('./routes/customers'));
app.use('/api/vendors', authenticateToken, requireInternal, require('./routes/vendors'));
app.use('/api/orders', authenticateToken, require('./routes/orders'));
app.use('/api/numbers', authenticateToken, require('./routes/numbers'));
app.use('/api/invoices', authenticateToken, require('./routes/invoices'));
app.use('/api/pricing', authenticateToken, require('./routes/pricing'));
app.use('/api/disconnection-requests', authenticateToken, require('./routes/disconnection_requests'));
app.use('/api/countries', authenticateToken, require('./routes/countries'));
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/stats', authenticateToken, require('./routes/stats'));
app.use('/api/documents', authenticateToken, require('./routes/documents'));
app.use('/api/service-details', authenticateToken, require('./routes/service_details'));
app.use('/api/required-documents', authenticateToken, require('./routes/required_documents'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TeleCore Backend server is running on port ${PORT}`);
  });

  // Start invoice scheduler
  const { startInvoiceScheduler } = require('./jobs/invoiceScheduler');
  startInvoiceScheduler();
}

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    pool.end(() => {
      console.log('Database pool has ended');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    pool.end(() => {
      console.log('Database pool has ended');
      process.exit(0);
    });
  });


module.exports = app;