require('dotenv').config();
const express = require('express');
const connectDB = require('./app/config/db');

const app = express();

// Connect to Database
connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});