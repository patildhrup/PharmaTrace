import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct, createNotification } from '../services/api';
import { Check, Truck } from 'lucide-react';

interface ConfirmDeliveryProps {
    role: 'manufacturer' | 'distributor' | 'retailer';
}

const ConfirmDelivery: React.FC<ConfirmDeliveryProps> = ({ role }) => {
    const { contract, isConnected, connectWallet, account } = useWeb3();
    const [batchNumber, setBatchNumber] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchNumber || !location) return;

        if (!isConnected || !contract) {
            await connectWallet();
            return;
        }

        setIsSubmitting(true);
        setStatus('idle');

        try {
            const productId = ethers.id(batchNumber);
            const note = `Delivery confirmed by ${role} at ${location}`;

            // 1. Blockchain Call: confirmDelivery
            const tx = await contract.confirmDelivery(productId, location, note);
            await tx.wait();

            // 2. Sync with database
            try {
                const [name, holder, stage] = await contract.getProduct(productId);
                const historyLength = await contract.getHistoryLength(productId);
                let historyArray = [];
                for (let i = 0; i < Number(historyLength); i++) {
                    const [updater, roleIdx, timestamp, updateNote] = await contract.getUpdate(productId, i);
                    historyArray.push({ updater, role: Number(roleIdx), timestamp: Number(timestamp), note: updateNote });
                }

                await syncProduct({
                    batchNumber: batchNumber,
                    productId: productId,
                    name: name,
                    currentHolder: holder,
                    stage: Number(stage),
                    history: historyArray,
                    exists: true,
                    txHash: tx.hash
                } as any);
            } catch (syncErr) {
                console.error('Failed to sync delivery to DB:', syncErr);
            }

            // 3. Send notification to transporter
            try {
                await createNotification({
                    recipientRole: 'transport',
                    senderRole: role,
                    senderAddress: account || 'Unknown',
                    message: `Delivery successfully confirmed for Batch #${batchNumber} at ${location}. Thank you!`,
                    type: 'info',
                    batchNumber: batchNumber
                });
            } catch (notifErr) {
                console.error('Failed to notify transporter:', notifErr);
            }

            // Record to local Recent Activities
            const newTask = {
                id: Date.now().toString(),
                type: 'shipment' as const,
                title: `Delivery Confirmed: #${batchNumber}`,
                description: `Confirmed receipt of batch at ${location} for role ${role}`,
                status: 'completed' as const,
                user: role.charAt(0).toUpperCase() + role.slice(1),
                details: `Batch: ${batchNumber} | Location: ${location} | TX: ${tx.hash.substring(0, 10)}...`,
                timestamp: new Date().toISOString()
            };

            const existingTasks = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
            localStorage.setItem('pharmaTasks', JSON.stringify([newTask, ...existingTasks]));

            setStatus('success');
            setBatchNumber('');
            setLocation('');
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err: any) {
            console.error('Delivery confirmation error:', err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to confirm delivery. Make sure the batch is in transit.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 mt-8 animation-fadeInUp">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-brand-green/20 rounded-lg flex items-center justify-center mr-4">
                    <Truck className="text-brand-green w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Confirm Delivery Arrival</h3>
                    <p className="text-white/50 text-xs">Acknowledge receipt of a batch from transporter</p>
                </div>
            </div>

            {status === 'success' && (
                <div className="mb-6 p-4 bg-brand-green/20 border border-brand-green rounded-xl flex items-center gap-3 animation-fadeIn">
                    <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-black">
                        <Check className="w-5 h-5" />
                    </div>
                    <p className="text-brand-green text-sm font-medium">Delivery confirmed and transporter notified!</p>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl animation-fadeIn">
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs mb-1 text-white/70">Batch Number *</label>
                        <input
                            type="text"
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 text-white focus:border-brand-green"
                            placeholder="PCM-2024-001"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs mb-1 text-white/70">Receiving Location *</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 text-white focus:border-brand-green"
                            placeholder="Current Facility Location"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-brand-green text-black font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-brand-green/10 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Confirming...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Confirm Receipt & Notify Transporter
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ConfirmDelivery;
