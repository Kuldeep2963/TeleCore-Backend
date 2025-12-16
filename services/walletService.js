const { getClient } = require('../config/database');

const processPayment = async (userId, amount, description, referenceId, transactionType = 'Debit') => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Check balance
    const userResult = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentBalance = parseFloat(userResult.rows[0].wallet_balance);
    const paymentAmount = parseFloat(amount);

    if (currentBalance < paymentAmount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = currentBalance - paymentAmount;

    // Update balance
    await client.query(
      'UPDATE users SET wallet_balance = $1 WHERE id = $2',
      [newBalance, userId]
    );

    // Create transaction record
    const transactionResult = await client.query(
      `INSERT INTO wallet_transactions 
       (user_id, transaction_type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, transactionType, paymentAmount, currentBalance, newBalance, description, referenceId]
    );

    await client.query('COMMIT');
    
    return transactionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  processPayment
};
