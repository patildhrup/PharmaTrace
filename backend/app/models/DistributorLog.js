const mongoose = require('mongoose');

const distributorLogSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true },
    productId: { type: String, required: true },
    userAddress: { type: String, index: true }, // wallet address of the submitter
    destinationCenter: { type: String, required: true },
    dispatchDate: { type: String, required: true },
    packages: { type: String, required: true },
    carrier: String,
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DistributorLog', distributorLogSchema, 'distributorlog');
