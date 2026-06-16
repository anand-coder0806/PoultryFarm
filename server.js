const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Helper: Read orders from file
const readOrders = () => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading orders file:', error);
    return [];
  }
};

// Helper: Write orders to file
const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to orders file:', error);
    return false;
  }
};

// API: Save a new order/inquiry
app.post('/api/orders', (req, res) => {
  console.log('NEW INQUIRY:', req.body);
  const { name, phone, details, message } = req.body;

  if (!name || !phone || !details || !message) {
    return res.status(400).json({ error: 'Name, Phone, Requirement Details, and Message are required fields.' });
  }

  const newOrder = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    phone: phone.trim(),
    details: (details || '').trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  const orders = readOrders();
  orders.push(newOrder);

  if (writeOrders(orders)) {
    res.status(201).json({ message: 'Order submitted successfully', order: newOrder });
  } else {
    res.status(500).json({ error: 'Failed to save order to local storage.' });
  }
});

// API: Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  // Return orders sorted by newest first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(sortedOrders);
});

// API: Delete an order by ID
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  let orders = readOrders();
  
  const orderExists = orders.some(o => o.id === orderId);
  if (!orderExists) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  orders = orders.filter(o => o.id !== orderId);
  
  if (writeOrders(orders)) {
    res.json({ message: 'Order deleted successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to delete order from local storage.' });
  }
});

// Serve frontend routing defaults for any non-API request
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(` Anand Sagar Poultry Farm Backend is running!`);
  console.log(` Local URL:    http://localhost:${PORT}`);
  console.log(` Admin Panel:  http://localhost:${PORT}/admin.html`);
  console.log(`==================================================\n`);
});
