const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    updater: { type: String, required: true },
    role: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    note: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    currentHolder: { type: String, required: true },
    stage: { type: Number, required: true },
    updatesCount: { type: Number, required: true },
    history: [updateSchema],
    exists: { type: Boolean, default: true },

    // Additional medicine details
    drugName: String,
    manufacturingDate: String,
    expiryDate: String,
    quantity: String,
    unit: String,
    ingredients: String,
    manufacturerName: String,
    licenseNumber: String,
    qualityGrade: String,

    // Transporter specific
    pickedUpFrom: String,
    deliveredTo: String,
    vehicleId: String,
    departureTime: String,
    pickupLocation: String,
    dropLocation: String,

    // Supplier specific
    supplierName: String,
    supplyDate: String,
    source: String,
    qualityCertificate: String,
    storageConditions: String,
    contactPerson: String,
    phoneNumber: String,

    // Distributor specific
    destinationCenter: String,
    dispatchDate: String,
    packages: String,
    carrier: String,

    // Retailer specific
    invoiceNumber: String,
    buyerName: String,
    saleDate: String,
    quantitySold: String,

    // Sync metadata
    txHash: String,
    lastSynced: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for faster lookups
productSchema.index({ productId: 1 });

module.exports = mongoose.model('Product', productSchema);
