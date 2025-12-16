const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const emailService = require('../services/emailService');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register/Create user route
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, 'Active')
      RETURNING id, email, first_name, last_name, role, status
    `, [email, hashedPassword, first_name || null, last_name || null, role || 'Client']);

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This would normally use middleware to verify JWT token
    // For now, return a mock response
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

      const userResult = await query(
        'SELECT id, email, first_name, last_name, role, wallet_balance, profile_picture_url FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          walletBalance: parseFloat(user.wallet_balance) || 0,
          profilePicture: user.profile_picture_url
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password route
router.put('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get current user
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Verify old password
    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValidOldPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    const user = userResult.rows[0];

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired password reset link'
      });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateResult = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email',
      [hashedPassword, decoded.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot password - send OTP
router.post('/forgot-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    const user = userResult.rows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await query(
      `INSERT INTO password_reset_otp (user_id, email, otp, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, email, otp, expiresAt]
    );

    try {
      await emailService.sendForgotPasswordOTP(email, otp, expiryMinutes);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: email
      }
    });

  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const otpResult = await query(
      `SELECT id, user_id, attempts FROM password_reset_otp 
       WHERE email = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP AND is_verified = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      const wrongAttempt = await query(
        `SELECT id, attempts FROM password_reset_otp 
         WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP AND is_verified = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      );

      if (wrongAttempt.rows.length > 0) {
        const newAttempts = wrongAttempt.rows[0].attempts + 1;
        
        if (newAttempts >= 5) {
          await query(
            'DELETE FROM password_reset_otp WHERE id = $1',
            [wrongAttempt.rows[0].id]
          );
          return res.status(429).json({
            success: false,
            message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
          });
        }

        await query(
          'UPDATE password_reset_otp SET attempts = $1 WHERE id = $2',
          [newAttempts, wrongAttempt.rows[0].id]
        );
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const otpRecord = otpResult.rows[0];

    await query(
      'UPDATE password_reset_otp SET is_verified = TRUE WHERE id = $1',
      [otpRecord.id]
    );

    const resetToken = jwt.sign(
      { userId: otpRecord.user_id, email: email, type: 'otp-reset' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken: resetToken
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset password with OTP
router.post('/reset-password-with-otp', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'default_secret');
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (decoded.type !== 'otp-reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateResult = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email',
      [hashedPassword, decoded.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await query(
      'DELETE FROM password_reset_otp WHERE user_id = $1',
      [decoded.userId]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;