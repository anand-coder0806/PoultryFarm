const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err);
  });

// Twilio Client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Order Schema
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Create New Inquiry
app.post('/api/orders', async (req, res) => {
  try {
    console.log('NEW INQUIRY:', req.body);

    const { name, phone, details, message } = req.body;

    if (!name || !phone || !details || !message) {
      return res.status(400).json({
        error: 'Name, Phone, Requirement Details and Message are required.'
      });
    }

    const order = await Order.create({
      name: name.trim(),
      phone: phone.trim(),
      details: details.trim(),
      message: message.trim()
    });

    // WhatsApp Notification
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: process.env.ADMIN_WHATSAPP,
        body:
`🐔 New Poultry Inquiry

Name: ${order.name}
Phone: ${order.phone}
Quantity: ${order.details}
Message: ${order.message}

Time: ${new Date(order.timestamp).toLocaleString()}`
      });

      console.log('✅ WhatsApp notification sent');

    } catch (whatsappError) {
      console.error('❌ WhatsApp Error:', whatsappError.message);
    }

    res.status(201).json({
      message: 'Order submitted successfully',
      order
    });

  } catch (error) {
    console.error('SAVE ERROR:', error);

    res.status(500).json({
      error: 'Failed to save inquiry'
    });
  }
});

// Get All Inquiries
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });

    res.json(orders);

  } catch (error) {
    console.error('FETCH ERROR:', error);

    res.status(500).json({
      error: 'Failed to fetch inquiries'
    });
  }
});

// Delete Inquiry
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        error: 'Inquiry not found'
      });
    }

    res.json({
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('DELETE ERROR:', error);

    res.status(500).json({
      error: 'Failed to delete inquiry'
    });
  }
});

// Frontend Routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n==================================================');
  console.log(' Anand Sagar Poultry Farm Backend is running!');
  console.log(` Local URL:    http://localhost:${PORT}`);
  console.log(` Admin Panel:  http://localhost:${PORT}/admin.html`);
  console.log('==================================================\n');
});