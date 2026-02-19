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
  drugName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  quantity?: string;
  unit?: string;
  ingredients?: string;
  manufacturerName?: string;
  licenseNumber?: string;
  qualityGrade?: string;
  lastSynced?: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
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

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
