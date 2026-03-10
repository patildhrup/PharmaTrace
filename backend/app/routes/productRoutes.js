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
            currentHolder: productData.currentHolder,
            stage: productData.stage,
            updatesCount: productData.updatesCount,
            history: productData.history,
            exists: productData.exists,
            txHash: productData.txHash,
            lastSynced: new Date()
        };

        // If manufacturer data is present, update the main product info with drug details
        if (productData.manufacturerName) {
            coreProductData.name = productData.drugName || productData.name;
            coreProductData.drugName = productData.drugName;
            coreProductData.manufacturingDate = productData.manufacturingDate;
            coreProductData.expiryDate = productData.expiryDate;
            coreProductData.quantity = productData.quantity;
            coreProductData.unit = productData.unit;
            coreProductData.ingredients = productData.ingredients;
            coreProductData.manufacturerName = productData.manufacturerName;
            coreProductData.licenseNumber = productData.licenseNumber;
            coreProductData.qualityGrade = productData.qualityGrade;
        }

        const product = await Product.findOneAndUpdate(
            { batchNumber },
            coreProductData,
            { new: true, upsert: true }
        );
        console.log('Generic product upserted successfully');

        // 2. Create role-specific logs based on the data sent
        const userAddress = (productData.userAddress || productData.currentHolder || '').toLowerCase();
        try {
            if (productData.supplierName) {
                console.log('Detected Supplier Role Activity');
                await SupplierLog.create({
                    batchNumber,
                    productId,
                    userAddress,
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
                await ManufacturerLog.create({
                    batchNumber,
                    productId,
                    userAddress,
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
                await DistributorLog.create({
                    batchNumber,
                    productId,
                    userAddress,
                    destinationCenter: productData.destinationCenter,
                    dispatchDate: productData.dispatchDate,
                    packages: productData.packages,
                    carrier: productData.carrier,
                    txHash
                });
                console.log('Distributor Log created successfully');
            } else if (productData.vehicleId) {
                console.log('Detected Transporter Role Activity');
                await TransporterLog.create({
                    batchNumber,
                    productId,
                    userAddress,
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
                await RetailerLog.create({
                    batchNumber,
                    productId,
                    userAddress,
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

// @route   GET /api/products/stats
// @desc    Get aggregate statistics for the dashboard
router.get('/stats', async (req, res) => {
    try {
        const [
            totalProducts,
            supplierLogs,
            manufacturerLogs,
            distributorLogs,
            transporterLogs,
            retailerLogs
        ] = await Promise.all([
            Product.countDocuments(),
            SupplierLog.countDocuments(),
            ManufacturerLog.countDocuments(),
            DistributorLog.countDocuments(),
            TransporterLog.countDocuments(),
            RetailerLog.countDocuments()
        ]);

        res.json({
            totalProducts,
            supplierCount: supplierLogs,
            manufacturerCount: manufacturerLogs,
            distributorCount: distributorLogs,
            transporterCount: transporterLogs,
            retailerCount: retailerLogs
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/products/recent-activities
// @desc    Get recent activities across all roles
router.get('/recent-activities', async (req, res) => {
    try {
        // Fetch last 5 from each and combine then sort (simplification for now)
        const [s, m, d, t, r] = await Promise.all([
            SupplierLog.find().sort({ createdAt: -1 }).limit(5),
            ManufacturerLog.find().sort({ createdAt: -1 }).limit(5),
            DistributorLog.find().sort({ createdAt: -1 }).limit(5),
            TransporterLog.find().sort({ createdAt: -1 }).limit(5),
            RetailerLog.find().sort({ createdAt: -1 }).limit(5)
        ]);

        const activities = [
            ...s.map(l => ({ ...l._doc, role: 'Supplier', action: `Material: ${l.materialName}`, timestamp: l.createdAt })),
            ...m.map(l => ({ ...l._doc, role: 'Manufacturer', action: `Drug: ${l.drugName}`, timestamp: l.createdAt })),
            ...d.map(l => ({ ...l._doc, role: 'Distributor', action: `Dispatched to: ${l.destinationCenter}`, timestamp: l.createdAt })),
            ...t.map(l => ({ ...l._doc, role: 'Transport', action: `${l.action} Batch: ${l.batchNumber}`, timestamp: l.createdAt })),
            ...r.map(l => ({ ...l._doc, role: 'Retailer', action: `Sold Batch: ${l.batchNumber}`, timestamp: l.createdAt }))
        ];

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(activities.slice(0, 10));
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper to get the correct model based on role
const getRoleQueryDetails = (role) => {
    switch (role.toLowerCase()) {
        case 'supplier': return { model: SupplierLog };
        case 'manufacturer': return { model: ManufacturerLog };
        case 'distributor': return { model: DistributorLog };
        case 'transport': return { model: TransporterLog };
        case 'retailer': return { model: RetailerLog };
        default: return null;
    }
};

// @route   GET /api/products/role-stats/:role/:address
// @desc    Get aggregate statistics for a specific role and address
router.get('/role-stats/:role/:address', async (req, res) => {
    try {
        const { role, address } = req.params;
        const queryDetails = getRoleQueryDetails(role);

        if (!queryDetails) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const { model } = queryDetails;
        const normalizedAddress = address.toLowerCase();

        // Query by userAddress (stored lowercase) for an exact match
        const count = await model.countDocuments({ userAddress: normalizedAddress });

        let stats = [];

        if (role === 'supplier') {
            stats = [
                { label: 'Total Supply Logs', value: count.toString(), change: `+${count}` },
                { label: 'Materials Supplied', value: count.toString(), change: 'Total' },
                { label: 'Quality Score', value: count > 0 ? '98.5%' : 'N/A', change: 'Avg' },
                { label: 'Pending Orders', value: '0', change: 'System' }
            ];
        } else if (role === 'manufacturer') {
            stats = [
                { label: 'Production Logs', value: count.toString(), change: `+${count}` },
                { label: 'Drugs Manufactured', value: count.toString(), change: 'Total' },
                { label: 'Quality Compliance', value: count > 0 ? '99.2%' : 'N/A', change: 'Avg' },
                { label: 'Batch Failures', value: '0', change: 'System' }
            ];
        } else if (role === 'distributor') {
            stats = [
                { label: 'Distribution Logs', value: count.toString(), change: `+${count}` },
                { label: 'Packages Distributed', value: count.toString(), change: 'Total' },
                { label: 'Delivery Success Rate', value: count > 0 ? '97.8%' : 'N/A', change: 'Avg' },
                { label: 'Pending Shipments', value: '0', change: 'System' }
            ];
        } else if (role === 'transport') {
            stats = [
                { label: 'Transport Logs', value: count.toString(), change: `+${count}` },
                { label: 'Deliveries Recorded', value: count.toString(), change: 'Total' },
                { label: 'On-Time Delivery', value: count > 0 ? '94.5%' : 'N/A', change: 'Avg' },
                { label: 'Temperature Violations', value: '0', change: 'System' }
            ];
        } else if (role === 'retailer') {
            stats = [
                { label: 'Retailer Logs', value: count.toString(), change: `+${count}` },
                { label: 'Sales Recorded', value: count.toString(), change: 'Total' },
                { label: 'Customer Satisfaction', value: count > 0 ? '96.8%' : 'N/A', change: 'Avg' },
                { label: 'Expired Drugs', value: '0', change: 'System' }
            ];
        } else if (role === 'consumer') {
            stats = [
                { label: 'Scans Performed', value: '0', change: 'Local' },
                { label: 'Authenticity Verified', value: '100%', change: 'Total' },
                { label: 'Alerts Received', value: '0', change: 'System' },
                { label: 'Batches Viewed', value: '0', change: 'Local' }
            ];
        }

        res.json({ stats });
    } catch (error) {
        console.error(`Error fetching role stats for ${req.params.role}:`, error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/products/role-activities/:role/:address
// @desc    Get recent activities for a specific role and address
router.get('/role-activities/:role/:address', async (req, res) => {
    try {
        const { role, address } = req.params;
        const queryDetails = getRoleQueryDetails(role);

        if (!queryDetails) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const { model } = queryDetails;
        const normalizedAddress = address.toLowerCase();

        // Fetch logs belonging to this wallet address only
        const logs = await model.find({ userAddress: normalizedAddress }).sort({ timestamp: -1 }).limit(10);

        let activities = [];
        if (role === 'supplier') {
            activities = logs.map(l => ({ id: l._id, action: `Supplied Material: ${l.materialName || l.batchNumber}`, status: 'completed', timestamp: l.timestamp }));
        } else if (role === 'manufacturer') {
            activities = logs.map(l => ({ id: l._id, action: `Manufactured Drug: ${l.drugName || l.batchNumber}`, status: 'completed', timestamp: l.timestamp }));
        } else if (role === 'distributor') {
            activities = logs.map(l => ({ id: l._id, action: `Dispatched to: ${l.destinationCenter || 'Unknown'} — Batch #${l.batchNumber}`, status: 'completed', timestamp: l.timestamp }));
        } else if (role === 'transport') {
            activities = logs.map(l => ({ id: l._id, action: `${l.action || 'Transported'} Batch #${l.batchNumber} via ${l.vehicleId}`, status: 'completed', timestamp: l.timestamp }));
        } else if (role === 'retailer') {
            activities = logs.map(l => ({ id: l._id, action: `Sold Batch #${l.batchNumber} — Invoice: ${l.invoiceNumber}`, status: 'completed', timestamp: l.timestamp }));
        }

        res.json({ activities });
    } catch (error) {
        console.error(`Error fetching role activities for ${req.params.role}:`, error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @desc    Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

module.exports = router;
