require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./app/config/db');
const productRoutes = require('./app/routes/productRoutes');
const notificationRoutes = require('./app/routes/notificationRoutes');
const chatRoutes = require('./app/routes/chatRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});