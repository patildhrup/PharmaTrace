const mongoose = require('mongoose');

const transporterLogSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true },
    productId: { type: String, required: true },
    userAddress: { type: String, index: true }, // wallet address of the submitter
    vehicleId: { type: String, required: true },
    action: { type: String, enum: ['pickup', 'deliver'], required: true },
    location: { type: String, required: true },
    entity: { type: String, required: true }, // pickedUpFrom or deliveredTo
    departureTime: String,
    arrivalTime: String,
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TransporterLog', transporterLogSchema, 'transporterlog');
