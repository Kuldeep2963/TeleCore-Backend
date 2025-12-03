const express = require('express');
const { query } = require('../config/database');
const { requireClient, requireInternal } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { customer_id, vendor_id, country, product_type, service_name, start_date, end_date, status } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    // Role-based access control
    if (userRole === 'Client') {
      // Clients can only see their own orders
      whereClause += ` AND c.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (userRole === 'Internal' || userRole === 'Client') {
      // Internal users and admins can see all orders, or filter by specific customer/vendor if specified
      if (customer_id) {
        whereClause += ` AND o.customer_id = $${paramIndex}`;
        params.push(customer_id);
        paramIndex++;
      }
      if (vendor_id) {
        whereClause += ` AND o.vendor_id = $${paramIndex}`;
        params.push(vendor_id);
        paramIndex++;
      }
    }

    // Additional filters
    if (country) {
      whereClause += ` AND LOWER(co.countryname) = LOWER($${paramIndex})`;
      params.push(country);
      paramIndex++;
    }

    if (product_type) {
      whereClause += ` AND LOWER(p.category) = LOWER($${paramIndex})`;
      params.push(product_type);
      paramIndex++;
    }

    if (service_name) {
      whereClause += ` AND LOWER(p.name) = LOWER($${paramIndex})`;
      params.push(service_name);
      paramIndex++;
    }

    if (start_date) {
      whereClause += ` AND o.order_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClause += ` AND o.order_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND LOWER(o.status) = LOWER($${paramIndex})`;
      params.push(status);
      paramIndex++;
    }

    const result = await query(`
      SELECT o.id, o.order_number, o.quantity, o.total_amount, o.status, o.order_date, o.completed_date, o.created_at, o.documents, o.area_code,
             o.country_id, o.product_id,
             c.company_name, c.contact_person,
             u.first_name, u.last_name, u.email as user_email,
             v.name as vendor_name,
             p.name as product_name, p.category as product_category,
             co.countryname as country_name, co.phonecode as country_code
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN vendors v ON o.vendor_id = v.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN countries co ON o.country_id = co.id
      WHERE 1=1 ${whereClause}
      ORDER BY o.created_at DESC
    `, params);

    // Fetch order pricing for each order
    const transformedData = await Promise.all(result.rows.map(async (order) => {
      // Documents are stored as JSON strings in the TEXT[][] field
      let parsedDocuments = [];
      if (order.documents && Array.isArray(order.documents)) {
        // Parse each document entry which may be stored as JSON string
        parsedDocuments = order.documents.map(doc => {
          if (typeof doc === 'string') {
            try {
              return JSON.parse(doc);
            } catch (e) {
              // If parsing fails, try to handle as array format
              return doc;
            }
          }
          return doc;
        });
      }

      // Fetch order pricing data
      let desiredPricingData = null;
      try {
        const pricingResult = await query(
          'SELECT * FROM order_pricing WHERE order_id = $1 AND pricing_type = $2',
          [order.id, 'desired']
        );
        if (pricingResult.rows.length > 0) {
          const pricing = pricingResult.rows[0];
          desiredPricingData = {
            nrc: pricing.nrc,
            mrc: pricing.mrc,
            ppm: pricing.ppm,
            ppm_fix: pricing.ppm_fix,
            ppm_mobile: pricing.ppm_mobile,
            ppm_payphone: pricing.ppm_payphone,
            arc: pricing.arc,
            mo: pricing.mo,
            mt: pricing.mt,
            incoming_ppm: pricing.incoming_ppm,
            outgoing_ppm_fix: pricing.outgoing_ppm_fix,
            outgoing_ppm_mobile: pricing.outgoing_ppm_mobile,
            incoming_sms: pricing.incoming_sms,
            outgoing_sms: pricing.outgoing_sms
          };
        }
      } catch (err) {
        console.error('Error fetching order pricing:', err);
      }

      return {
        id: order.id,
        orderNo: order.order_number,
        country: order.country_name || 'N/A',
        productType: order.product_category || 'N/A',
        serviceName: order.product_name || 'N/A',
        areaCode: order.area_code || 'N/A',
        quantity: order.quantity,
        orderStatus: order.status,
        orderDate: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : null,
        completedDate: order.completed_date ? new Date(order.completed_date).toISOString().split('T')[0] : null,
        created_at: order.created_at,
        totalAmount: order.total_amount,
        companyName: order.company_name,
        vendorName: order.vendor_name,
        documents: parsedDocuments,
        pricing: desiredPricingData,
        desiredPricing: desiredPricingData,
        createdBy: order.first_name && order.last_name ? `${order.first_name} ${order.last_name}` : (order.user_email || 'Unknown User')
      };
    }));

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', requireClient, async (req, res) => {
  try {
    let { customer_id, vendor_id, product_id, country_id, area_code, quantity, total_amount, status, documents } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: 'customer_id is required'
      });
    }

    // Validate customer_id
    try {
      const customerCheck = await query('SELECT id FROM customers WHERE id = $1', [customer_id]);
      if (customerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer not found'
        });
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid customer_id'
      });
    }

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'product_id is required'
      });
    }

    // Validate product_id
    try {
      const productCheck = await query('SELECT id FROM products WHERE id = $1', [product_id]);
      if (productCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }
    } catch (error) {
      console.error('Error checking product:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid product_id'
      });
    }

    if (!country_id) {
      return res.status(400).json({
        success: false,
        message: 'country_id is required'
      });
    }

    // Validate country_id
    try {
      const countryCheck = await query('SELECT id FROM countries WHERE id = $1', [country_id]);
      if (countryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Country not found'
        });
      }
    } catch (error) {
      console.error('Error checking country:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid country_id'
      });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    let processedDocuments = null;
    if (documents && Array.isArray(documents) && documents.length > 0) {
      processedDocuments = documents;
    }

    const result = await query(`
      INSERT INTO orders (order_number, customer_id, vendor_id, product_id, country_id, area_code, quantity, total_amount, status, documents)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [orderNumber, customer_id, vendor_id || null, product_id || null, country_id || null, area_code || null, quantity || 1, total_amount || 0, status || 'In Progress', processedDocuments]);

    const returnData = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: returnData
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    console.error('Create order error details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Order pricing endpoints - must come BEFORE /:id routes
router.post('/:orderId/pricing', requireClient, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pricing_type, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone, arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile, incoming_sms, outgoing_sms } = req.body;

    const result = await query(`
      INSERT INTO order_pricing (order_id, pricing_type, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone, arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile, incoming_sms, outgoing_sms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [orderId, pricing_type, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone, arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile, incoming_sms, outgoing_sms]);

    res.status(201).json({
      success: true,
      message: 'Order pricing created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create order pricing error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

router.get('/:orderId/pricing', requireClient, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await query('SELECT * FROM order_pricing WHERE order_id = $1 ORDER BY created_at', [orderId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get order pricing error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Status update route - must come BEFORE /:id route
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const isDelivered = status.toLowerCase() === 'delivered';
    const result = await query(`
      UPDATE orders
      SET status = $1, ${isDelivered ? 'completed_date = CURRENT_DATE,' : ''} updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ID-based routes come last
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT o.*, c.company_name, c.contact_person, v.name as vendor_name, p.name as product_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vendors v ON o.vendor_id = v.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = result.rows[0];
    
    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, vendor_id, product_id, area_code, quantity, total_amount, status, documents } = req.body;

    const completedDateClause = status && status.toLowerCase() === 'delivered' 
      ? 'completed_date = CURRENT_DATE,'
      : '';

    const result = await query(`
      UPDATE orders
      SET customer_id = COALESCE($1, customer_id),
          vendor_id = COALESCE($2, vendor_id),
          product_id = COALESCE($3, product_id),
          area_code = COALESCE($4, area_code),
          quantity = COALESCE($5, quantity),
          total_amount = COALESCE($6, total_amount),
          status = COALESCE($7, status),
          documents = COALESCE($8, documents),
          ${completedDateClause}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [customer_id, vendor_id, product_id, area_code, quantity, total_amount, status, documents, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = result.rows[0];

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: orderData
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM orders
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;