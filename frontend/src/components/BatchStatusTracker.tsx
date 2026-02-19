import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

interface BatchStatusTrackerProps {
    batchNumber: string;
    productId?: string;
}

interface StatusInfo {
    status: number; // 0: Pending, 1: InProgress, 2: Completed
    currentParticipant: string;
    currentLocation: string;
    stage: number;
}

const STATUS_NAMES = ['Pending', 'In Progress', 'Completed'];
const STAGE_NAMES = ['Created', 'Manufactured', 'WithDistributor', 'InTransport', 'WithRetailer', 'Sold'];
const ROLE_NAMES = ['None', 'Supplier', 'Manufacturer', 'Distributor', 'Transporter', 'Retailer'];

const BatchStatusTracker: React.FC<BatchStatusTrackerProps> = ({ batchNumber, productId }) => {
    const { contract, isConnected } = useWeb3();
    const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchStatusInfo = async () => {
            if (!contract || !batchNumber) return;

            setLoading(true);
            setError(null);

            try {
                const id = productId || ethers.id(batchNumber);
                const [status, currentParticipant, currentLocation, stage] = await contract.getProductStatus(id);

                if (isMounted) {
                    setStatusInfo({
                        status: Number(status),
                        currentParticipant,
                        currentLocation,
                        stage: Number(stage)
                    });
                }
            } catch (err: any) {
                console.error('Error fetching status:', err);
                if (isMounted) {
                    setError('Unable to fetch batch status');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (isConnected && contract && batchNumber) {
            fetchStatusInfo();
        }

        return () => {
            isMounted = false;
        };
    }, [batchNumber, productId, contract, isConnected]);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'bg-yellow-500'; // Pending
            case 1: return 'bg-blue-500'; // In Progress
            case 2: return 'bg-green-500'; // Completed
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: number) => {
        switch (status) {
            case 0: return '⏳'; // Pending
            case 1: return '🚚'; // In Progress
            case 2: return '✅'; // Completed
            default: return '❓';
        }
    };

    const getHumanReadableMessage = () => {
        if (!statusInfo) return '';

        const { status, stage, currentLocation } = statusInfo;

        // Completed states
        if (status === 2) {
            if (stage === 6) return 'Delivered to Consumer';
            if (currentLocation.includes('Manufacturing')) return 'Delivered to Manufacturer';
            if (currentLocation.includes('Distribution')) return 'Delivered to Distributor';
            if (currentLocation.includes('Retail')) return 'Delivered to Retailer';
            return `Delivered to ${currentLocation}`;
        }

        // In Progress
        if (status === 1) {
            return `In Transit - ${currentLocation}`;
        }

        // Pending
        if (status === 0) {
            if (stage === 0) return 'Awaiting Pickup from Supplier';
            if (stage === 1) return 'Awaiting Pickup from Manufacturer';
            if (stage === 2) return 'Awaiting Pickup from Distributor';
            if (stage === 4) return 'Awaiting Pickup from Retailer';
            return `Pending at ${currentLocation}`;
        }

        return 'Status Unknown';
    };

    const getCurrentParticipantRole = () => {
        if (!statusInfo) return 'Unknown';

        const { stage, status } = statusInfo;

        if (status === 1) return 'Transporter'; // In transit

        // Based on stage
        if (stage === 0) return 'Supplier';
        if (stage === 1) return 'Manufacturer';
        if (stage === 2) return 'Distributor';
        if (stage === 3) return 'Transporter';
        if (stage === 4) return 'Retailer';
        if (stage === 6) return 'Consumer';

        return 'Unknown';
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-xl p-6">
                <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mr-3"></div>
                    <p className="text-white/70">Loading batch status...</p>
                </div>
            </div>
        );
    }

    if (error || !statusInfo) {
        return (
            <div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-red-500/30 rounded-xl p-6">
                <p className="text-red-500">{error || 'Unable to load batch status'}</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
            <h3 className="text-xl font-bold text-brand-green mb-6 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Real-Time Batch Status
            </h3>

            {/* Status Overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Current Status */}
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[rgba(34,197,94,0.2)]">
                    <p className="text-white/70 text-sm mb-2">Current Status</p>
                    <div className="flex items-center">
                        <span className="text-2xl mr-2">{getStatusIcon(statusInfo.status)}</span>
                        <span className={`text-lg font-bold ${statusInfo.status === 0 ? 'text-yellow-500' :
                            statusInfo.status === 1 ? 'text-blue-500' :
                                'text-green-500'
                            }`}>
                            {STATUS_NAMES[statusInfo.status]}
                        </span>
                    </div>
                </div>

                {/* Current Participant */}
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[rgba(34,197,94,0.2)]">
                    <p className="text-white/70 text-sm mb-2">Current Participant</p>
                    <p className="text-lg font-bold text-brand-green">{getCurrentParticipantRole()}</p>
                </div>

                {/* Current Stage */}
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[rgba(34,197,94,0.2)]">
                    <p className="text-white/70 text-sm mb-2">Supply Chain Stage</p>
                    <p className="text-lg font-bold text-white">{STAGE_NAMES[statusInfo.stage]}</p>
                </div>
            </div>

            {/* Human Readable Message */}
            <div className="bg-gradient-to-r from-brand-green/20 to-brand-blue/20 border border-brand-green/30 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <span className={`flex h-3 w-3 rounded-full ${getStatusColor(statusInfo.status)} mr-3 ${statusInfo.status === 1 ? 'animate-pulse' : ''}`}></span>
                    <p className="text-white font-semibold text-lg">{getHumanReadableMessage()}</p>
                </div>
            </div>

            {/* Location Info */}
            <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[rgba(34,197,94,0.2)]">
                <p className="text-white/70 text-sm mb-2">📍 Current Location</p>
                <p className="text-white font-semibold">{statusInfo.currentLocation}</p>
                <p className="text-white/50 text-xs mt-2 break-all">
                    Participant Address: {statusInfo.currentParticipant.substring(0, 10)}...{statusInfo.currentParticipant.substring(statusInfo.currentParticipant.length - 8)}
                </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
                <p className="text-white/70 text-sm mb-3">Supply Chain Progress</p>
                <div className="flex items-center justify-between">
                    {['Supplier', 'Manufacturer', 'Distributor', 'Retailer', 'Consumer'].map((role, index) => {
                        const isActive = statusInfo.stage >= index * 2;
                        const isCurrent = getCurrentParticipantRole() === role;

                        return (
                            <div key={role} className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                                    ? 'bg-brand-green border-brand-green scale-110'
                                    : isActive
                                        ? 'bg-brand-green/50 border-brand-green/50'
                                        : 'bg-gray-700 border-gray-600'
                                    }`}>
                                    {isCurrent && <span className="animate-pulse">●</span>}
                                    {!isCurrent && isActive && '✓'}
                                </div>
                                <p className={`text-xs mt-2 text-center ${isCurrent ? 'text-brand-green font-bold' : isActive ? 'text-white/70' : 'text-white/30'}`}>
                                    {role}
                                </p>
                            </div>
                        );
                    })}
                </div>
                <div className="relative mt-2">
                    <div className="h-1 bg-gray-700 rounded-full">
                        <div
                            className="h-1 bg-brand-green rounded-full transition-all duration-500"
                            style={{ width: `${(statusInfo.stage / 6) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchStatusTracker;
