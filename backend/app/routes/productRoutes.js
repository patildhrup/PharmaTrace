const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const SupplierLog = require('../models/SupplierLog');
const ManufacturerLog = require('../models/ManufacturerLog');
const DistributorLog = require('../models/DistributorLog');
const TransporterLog = require('../models/TransporterLog');
const RetailerLog = require('../models/RetailerLog');

// @route   POST /api/products
// @desc    Sync product data from blockchain to database and create role-based logs
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        console.log('--- Sync Request Received ---');
        console.log('Payload:', JSON.stringify(productData, null, 2));

        const { batchNumber, productId, txHash } = productData;

        if (!batchNumber) {
            console.error('Missing batch number in payload');
            return res.status(400).json({ message: 'Batch number is required' });
        }

        // 1. Upsert generic product data
        console.log(`Upserting Product: ${batchNumber}`);

        // Define core fields that should stay in the Product collection
        const coreProductData = {
            batchNumber: productData.batchNumber,
            productId: productData.productId,
            name: productData.name,
            currentHolder: productData.currentHolder,
            stage: productData.stage,
            updatesCount: productData.updatesCount,
            history: productData.history,
            exists: productData.exists,
            txHash: productData.txHash,
            lastSynced: new Date()
        };

        const product = await Product.findOneAndUpdate(
            { batchNumber },
            coreProductData,
            { new: true, upsert: true }
        );
        console.log('Generic product upserted successfully');

        // 2. Create role-specific logs based on the data sent
        try {
            if (productData.supplierName) {
                console.log('Detected Supplier Role Activity');
                // Supplier Log
                await SupplierLog.create({
                    batchNumber,
                    productId,
                    materialName: productData.name,
                    supplierName: productData.supplierName,
                    supplyDate: productData.supplyDate,
                    quantity: productData.quantity,
                    unit: productData.unit,
                    source: productData.source,
                    qualityCertificate: productData.qualityCertificate,
                    storageConditions: productData.storageConditions,
                    contactPerson: productData.contactPerson,
                    phoneNumber: productData.phoneNumber,
                    txHash
                });
                console.log('Supplier Log created successfully');
            } else if (productData.manufacturerName) {
                console.log('Detected Manufacturer Role Activity');
                // Manufacturer Log
                await ManufacturerLog.create({
                    batchNumber,
                    productId,
                    drugName: productData.name,
                    manufacturerName: productData.manufacturerName,
                    manufacturingDate: productData.manufacturingDate,
                    expiryDate: productData.expiryDate,
                    ingredients: productData.ingredients,
                    quantity: productData.quantity,
                    unit: productData.unit,
                    licenseNumber: productData.licenseNumber,
                    qualityGrade: productData.qualityGrade,
                    txHash
                });
                console.log('Manufacturer Log created successfully');
            } else if (productData.destinationCenter) {
                console.log('Detected Distributor Role Activity');
                // Distributor Log
                await DistributorLog.create({
                    batchNumber,
                    productId,
                    destinationCenter: productData.destinationCenter,
                    dispatchDate: productData.dispatchDate,
                    packages: productData.packages,
                    carrier: productData.carrier,
                    txHash
                });
                console.log('Distributor Log created successfully');
            } else if (productData.vehicleId) {
                console.log('Detected Transporter Role Activity');
                // Transporter Log
                await TransporterLog.create({
                    batchNumber,
                    productId,
                    vehicleId: productData.vehicleId,
                    action: productData.action || 'pickup',
                    location: productData.pickupLocation || productData.dropLocation,
                    entity: productData.pickedUpFrom || productData.deliveredTo,
                    departureTime: productData.departureTime,
                    arrivalTime: productData.arrivalTime,
                    txHash
                });
                console.log('Transporter Log created successfully');
            } else if (productData.invoiceNumber) {
                console.log('Detected Retailer Role Activity');
                // Retailer Log
                await RetailerLog.create({
                    batchNumber,
                    productId,
                    invoiceNumber: productData.invoiceNumber,
                    buyerName: productData.buyerName,
                    saleDate: productData.saleDate,
                    quantitySold: productData.quantitySold,
                    txHash
                });
                console.log('Retailer Log created successfully');
            } else {
                console.log('No specific role activity detected in payload');
            }
        } catch (logErr) {
            console.error('Error creating role-based log:', logErr.message);
            if (logErr.errors) {
                console.error('Validation Errors:', Object.keys(logErr.errors).map(key => `${key}: ${logErr.errors[key].message}`).join(', '));
            }
        }

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
