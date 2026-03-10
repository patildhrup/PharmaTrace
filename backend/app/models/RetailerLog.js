const mongoose = require('mongoose');

const retailerLogSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true },
    productId: { type: String, required: true },
    userAddress: { type: String, index: true }, // wallet address of the submitter
    invoiceNumber: { type: String, required: true },
    buyerName: { type: String, required: true },
    saleDate: { type: String, required: true },
    quantitySold: { type: String, required: true },
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RetailerLog', retailerLogSchema, 'retailerlog');
