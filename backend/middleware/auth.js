const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

      // Fetch current user data to ensure they still exist and are active
      const userResult = await query(
        'SELECT id, email, role, status FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      if (user.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware for client-only access
const requireClient = requireRole('Client');

// Middleware for internal-only access
const requireInternal = requireRole('Internal', 'Admin');

// Middleware for admin-only access
const requireAdmin = requireRole('Admin');

// Middleware for internal or admin access
const requireInternalOrAdmin = requireRole('Internal', 'Admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireClient,
  requireInternal,
  requireAdmin,
  requireInternalOrAdmin
};