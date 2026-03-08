const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Post a new notification
router.post('/', async (req, res) => {
    try {
        const { recipientRole, senderRole, senderAddress, message, type, batchNumber } = req.body;

        const newNotification = new Notification({
            recipientRole,
            senderRole,
            senderAddress,
            message,
            type,
            batchNumber
        });

        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ message: 'Server error creating notification' });
    }
});

// Get notifications for a role
router.get('/:role', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientRole: req.params.role })
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// Update notification status (Accept or Mark as Read)
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

module.exports = router;
