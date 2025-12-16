const express = require('express');
const { query } = require('../config/database');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, first_name, last_name, role, status, wallet_balance,
             wallet_threshold, created_at, last_login_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await query(`
      SELECT id, email, first_name, last_name, role, status, wallet_balance,
             wallet_threshold, profile_picture_url, created_at, updated_at, last_login_at
      FROM users
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse numeric fields
    const userData = result.rows[0];
    userData.wallet_balance = parseFloat(userData.wallet_balance) || 0;
    userData.wallet_threshold = userData.wallet_threshold ? parseFloat(userData.wallet_threshold) : 10.00;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, email, first_name, last_name, role, status, wallet_balance,
             wallet_threshold, profile_picture_url, created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse numeric fields
    const userData = result.rows[0];
    userData.wallet_balance = parseFloat(userData.wallet_balance) || 0;
    userData.wallet_threshold = userData.wallet_threshold ? parseFloat(userData.wallet_threshold) : 10.00;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user wallet balance
router.patch('/:id/wallet', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    // Start transaction
    const client = await require('../config/database').getClient();

    try {
      await client.query('BEGIN');

      // Get current balance, email, name, and threshold
      const balanceResult = await client.query(
        'SELECT wallet_balance, email, first_name, last_name, wallet_threshold FROM users WHERE id = $1',
        [id]
      );

      if (balanceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = balanceResult.rows[0];
      const currentBalance = parseFloat(user.wallet_balance) || 0;
      const newBalance = currentBalance + parseFloat(amount);
      const userEmail = user.email;
      const userName = `${user.first_name} ${user.last_name}`;
      const threshold = user.wallet_threshold ? parseFloat(user.wallet_threshold) : 10.00;

      // Update balance
      await client.query(
        'UPDATE users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, id]
      );

      // Record transaction
      await client.query(`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_before, balance_after, description)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, amount > 0 ? 'Credit' : 'Debit', Math.abs(amount), currentBalance, newBalance, description]);

      await client.query('COMMIT');

      // Send email notification if new balance is below threshold
      if (newBalance < threshold && currentBalance >= threshold) {
        emailService.sendWalletBalanceLowEmail(userEmail, userName, newBalance, threshold).catch(err => {
          console.error('Failed to send wallet balance low email:', err);
        });
      }

      res.json({
        success: true,
        message: 'Wallet balance updated successfully',
        data: { newBalance }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user wallet threshold
router.patch('/:id/wallet-threshold', async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold } = req.body;

    if (threshold === undefined || threshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid threshold value is required'
      });
    }

    // Get current balance, email, and name before updating threshold
    const userResult = await query(
      'SELECT wallet_balance, email, first_name, last_name FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const currentBalance = parseFloat(user.wallet_balance) || 0;
    const userEmail = user.email;
    const userName = `${user.first_name} ${user.last_name}`;

    const result = await query(`
      UPDATE users
      SET wallet_threshold = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, wallet_threshold
    `, [threshold, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send email notification if balance is below new threshold
    if (currentBalance < threshold) {
      emailService.sendWalletBalanceLowEmail(userEmail, userName, currentBalance, threshold).catch(err => {
        console.error('Failed to send wallet balance low email:', err);
      });
    }

    res.json({
      success: true,
      message: 'Wallet threshold updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update wallet threshold error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile picture
router.patch('/:id/profile-picture', async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_picture_url } = req.body;

    if (!profile_picture_url) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture URL is required'
      });
    }

    const result = await query(`
      UPDATE users
      SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role, status, profile_picture_url, updated_at
    `, [profile_picture_url, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { role, user_id } = req.query;

    let stats = {};

    if (role === 'Client' && user_id) {
      // Client stats
      const ordersResult = await query(`
        SELECT COUNT(*) as total_orders,
               COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered_orders,
               SUM(total_amount) as total_spent
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE c.user_id = $1
      `, [user_id]);

      const numbersResult = await query(`
        SELECT COUNT(*) as active_numbers
        FROM numbers n
        JOIN orders o ON n.order_id = o.id
        JOIN customers c ON o.customer_id = c.id
        WHERE c.user_id = $1 AND n.status = 'Active'
      `, [user_id]);

      const countriesResult = await query(`
        SELECT COUNT(DISTINCT co.id) as countries_count
        FROM countries co
        JOIN orders o ON o.country_id = co.id
        JOIN customers c ON o.customer_id = c.id
        WHERE c.user_id = $1
      `, [user_id]);

      stats = {
        activeNumbers: parseInt(numbersResult.rows[0].active_numbers) || 0,
        totalOrders: parseInt(ordersResult.rows[0].total_orders) || 0,
        countries: parseInt(countriesResult.rows[0].countries_count) || 0,
        totalSpent: parseFloat(ordersResult.rows[0].total_spent) || 0
      };
    } else if (role === 'Internal' || role === 'Admin') {
      // Internal/Admin stats
      const vendorsResult = await query('SELECT COUNT(*) as total_vendors FROM vendors');
      const customersResult = await query('SELECT COUNT(*) as total_customers FROM customers');
      const ordersResult = await query(`
        SELECT COUNT(*) as total_orders,
               COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed_orders,
               SUM(total_amount) as total_revenue
        FROM orders
      `);

      stats = {
        totalVendors: parseInt(vendorsResult.rows[0].total_vendors) || 0,
        totalCustomers: parseInt(customersResult.rows[0].total_customers) || 0,
        totalOrders: parseInt(ordersResult.rows[0].total_orders) || 0,
        confirmedOrders: parseInt(ordersResult.rows[0].confirmed_orders) || 0,
        totalRevenue: parseFloat(ordersResult.rows[0].total_revenue) || 0
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;