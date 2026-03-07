import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { getProductByBatch, checkApiHealth, syncProduct } from '../services/api';
import BatchStatusTracker from '../components/BatchStatusTracker';

interface ProductInfo {
    name: string;
    holder: string;
    stage: number;
    updatesCount: number;
    // Medicine details
    drugName?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    quantity?: string;
    unit?: string;
    ingredients?: string;
    manufacturerName?: string;
    licenseNumber?: string;
    qualityGrade?: string;
    // Supplier details
    supplierName?: string;
    supplyDate?: string;
    source?: string;
    qualityCertificate?: string;
    storageConditions?: string;
    contactPerson?: string;
    phoneNumber?: string;
    // Distributor details
    dispatchDate?: string;
    packages?: string;
    carrier?: string;
    // Retailer details
    invoiceNumber?: string;
    quantitySold?: string;
    // Logistics details
    vehicleId?: string;
    pickedUpFrom?: string;
    deliveredTo?: string;
    buyerName?: string;
    saleDate?: string;
    destinationCenter?: string;
    pickupLocation?: string;
    dropLocation?: string;
}

interface UpdateInfo {
    updater: string;
    role: number;
    timestamp: bigint;
    note: string;
}

const STAGE_NAMES = ['Created', 'Manufactured', 'WithDistributor', 'InTransport', 'WithWholesaler', 'WithRetailer', 'Sold'];
const ROLE_NAMES = ['None', 'Supplier', 'Manufacturer', 'Distributor', 'Transporter', 'Wholesaler', 'Retailer'];

const MedicineDetails: React.FC = () => {
    const { batchId: rawBatchId } = useParams<{ batchId: string }>();
    const batchId = rawBatchId ? decodeURIComponent(rawBatchId) : null;
    const { contract, isConnected, connectWallet, account } = useWeb3();

    const [isLoading, setIsLoading] = useState(true);
    const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
    const [history, setHistory] = useState<UpdateInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'database' | 'blockchain' | null>(null);
    const [apiAvailable, setApiAvailable] = useState<boolean>(false);

    useEffect(() => {
        if (batchId) {
            fetchProductData();
        } else {
            setError('No batch ID provided');
            setIsLoading(false);
        }
    }, [batchId, contract, isConnected]);

    const fetchProductData = async () => {
        if (!batchId) return;

        setIsLoading(true);
        setError(null);
        setApiAvailable(false);

        try {
            // Check API health first
            const apiHealth = await checkApiHealth();
            setApiAvailable(apiHealth);

            // Try fetching from database first
            if (apiHealth) {
                try {
                    const dbProduct = await getProductByBatch(batchId);

                    setProductInfo({
                        holder: dbProduct.currentHolder, // Map currentHolder to holder
                        ...dbProduct
                    });

                    // Convert history
                    const historyArray: UpdateInfo[] = dbProduct.history.map((update: any) => ({
                        updater: update.updater,
                        role: update.role,
                        timestamp: BigInt(update.timestamp),
                        note: update.note
                    }));

                    setHistory(historyArray.reverse());
                    setDataSource('database');
                    setIsLoading(false);
                    return;
                } catch (dbErr) {
                    console.log('Not found in DB, trying blockchain...');
                }
            }

            // Fallback to blockchain
            if (!isConnected || !contract) {
                try {
                    await connectWallet();
                    return;
                } catch (err: any) {
                    setError(err.message || 'Please connect wallet');
                    setIsLoading(false);
                    return;
                }
            }

            // Check if contract is deployed at the address
            const provider = contract.runner?.provider;
            if (provider) {
                const code = await provider.getCode(await contract.getAddress());
                if (code === '0x' || code === '0x0') {
                    setError('Pharma Supply Chain contract not found at the configured address. Please ensure it is deployed on the current network.');
                    setIsLoading(false);
                    return;
                }
            }

            const productId = ethers.id(batchId);
            const [name, holder, stage, updatesCount] = await contract.getProduct(productId);

            // Extract details from history
            const historyLength = await contract.getHistoryLength(productId);
            const historyArray: UpdateInfo[] = [];
            let medicineDetails: any = {};

            for (let i = 0; i < Number(historyLength); i++) {
                const [updater, role, timestamp, note] = await contract.getUpdate(productId, i);
                historyArray.push({ updater, role: Number(role), timestamp, note });

                if (Number(role) === 2) { // Manufacturer
                    try {
                        medicineDetails = JSON.parse(note);
                    } catch (e) { }
                }
            }

            setProductInfo({
                name,
                holder,
                stage: Number(stage),
                updatesCount: Number(updatesCount),
                ...medicineDetails
            });
            setHistory(historyArray.reverse());
            setDataSource('blockchain');

            // Sync to DB if possible
            if (apiHealth) {
                try {
                    await syncProduct({
                        batchNumber: batchId,
                        productId: productId,
                        name,
                        currentHolder: holder,
                        stage: Number(stage),
                        history: historyArray.map(h => ({
                            updater: h.updater,
                            role: h.role,
                            timestamp: Number(h.timestamp),
                            note: h.note
                        })),
                        exists: true,
                        ...medicineDetails
                    });
                } catch (e) {
                    console.error("Background sync failed", e);
                }
            }

        } catch (err: any) {
            console.error(err);
            if (err.code === 'BAD_DATA') {
                setError('Could not read product data. This might happen if the product doesn\'t exist or the contract address is incorrect.');
            } else if (err.message && err.message.includes('Product not found')) {
                setError(`Medicine with batch number "${batchId}" was not found in our database or on the blockchain.`);
            } else {
                setError(err.reason || err.message || 'Product not found');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleString();

    return (
        <div className="min-h-screen py-12 px-4 transition-colors duration-300" style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-brand-green">Medicine</span> Details
                        </h1>
                        <p className="text-white/70">Batch Number: <span className="font-mono text-brand-green">{batchId}</span></p>
                    </div>
                    {dataSource && (
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${dataSource === 'database'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                                : 'bg-purple-500/10 border-purple-500 text-purple-500'
                                }`}>
                                Source: {dataSource === 'database' ? 'Database' : 'Blockchain'}
                            </span>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p>Loading medicine details...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 border border-red-500 p-6 rounded-xl text-center">
                        <p className="text-red-500 font-bold mb-2">Error Loading Details</p>
                        <p className="text-white/70">{error}</p>
                    </div>
                )}

                {!isLoading && productInfo && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Medicine Identity Card */}
                            <div className="bg-[#111] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="text-9xl">💊</span>
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-white mb-1">{productInfo.drugName || productInfo.name}</h2>
                                    <p className="text-brand-green mb-6">{productInfo.manufacturerName || 'Unknown Manufacturer'}</p>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Manufacturing Date</p>
                                            <p className="text-lg font-semibold">{productInfo.manufacturingDate || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Expiry Date</p>
                                            <p className={`text-lg font-semibold ${productInfo.expiryDate ? 'text-red-400' : ''}`}>{productInfo.expiryDate || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Quantity</p>
                                            <p className="text-lg font-semibold">{productInfo.quantity} {productInfo.unit}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Quality Grade</p>
                                            <p className="text-lg font-semibold text-brand-green">{productInfo.qualityGrade || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {productInfo.ingredients && (
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Active Ingredients</p>
                                            <p className="text-white/90 leading-relaxed">{productInfo.ingredients}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Batch Journey */}
                            <div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6">
                                <h3 className="text-xl font-semibold mb-6 flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center mr-3 text-sm">🚚</span>
                                    Batch Journey
                                </h3>

                                <div className="relative pl-4">
                                    {/* Timeline Connector */}
                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-green/50 to-transparent"></div>

                                    <div className="space-y-8 relative z-10">
                                        {history.map((update, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-5 h-5 rounded-full bg-brand-green border-4 border-[#111] shrink-0 mt-1"></div>
                                                <div className="flex-1 bg-[#0d0d0d] rounded-xl p-4 border border-white/5 hover:border-brand-green/30 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-semibold text-brand-green">{ROLE_NAMES[update.role]} Update</span>
                                                        <span className="text-xs text-white/40">{formatDate(update.timestamp)}</span>
                                                    </div>
                                                    <p className="text-sm text-white/80 mb-2">
                                                        {(() => {
                                                            try {
                                                                const note = JSON.parse(update.note);
                                                                if (note.drugName) return `Manufactured batch of ${note.drugName}`;
                                                                return "Status updated";
                                                            } catch {
                                                                return update.note;
                                                            }
                                                        })()}
                                                    </p>
                                                    <div className="flex items-center text-xs text-white/30 font-mono">
                                                        <span className="mr-2">BY:</span>
                                                        <span className="truncate max-w-[200px]">{update.updater}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Certs */}
                        <div className="space-y-6">
                            {/* Current Status */}
                            <BatchStatusTracker batchNumber={batchId || ''} productId={ethers.id(batchId || '')} />

                            {/* Certifications */}
                            <div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-brand-green/10 rounded-lg border border-brand-green/20">
                                        <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-black font-bold text-xs mr-3">✓</div>
                                        <div>
                                            <p className="text-sm font-semibold text-brand-green">Blockchain Verified</p>
                                            <p className="text-xs text-white/50">Immutable Record</p>
                                        </div>
                                    </div>
                                    {productInfo.qualityGrade === 'A' && (
                                        <div className="flex items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs mr-3">Q</div>
                                            <div>
                                                <p className="text-sm font-semibold text-blue-400">Premium Quality</p>
                                                <p className="text-xs text-white/50">Grade A Certified</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Technical Metadata</h3>
                                <div className="space-y-4 text-xs font-mono">
                                    <div>
                                        <p className="text-white/30 mb-1">BATCH ID</p>
                                        <p className="text-white/70 break-all bg-black/30 p-2 rounded">{batchId}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/30 mb-1">PRODUCT HASH</p>
                                        <p className="text-white/70 break-all bg-black/30 p-2 rounded">{ethers.id(batchId || '')}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/30 mb-1">CONTRACT</p>
                                        <p className="text-white/70 break-all bg-black/30 p-2 rounded">{contract?.target?.toString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicineDetails;
