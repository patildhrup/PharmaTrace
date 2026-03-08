import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, Clock, ExternalLink } from 'lucide-react';
import { Notification, getNotifications, updateNotificationStatus, createNotification } from '../services/api';
import { useWeb3 } from '../contexts/Web3Context';

interface NotificationPanelProps {
    role: string;
    isOpen: boolean;
    onClose: () => void;
    onAcceptPickup?: (batchNumber: string, location: string, fromEntity: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ role, isOpen, onClose, onAcceptPickup }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const { account } = useWeb3();

    const fetchNotifications = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const data = await getNotifications(role);
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            // Poll every 10 seconds while open
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen, role]);

    const handleAccept = async (notif: Notification) => {
        try {
            // Update current notification to accepted
            await updateNotificationStatus(notif._id, 'accepted');

            // If it's a transport role accepting a pickup, notify the sender
            if (role === 'transport' && notif.type === 'pickup_request') {
                await createNotification({
                    recipientRole: notif.senderRole,
                    senderRole: 'transport',
                    senderAddress: account || 'Unknown',
                    message: `Transporter has accepted your pickup request for Batch #${notif.batchNumber}`,
                    type: 'pickup_accepted',
                    batchNumber: notif.batchNumber,
                    sourceLocation: notif.sourceLocation
                });

                // Trigger callback to dashboard to fill form
                if (onAcceptPickup) {
                    onAcceptPickup(notif.batchNumber, notif.sourceLocation || '', notif.senderRole.charAt(0).toUpperCase() + notif.senderRole.slice(1));
                    onClose(); // Close the panel
                }
            }

            // Refresh
            fetchNotifications();
        } catch (err) {
            console.error('Error accepting notification:', err);
        }
    };

    const handleReject = async (notif: Notification) => {
        try {
            await updateNotificationStatus(notif._id, 'rejected');
            fetchNotifications();
        } catch (err) {
            console.error('Error rejecting notification:', err);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await updateNotificationStatus(id, 'read');
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#111] border border-[rgba(34,197,94,0.3)] rounded-xl shadow-2xl z-[100] overflow-hidden animation-fadeIn">
            <div className="p-4 border-b border-[rgba(34,197,94,0.2)] flex justify-between items-center bg-gradient-to-r from-brand-green/10 to-transparent">
                <h3 className="font-bold text-white flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-brand-green" />
                    Notifications
                </h3>
                <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-white/50 text-sm">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-white/30 text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-4 transition-colors hover:bg-white/5 ${notif.status === 'pending' ? 'bg-brand-green/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${notif.type === 'pickup_request' ? 'bg-yellow-500/20 text-yellow-500' :
                                        notif.type === 'pickup_accepted' ? 'bg-brand-green/20 text-brand-green' :
                                            'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {notif.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-white/30 text-[10px] flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-white/90 text-sm mb-1">{notif.message}</p>
                                {notif.sourceLocation && (
                                    <p className="text-brand-green/70 text-[11px] mb-2 flex items-center">
                                        <span className="mr-1">📍</span> {notif.sourceLocation}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-white/40 text-[10px] font-mono">Batch: {notif.batchNumber}</p>
                                    <div className="flex gap-2">
                                        {notif.status === 'pending' && role === 'transport' && notif.type === 'pickup_request' && (
                                            <>
                                                <button
                                                    onClick={() => handleAccept(notif)}
                                                    className="bg-brand-green text-black text-[10px] font-bold px-3 py-1 rounded hover:brightness-110 flex items-center shadow-lg shadow-brand-green/20"
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(notif)}
                                                    className="bg-red-500/20 text-red-500 text-[10px] font-bold px-3 py-1 rounded hover:bg-red-500/30 flex items-center border border-red-500/30"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {notif.status === 'pending' && !(role === 'transport' && notif.type === 'pickup_request') && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif._id)}
                                                className="text-white/50 hover:text-white text-[10px] font-semibold px-2 py-1"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        {notif.status === 'accepted' && (
                                            <span className="text-brand-green text-[10px] font-bold flex items-center">
                                                <Check className="w-3 h-3 mr-1" />
                                                Accepted
                                            </span>
                                        )}
                                        {notif.status === 'rejected' && (
                                            <span className="text-red-500 text-[10px] font-bold flex items-center">
                                                Rejected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                <button
                    onClick={fetchNotifications}
                    className="text-brand-green/70 hover:text-brand-green text-xs font-semibold flex items-center justify-center mx-auto"
                >
                    <Clock className="w-3 h-3 mr-1" />
                    Refresh Feed
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;
