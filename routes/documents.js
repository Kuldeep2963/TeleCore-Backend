const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const { requireClient, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload documents for an order
router.post('/upload/:orderId', requireClient, upload.array('documents', 10), async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // If orderId is 'temp', this is a temporary upload before order creation
    if (orderId === 'temp') {
      // Store documents temporarily - they will be associated with an order later
      const tempDocuments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date().toISOString(),
        userId: userId
      }));

      // For now, just return success - in a real implementation, you'd store this in a temp table
      res.json({
        success: true,
        message: `${req.files.length} document(s) uploaded successfully`,
        data: {
          tempId: `temp_${Date.now()}`,
          uploadedFiles: tempDocuments
        }
      });
      return;
    }

    // Verify the order belongs to the user
    const orderCheck = await query(`
      SELECT o.id, c.user_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only upload documents for your own orders.'
      });
    }

    // Get current documents array from the order
    const currentOrder = await query('SELECT documents FROM orders WHERE id = $1', [orderId]);
    let documentsArray = [];
    
    if (currentOrder.rows[0].documents && Array.isArray(currentOrder.rows[0].documents)) {
      documentsArray = currentOrder.rows[0].documents;
    }

    // Add new documents to the array
    const newDocuments = req.files.map(file => [
      file.filename, // filename
      file.originalname, // original name
      file.mimetype, // mime type
      file.size.toString(), // file size
      new Date().toISOString() // upload date
    ]);

    documentsArray = [...documentsArray, ...newDocuments];

    // Update the order with new documents array (store as array in TEXT[][] field)
    await query('UPDATE orders SET documents = $1 WHERE id = $2', [documentsArray, orderId]);

    res.json({
      success: true,
      message: `${req.files.length} document(s) uploaded successfully`,
      data: {
        uploadedFiles: req.files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }))
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get documents for an order
router.get('/:orderId', requireClient, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify the order belongs to the user
    const orderCheck = await query(`
      SELECT o.id, o.documents, c.user_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view documents for your own orders.'
      });
    }

    let documents = [];
    const docsData = orderCheck.rows[0].documents;
    
    if (docsData && Array.isArray(docsData)) {
      documents = docsData;
    }

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error hai bhai'
    });
  }
});

// Download a specific document
router.get('/download/:orderId/:filename', authenticateToken, async (req, res) => {
  try {
    const { orderId, filename } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify the order exists
    const orderCheck = await query(`
      SELECT o.id, c.user_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access: Clients can only download their own order documents, Internal can download any
    if (userRole === 'Client' && orderCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Send the file
    res.download(filePath);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a document from an order
router.delete('/:orderId/:filename', requireClient, async (req, res) => {
  try {
    const { orderId, filename } = req.params;
    const userId = req.user.id;

    // Verify the order belongs to the user
    const orderCheck = await query(`
      SELECT o.id, o.documents, c.user_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    let documentsArray = [];
    const docsData = orderCheck.rows[0].documents;
    
    if (docsData && Array.isArray(docsData)) {
      documentsArray = docsData;
    }

    // Remove the document from the array
    documentsArray = documentsArray.filter(doc => doc[0] !== filename);

    // Update the order (store as array in TEXT[][] field)
    await query('UPDATE orders SET documents = $1 WHERE id = $2', [documentsArray, orderId]);

    // Delete the physical file
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;