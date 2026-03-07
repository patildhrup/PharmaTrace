const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   POST /api/products
// @desc    Sync product data from blockchain to database
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const { batchNumber } = productData;

        if (!batchNumber) {
            return res.status(400).json({ message: 'Batch number is required' });
        }

        // Upsert product data
        const product = await Product.findOneAndUpdate(
            { batchNumber },
            { ...productData, lastSynced: new Date() },
            { new: true, upsert: true }
        );

        res.status(200).json(product);
    } catch (error) {
        console.error('Error syncing product:', error);
        res.status(500).json({ message: 'Server error during sync', error: error.message });
    }
});

// @route   GET /api/products/batch/:batchNumber
// @desc    Get product by batch number
router.get('/batch/:batchNumber', async (req, res) => {
    try {
        const product = await Product.findOne({ batchNumber: req.params.batchNumber });

        if (!product) {
            return res.status(404).json({ message: `Product with batch number "${req.params.batchNumber}" not found` });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/health
// @desc    Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

module.exports = router;
