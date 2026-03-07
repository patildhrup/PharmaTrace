const mongoose = require('mongoose');

const supplierLogSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true },
    productId: { type: String, required: true },
    materialName: { type: String, required: true },
    supplierName: { type: String, required: true },
    supplyDate: { type: String, required: true },
    quantity: { type: String, required: true },
    unit: { type: String, required: true },
    source: String,
    qualityCertificate: String,
    storageConditions: String,
    contactPerson: String,
    phoneNumber: String,
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupplierLog', supplierLogSchema, 'supplierlog');
