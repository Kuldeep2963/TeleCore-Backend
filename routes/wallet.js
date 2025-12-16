const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get wallet transactions for a user
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(`
      SELECT id, transaction_type, amount, balance_before, balance_after,
             description, reference_id, created_at
      FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get wallet balance for a user
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(`
      SELECT wallet_balance
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { balance: result.rows[0].wallet_balance }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;