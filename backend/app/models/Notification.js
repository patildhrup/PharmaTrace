const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientRole: {
        type: String,
        required: true,
        enum: ['supplier', 'manufacturer', 'distributor', 'transport', 'retailer', 'consumer']
    },
    senderRole: {
        type: String,
        required: true
    },
    senderAddress: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['pickup_request', 'pickup_accepted', 'info']
    },
    batchNumber: {
        type: String,
        required: true
    },
    sourceLocation: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected', 'read']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
