// Contract configuration
// Update this address after deploying the contract
// You can find the deployed address in the Hardhat console output or deployment artifacts

// Default to localhost deployment address
// After deploying with: npx hardhat ignition deploy ignition/modules/deploy.js --network localhost
// Update this with the actual deployed address
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Network configuration
export const NETWORK_CONFIG = {
	chainId: 31337, // Hardhat local network
	chainName: 'Hardhat Local',
	rpcUrl: 'http://127.0.0.1:8545',
};

