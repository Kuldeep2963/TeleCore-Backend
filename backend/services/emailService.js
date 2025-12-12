const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS.trim()
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else if (success) {
    console.log('✅ Email transporter is ready to send emails');
  }
});

const emailTemplates = {
  baseTemplate: (content, title = null) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Notification'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; font-weight: 600; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .info-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .info-row { display: flex; margin-bottom: 12px; align-items: center; }
        .info-label { font-weight: 600; color: #495057; min-width: 180px; }
        .info-value { color: #212529; font-weight: 500; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-left: 10px; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .danger { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        .primary { background: #cce5ff; color: #004085; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .cta-button:hover { transform: translateY(-2px); }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; }
        .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
        .footer-links a:hover { text-decoration: underline; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, #dee2e6, transparent); margin: 30px 0; }
        .highlight-box { background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%); border: 1px solid #e0e6ff; padding: 25px; border-radius: 10px; margin: 25px 0; }
        .timeline { position: relative; padding-left: 30px; margin: 25px 0; }
        .timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: #667eea; }
        .timeline-item { position: relative; margin-bottom: 20px; }
        .timeline-item::before { content: ''; position: absolute; left: -20px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #667eea; border: 3px solid white; }
        @media (max-width: 600px) {
          .content { padding: 30px 20px; }
          .info-row { flex-direction: column; align-items: flex-start; }
          .info-label { margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${title || 'Business Communications'}</h1>
          <p>Important Update Regarding Your Account</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div style="margin-bottom: 15px;">
            <strong>Need Assistance?</strong>
            <div style="margin-top: 10px;">Contact our support team: kuldeep.tyagi@xoraxsoft.com</div>
          </div>
          <div class="divider"></div>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p style="font-size: 12px; margin-top: 15px; color: #adb5bd;">
            © ${new Date().getFullYear()} TeleCore. All rights reserved.<br>
            810,8th floor, Vipul business park, sector-48, Gurgaon, Haryana, India.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  orderPlaced: (orderNumber, productName, quantity) => `
    <h2 style="color: #333; margin-bottom: 10px;">🎉 Order Successfully Placed!</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">Thank you for your order! We've received your request and are processing it now.</p>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Order Summary</h3>
      <div class="info-row">
        <div class="info-label">Order Number:</div>
        <div class="info-value">${orderNumber}</div>
      </div>
      <div class="info-row">
         <div class="info-label"> Order Status:</div>
        <div class= "info-value"><span class="status-badge primary">Processing</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Product/Service:</div>
        <div class="info-value">${productName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Quantity:</div>
        <div class="info-value">${quantity}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Order Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    
    <div class="timeline">
      <h3 style="color: #333; margin-bottom: 20px;">What's Next?</h3>
      <div class="timeline-item">
        <strong>Order Received</strong>
        <p style="color: #6c757d; margin-top: 5px;">We've received your order and are reviewing it</p>
      </div>
      <div class="timeline-item">
        <strong>Processing</strong>
        <p style="color: #6c757d; margin-top: 5px;">Our team is preparing your order</p>
      </div>
      <div class="timeline-item">
        <strong>Confirmation</strong>
        <p style="color: #6c757d; margin-top: 5px;">You'll receive confirmation within 24-48 hours</p>
      </div>
    </div>
    
    <div class="info-card">
      <strong>📋 Important Information</strong>
      <p style="margin-top: 10px; color: #495057;">
        • You can track your order status in your account dashboard<br>
        • We'll notify you via email at each step of the process<br>
        • Estimated processing time: 24-48 business hours
      </p>
    </div>
  `,
  
  orderConfirmed: (orderNumber, productName, completionDate) => `
    <h2 style="color: #333; margin-bottom: 10px;">✅ Order Confirmed!</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">Great news! Your order has been confirmed and is now being processed.</p>
    
    <div class="info-card" style="border-left-color: #28a745;">
      <div class="info-row">
        <div class="info-label">Order Status:</div>
        <div class="info-value"><span class="status-badge success">Confirmed</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Order Details</h3>
      <div class="info-row">
        <div class="info-label">Order Number:</div>
        <div class="info-value"><strong>${orderNumber}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Product/Service:</div>
        <div class="info-value">${productName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Confirmation Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Expected Completion:</div>
        <div class="info-value"><strong>${completionDate}</strong></div>
      </div>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #2e7d32; margin-bottom: 10px;">🎯 Next Steps</h4>
      <p style="color: #388e3c;">
        Your order is now in the active queue. Our team is working diligently to complete it by the expected date.
        We'll send you another update once your order is delivered.
      </p>
    </div>
    
    <p style="color: #495057; font-style: italic;">
      Need to make changes? Please contact our support team as soon as possible.
    </p>
  `,
  
  orderDelivered: (orderNumber, productName, deliveryDate) => `
    <h2 style="color: #333; margin-bottom: 10px;">🚀 Order Successfully Delivered!</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">We're excited to inform you that your order has been delivered and is now ready for use!</p>
    
    <div class="info-card" style="border-left-color: #17a2b8;">
      <div class="info-row">
        <div class="info-label">Delivery Status:</div>
        <div class="info-value"><span class="status-badge info">Delivered</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Delivery Summary</h3>
      <div class="info-row">
        <div class="info-label">Order Number:</div>
        <div class="info-value">${orderNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Product/Service:</div>
        <div class="info-value">${productName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Delivery Date:</div>
        <div class="info-value"><strong>${deliveryDate}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Delivery Time:</div>
        <div class="info-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #1565c0; margin-bottom: 10px;">📋 Important Billing Information</h4>
      <p style="color: #1976d2;">
        • Monthly invoices will be generated on the 1st of each month<br>
        • Billing starts from today's delivery date<br>
        • You can view and download invoices from your account dashboard<br>
        • Payment is due within 15 days of invoice generation
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/orders/${orderNumber}" class="cta-button">
        View Order Details
      </a>
    </div>
    
    <p style="text-align: center; color: #6c757d; font-size: 14px;">
      Thank you for choosing our services! We're here to help if you need any assistance.
    </p>
  `,
  
  orderRejected: (orderNumber, productName, reason) => `
    <h2 style="color: #333; margin-bottom: 10px;">⚠️ Order Rejected</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">We regret to inform you that your order has been rejected.</p>
    
    <div class="info-card" style="border-left-color: #dc3545;">
      <div class="info-row">
        <div class="info-label">Order Status:</div>
        <div class="info-value"><span class="status-badge danger">Rejected</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Rejection Details</h3>
      <div class="info-row">
        <div class="info-label">Order Number:</div>
        <div class="info-value">${orderNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Product/Service:</div>
        <div class="info-value">${productName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Rejection Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Reason for Rejection:</div>
        <div class="info-value" style="color: #dc3545;"><strong>${reason || 'Contact support for details'}</strong></div>
      </div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #856404; margin-bottom: 10px;">🔄 Next Steps Available</h4>
      <p style="color: #856404;">
        1. <strong>Contact Support:</strong> Discuss the rejection reason and possible alternatives<br>
        2. <strong>Modify & Resubmit:</strong> Adjust your order based on the feedback and resubmit<br>
        3. <strong>Request Review:</strong> Request a manual review of your order
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/support" class="cta-button" style="background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);">
        Contact Support
      </a>
    </div>
  `,
  
  invoiceGenerated: (invoiceNumber, amount, dueDate, period) => `
    <h2 style="color: #333; margin-bottom: 10px;">📄 Invoice Generated</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">Your monthly invoice has been generated and is ready for payment.</p>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Invoice Details</h3>
      <div class="info-row">
        <div class="info-label">Invoice Number:</div>
        <div class="info-value"><strong>${invoiceNumber}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Billing Period:</div>
        <div class="info-value">${period}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Amount Due:</div>
        <div class="info-value" style="font-size: 24px; color: #2e7d32; font-weight: 700;">$${parseFloat(amount).toFixed(2)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Due Date:</div>
        <div class="info-value"><strong style="color: #d32f2f;">${dueDate}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Invoice Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #2e7d32; margin-bottom: 10px;">💳 Payment Methods</h4>
      <p style="color: #388e3c;">
        • Credit/Debit Card • Wallet • Stripe<br>
        • Secure SSL encryption
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/invoices/${invoiceNumber}" class="cta-button">
        View & Pay Invoice
      </a>
    </div>
    
    <div class="info-card">
      <strong>⏰ Payment Terms</strong>
      <p style="margin-top: 10px; color: #495057;">
        • Payment is due by ${dueDate}<br>
        • Automatic payment receipts are issued upon successful payment<br>
        • Contact support for payment extensions or questions
      </p>
    </div>
  `,
  
  invoiceOverdue: (invoiceNumber, amount, overdueDate) => `
    <h2 style="color: #333; margin-bottom: 10px;">🚨 Invoice Overdue</h2>
    <p style="margin-bottom: 25px; color: #6c757d; font-weight: 500;">
      Your invoice payment is now overdue. Immediate attention is required.
    </p>
    
    <div class="info-card" style="border-left-color: #dc3545;">
      <div class="info-row">
        <div class="info-label">Payment Status:</div>
        <div class="info-value"><span class="status-badge danger">OVERDUE</span></div>
      </div>
    </div>
    
    <div class="highlight-box" style="border-color: #dc3545;">
      <h3 style="color: #dc3545; margin-bottom: 15px;">Overdue Invoice</h3>
      <div class="info-row">
        <div class="info-label">Invoice Number:</div>
        <div class="info-value">${invoiceNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Overdue Since:</div>
        <div class="info-value" style="color: #dc3545;"><strong>${overdueDate}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Amount Overdue:</div>
        <div class="info-value" style="font-size: 22px; color: #dc3545; font-weight: 700;">$${parseFloat(amount).toFixed(2)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Late Fee:</div>
        <div class="info-value" style="color: #dc3545;">$${(parseFloat(amount) * 0.05).toFixed(2)} (5%)</div>
      </div>
      <div class="info-row">
        <div class="info-label">Total Due:</div>
        <div class="info-value" style="font-size: 24px; color: #dc3545; font-weight: 800;">
          $${(parseFloat(amount) * 1.05).toFixed(2)}
        </div>
      </div>
    </div>
    
    <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #721c24; margin-bottom: 10px;">⚠️ Important Notice</h4>
      <p style="color: #721c24;">
        • Failure to pay may result in service suspension<br>
        • Additional daily interest may apply after 7 days overdue<br>
        • Legal action may be initiated after 30 days overdue<br>
        • Please contact us immediately if payment has been made
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/invoices/${invoiceNumber}/pay" class="cta-button" style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);">
        Pay Overdue Invoice Now
      </a>
    </div>
    
    <p style="text-align: center; color: #dc3545; font-weight: 500;">
      Please arrange payment immediately to avoid service interruption.
    </p>
  `,
  
  invoiceOverdueWarning: (invoiceNumber, amount, dueDate, daysRemaining = 4) => `
    <h2 style="color: #333; margin-bottom: 10px;">⏳ Payment Due Soon</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">
      Friendly reminder: Your invoice payment is due in <strong style="color: #ff9800;">${daysRemaining} days</strong>.
    </p>
    
    <div class="info-card" style="border-left-color: #ff9800;">
      <div class="info-row">
        <div class="info-label">Payment Status:</div>
        <div class="info-value"><span class="status-badge warning">Due in ${daysRemaining} days</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Invoice Summary</h3>
      <div class="info-row">
        <div class="info-label">Invoice Number:</div>
        <div class="info-value">${invoiceNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Amount Due:</div>
        <div class="info-value" style="font-size: 22px; color: #333; font-weight: 700;">$${parseFloat(amount).toFixed(2)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Due Date:</div>
        <div class="info-value"><strong style="color: ${daysRemaining <= 2 ? '#ff9800' : '#333'};">
          ${dueDate} (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)
        </strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Reminder Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #856404; margin-bottom: 10px;">💡 Quick Payment Options</h4>
      <p style="color: #856404;">
        • <strong>Auto-Pay:</strong> Set up automatic payments for future invoices<br>
        • <strong>One-Click Pay:</strong> Use your saved payment method<br>
        • <strong>Bank Transfer:</strong> Use invoice number as reference<br>
        • <strong>Multiple Cards:</strong> Visa, Mastercard, American Express
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/invoices/${invoiceNumber}" class="cta-button" style="background: linear-gradient(135deg, #ff9a00 0%, #ff5e00 100%);">
        Pay Invoice Now
      </a>
    </div>
    
    <p style="text-align: center; color: #6c757d; font-size: 14px;">
      Early payments are always appreciated! Thank you for your business.
    </p>
  `,
  
  numberDisconnected: (number, orderNumber, disconnectionDate) => `
    <h2 style="color: #333; margin-bottom: 10px;">📱 Phone Number Disconnected</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">
      One of your phone numbers has been disconnected as requested.
    </p>
    
    <div class="info-card" style="border-left-color: #6c757d;">
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value"><span class="status-badge" style="background: #6c757d; color: white;">Disconnected</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Disconnection Details</h3>
      <div class="info-row">
        <div class="info-label">Phone Number:</div>
        <div class="info-value" style="font-size: 18px; font-weight: 700;">${number}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Associated Order:</div>
        <div class="info-value">${orderNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Disconnection Date:</div>
        <div class="info-value"><strong>${disconnectionDate}</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Disconnection Time:</div>
        <div class="info-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</div>
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #495057; margin-bottom: 10px;">💰 Billing Impact</h4>
      <p style="color: #495057;">
        • <strong>Billing for this number will stop immediately</strong><br>
        • Final prorated charges will appear on your next invoice<br>
        • No further monthly charges for this number<br>
        • Any unused service credits will be refunded
      </p>
    </div>
    
    <div class="info-card">
      <strong>🔁 Want to Reactivate?</strong>
      <p style="margin-top: 10px; color: #495057;">
        If this was a mistake or you wish to reactivate this number, please contact our support team within 30 days.
        Reactivation may be subject to availability and reactivation fees.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/orders/${orderNumber}" class="cta-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        View Order Details
      </a>
    </div>
  `,
  
  walletBalanceLow: (userName, currentBalance, thresholdAmount) => `
    <h2 style="color: #333; margin-bottom: 10px;">⚠️ Wallet Balance Below Threshold</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">
      Your wallet balance has fallen below your set threshold. Please top up your account to continue using our services uninterrupted.
    </p>
    
    <div class="info-card" style="border-left-color: #ff9800;">
      <div class="info-row">
        <div class="info-label">Alert Status:</div>
        <div class="info-value"><span class="status-badge warning">Action Required</span></div>
      </div>
    </div>
    
    <div class="highlight-box">
      <h3 style="color: #667eea; margin-bottom: 15px;">Wallet Details</h3>
      <div class="info-row">
        <div class="info-label">Account Name:</div>
        <div class="info-value">${userName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Current Balance:</div>
        <div class="info-value" style="font-size: 24px; color: #d32f2f; font-weight: 700;">$${parseFloat(currentBalance).toFixed(2)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Threshold Amount:</div>
        <div class="info-value" style="font-size: 18px; color: #ff9800; font-weight: 600;">$${parseFloat(thresholdAmount).toFixed(2)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Alert Date:</div>
        <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #856404; margin-bottom: 10px;">💰 Why This Matters</h4>
      <p style="color: #856404;">
        • Maintaining a sufficient wallet balance ensures uninterrupted service<br>
        • Orders may be affected if your balance drops too low<br>
        • Quick action can prevent service disruptions<br>
        • You can always adjust your threshold settings
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/billing/topup" class="cta-button" style="background: linear-gradient(135deg, #ff9a00 0%, #ff5e00 100%);">
        Top Up Your Wallet Now
      </a>
    </div>
    
    <div class="info-card">
      <strong>💡 Quick Tips</strong>
      <p style="margin-top: 10px; color: #495057;">
        • Top up your wallet using Credit/Debit Card or Bank Transfer<br>
        • You can set auto-top-up for convenience<br>
        • Adjust your threshold in Account Settings<br>
        • Check transaction history anytime in your dashboard
      </p>
    </div>
  `,

  passwordReset: (resetUrl) => `
    <h2 style="color: #333; margin-bottom: 10px;">🔐 Password Reset Request</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">
      You requested to reset your password. Click the button below to create a new password.
    </p>
    
    <div class="info-card" style="border-left-color: #17a2b8;">
      <div class="info-row">
        <div class="info-label">Request Status:</div>
        <div class="info-value"><span class="status-badge info">Active</span></div>
      </div>
      <div class="info-row">
        <div class="info-label">Requested At:</div>
        <div class="info-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Expires In:</div>
        <div class="info-value" style="color: #d32f2f;">1 hour</div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetUrl}" class="cta-button" style="font-size: 16px; padding: 16px 40px;">
        Reset Your Password
      </a>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="color: #1565c0; margin: 0;">
        <strong>Security Tip:</strong> This link will expire in 1 hour for your protection.<br>
        If you didn't request this, please secure your account immediately.
      </p>
    </div>
    
    <div class="info-card">
      <strong>🔒 Security Information</strong>
      <p style="margin-top: 10px; color: #495057;">
        • Never share your password or this link with anyone<br>
        • Use a strong, unique password with letters, numbers, and symbols<br>
        • Enable two-factor authentication for added security<br>
        • Our support team will never ask for your password
      </p>
    </div>
    
    <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 25px;">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </p>
  `,

  forgotPasswordOTP: (otp, expiryMinutes = 10) => `
    <h2 style="color: #333; margin-bottom: 10px;">🔐 Password Reset Request</h2>
    <p style="margin-bottom: 25px; color: #6c757d;">We received a request to reset your password. Use the OTP below to verify your identity and reset your password.</p>
    
    <div class="highlight-box" style="text-align: center;">
      <h3 style="color: #667eea; margin-bottom: 15px;">Your One-Time Password (OTP)</h3>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin: 20px 0;">
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #d32f2f; font-weight: 600; margin: 15px 0;">
        ⏱️ This OTP expires in ${expiryMinutes} minutes
      </p>
    </div>
    
    <div class="info-card">
      <div class="info-row">
        <div class="info-label">Request Time:</div>
        <div class="info-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString()}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Expiry:</div>
        <div class="info-value" style="color: #d32f2f;">${expiryMinutes} minutes from now</div>
      </div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
      <p style="color: #856404; margin: 0;">
        <strong>⚠️ Important:</strong> If you didn't request this OTP, please ignore this email. Your account is still secure.
      </p>
    </div>
    
    <div class="info-card">
      <strong>🔒 Security Tips</strong>
      <p style="margin-top: 10px; color: #495057;">
        • Never share your OTP with anyone<br>
        • Our support team will never ask for your OTP<br>
        • Always use a strong, unique password<br>
        • Keep your email account secure
      </p>
    </div>
  `
};

const sendEmail = async (email, subject, html, title = null) => {
  const mailOptions = {
    from: `"Business Communications" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    html: emailTemplates.baseTemplate(html, title || subject)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  return await sendEmail(email, 'Reset Your Password - Security Alert', emailTemplates.passwordReset(resetUrl), 'Password Reset');
};

exports.sendForgotPasswordOTP = async (email, otp, expiryMinutes = 10) => {
  return await sendEmail(email, `Your Password Reset OTP: *******`, emailTemplates.forgotPasswordOTP(otp, expiryMinutes), 'Password Reset OTP');
};

exports.sendOrderPlacedEmail = async (email, orderNumber, productName, quantity) => {
  return await sendEmail(email, `Order Placed: ${orderNumber}`, emailTemplates.orderPlaced(orderNumber, productName, quantity), 'Order Confirmation');
};

exports.sendOrderConfirmedEmail = async (email, orderNumber, productName, completionDate) => {
  return await sendEmail(email, `Order Confirmed: ${orderNumber}`, emailTemplates.orderConfirmed(orderNumber, productName, completionDate), 'Order Processing');
};

exports.sendOrderDeliveredEmail = async (email, orderNumber, productName, deliveryDate) => {
  return await sendEmail(email, `Order Delivered: ${orderNumber}`, emailTemplates.orderDelivered(orderNumber, productName, deliveryDate), 'Order Delivered');
};

exports.sendOrderRejectedEmail = async (email, orderNumber, productName, reason) => {
  return await sendEmail(email, `Order Update: ${orderNumber}`, emailTemplates.orderRejected(orderNumber, productName, reason), 'Order Status Update');
};

exports.sendInvoiceGeneratedEmail = async (email, invoiceNumber, amount, dueDate, period) => {
  return await sendEmail(email, `Invoice ${invoiceNumber} Generated`, emailTemplates.invoiceGenerated(invoiceNumber, amount, dueDate, period), 'New Invoice');
};

exports.sendInvoiceOverdueEmail = async (email, invoiceNumber, amount, overdueDate) => {
  return await sendEmail(email, `URGENT: Invoice ${invoiceNumber} Overdue`, emailTemplates.invoiceOverdue(invoiceNumber, amount, overdueDate), 'Overdue Invoice');
};

exports.sendInvoiceOverdueWarningEmail = async (email, invoiceNumber, amount, dueDate, daysRemaining = 4) => {
  const subject = daysRemaining <= 2 
    ? `Final Reminder: Invoice ${invoiceNumber} Due Soon` 
    : `Reminder: Invoice ${invoiceNumber} Payment Due`;
  return await sendEmail(email, subject, emailTemplates.invoiceOverdueWarning(invoiceNumber, amount, dueDate, daysRemaining), 'Payment Reminder');
};

exports.sendNumberDisconnectedEmail = async (email, number, orderNumber, disconnectionDate) => {
  return await sendEmail(email, `Number ${number} Disconnected`, emailTemplates.numberDisconnected(number, orderNumber, disconnectionDate), 'Service Update');
};

exports.sendWalletBalanceLowEmail = async (email, userName, currentBalance, thresholdAmount) => {
  return await sendEmail(email, `⚠️ Your Wallet Balance is Below Threshold`, emailTemplates.walletBalanceLow(userName, currentBalance, thresholdAmount), 'Wallet Alert');
};

exports.sendNotificationEmail = async (email, subject, message) => {
  const mailOptions = {
    from: `"Business Communications" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    html: emailTemplates.baseTemplate(`<div style="padding: 20px;">${message}</div>`, subject)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};