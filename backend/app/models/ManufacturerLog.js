const mongoose = require('mongoose');

const manufacturerLogSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true },
    productId: { type: String, required: true },
    userAddress: { type: String, index: true }, // wallet address of the submitter
    drugName: { type: String, required: true },
    manufacturerName: { type: String, required: true },
    manufacturingDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    ingredients: String,
    quantity: String,
    unit: String,
    licenseNumber: String,
    qualityGrade: String,
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ManufacturerLog', manufacturerLogSchema, 'manufacturerlog');
