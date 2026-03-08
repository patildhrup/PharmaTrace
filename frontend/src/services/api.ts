const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Product {
  _id?: string;
  batchNumber: string;
  productId: string;
  name: string;
  currentHolder: string;
  stage: number;
  updatesCount: number;
  history: Array<{
    updater: string;
    role: number;
    timestamp: number;
    note: string;
  }>;
  exists: boolean;
  lastSynced?: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
  // Logistics details
  vehicleId?: string;
  pickedUpFrom?: string;
  deliveredTo?: string;
  buyerName?: string;
  saleDate?: string;
  destinationCenter?: string;
  pickupLocation?: string;
  dropLocation?: string;
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
  // Additional fields from various forms
  drugName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  quantity?: string;
  unit?: string;
  ingredients?: string;
  manufacturerName?: string;
  licenseNumber?: string;
  qualityGrade?: string;
}

// Get product by batch number
export const getProductByBatch = async (batchNumber: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/batch/${encodeURIComponent(batchNumber)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Product with batch number "${batchNumber}" not found`);
  }
  return response.json();
};

// Check if batch exists
export const checkBatchExists = async (batchNumber: string): Promise<{ exists: boolean; batchNumber: string; product?: any }> => {
  const response = await fetch(`${API_BASE_URL}/batches/exists/${encodeURIComponent(batchNumber)}`);
  if (!response.ok) {
    return { exists: false, batchNumber };
  }
  return response.json();
};

// Create or update product
// Accepts Product fields plus any additional metadata fields
export const syncProduct = async (productData: Partial<Product> & Record<string, any>): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync product');
  }
  return response.json();
};

// Get recent batch numbers
export const getRecentBatches = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/products/recent/batches`);
  if (!response.ok) {
    return [];
  }
  return response.json();
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    return [];
  }
  return response.json();
};

// Notification Interfaces
export interface Notification {
  _id: string;
  recipientRole: string;
  senderRole: string;
  senderAddress: string;
  message: string;
  type: 'pickup_request' | 'pickup_accepted' | 'info';
  batchNumber: string;
  sourceLocation?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'read';
  timestamp: string;
}

// Get notifications for a role
export const getNotifications = async (role: string): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${role}`);
  if (!response.ok) {
    return [];
  }
  return response.json();
};

// Create a notification
export const createNotification = async (notificationData: Partial<Notification>): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create notification');
  }
  return response.json();
};

// Update notification status
export const updateNotificationStatus = async (id: string, status: 'pending' | 'accepted' | 'rejected' | 'read'): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update notification');
  }
  return response.json();
};

// Global Stats for Admin Analysis
export const getGlobalStats = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/products/stats`);
  if (!response.ok) return { totalProducts: 0, supplierCount: 0, manufacturerCount: 0, distributorCount: 0, transporterCount: 0, retailerCount: 0 };
  return response.json();
};

// Global Recent Activities for Admin Analysis
export const getRecentGlobalActivities = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/products/recent-activities`);
  if (!response.ok) return [];
  return response.json();
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
