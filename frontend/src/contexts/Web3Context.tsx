import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import contractABI from '../config/contractABI.json';
import { CONTRACT_ADDRESS } from '../config/contractConfig';

// =====================================================
// Role → MetaMask Account Mapping
// Addresses derived from the test private keys
// =====================================================
export const ROLE_ACCOUNTS: Record<string, string> = {
	supplier: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
	manufacturer: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
	transport: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
	retailer: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
	distributor: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
};

interface Web3ContextType {
	account: string | null;
	provider: ethers.BrowserProvider | null;
	contract: ethers.Contract | null;
	isConnected: boolean;
	connectWallet: () => Promise<void>;
	connectWalletForRole: (role: string) => Promise<void>;
	disconnectWallet: () => void;
	error: string | null;
	expectedAddress: string | null;
	addressMismatch: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error('useWeb3 must be used within a Web3Provider');
	}
	return context;
};

interface Web3ProviderProps {
	children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
	const [account, setAccount] = useState<string | null>(null);
	const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
	const [contract, setContract] = useState<ethers.Contract | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expectedAddress, setExpectedAddress] = useState<string | null>(null);
	const [addressMismatch, setAddressMismatch] = useState(false);

	const disconnectWallet = useCallback(() => {
		setAccount(null);
		setProvider(null);
		setContract(null);
		setIsConnected(false);
		setError(null);
		setExpectedAddress(null);
		setAddressMismatch(false);
	}, []);

	const setupProvider = useCallback(async (provider: ethers.BrowserProvider, accountAddress: string) => {
		try {
			// Check network (for local Hardhat, chainId should be 31337)
			const network = await provider.getNetwork();
			const expectedChainId = BigInt(31337); // Hardhat local network

			if (network.chainId !== expectedChainId) {
				// Try to switch to local network
				try {
					await window.ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
					});
				} catch (switchError: any) {
					// If network doesn't exist, add it
					if (switchError.code === 4902) {
						try {
							await window.ethereum.request({
								method: 'wallet_addEthereumChain',
								params: [{
									chainId: `0x${expectedChainId.toString(16)}`,
									chainName: 'Hardhat Local',
									nativeCurrency: {
										name: 'ETH',
										symbol: 'ETH',
										decimals: 18,
									},
									rpcUrls: ['http://127.0.0.1:8545'],
									blockExplorerUrls: null, // No block explorer for local network
								}],
							});
						} catch (addError: any) {
							// Suppress parse errors from RPC validation (non-critical)
							if (addError.message && addError.message.includes('Parse error')) {
								console.warn('RPC validation warning (non-critical):', addError.message);
								// Continue anyway - the network might still be added
							} else {
								throw addError;
							}
						}
					} else {
						throw switchError;
					}
				}
			}

			const signer = await provider.getSigner();
			const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

			setProvider(provider);
			setContract(contractInstance);
			setAccount(accountAddress);
			setIsConnected(true);
		} catch (err: any) {
			// Suppress parse errors that occur during RPC validation (non-critical)
			if (err.message && err.message.includes('Parse error')) {
				console.warn('RPC parse error (non-critical, continuing):', err.message);
				// Try to continue with the connection anyway
				try {
					const signer = await provider.getSigner();
					const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
					setProvider(provider);
					setContract(contractInstance);
					setAccount(accountAddress);
					setIsConnected(true);
					return;
				} catch (retryErr: any) {
					console.error('Error setting up provider after retry:', retryErr);
					setError(retryErr.message || 'Failed to setup provider');
					throw retryErr;
				}
			}
			console.error('Error setting up provider:', err);
			setError(err.message || 'Failed to setup provider');
			throw err;
		}
	}, []);

	const checkConnection = useCallback(async () => {
		try {
			if (window.ethereum) {
				const provider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await provider.listAccounts();
				if (accounts.length > 0) {
					await setupProvider(provider, accounts[0].address);
				}
			}
		} catch (err: any) {
			console.error('Error checking connection:', err);
		}
	}, [setupProvider]);

	const handleAccountsChanged = useCallback((accounts: string[]) => {
		if (accounts.length === 0) {
			disconnectWallet();
		} else {
			const newAccount = accounts[0];
			setAccount(newAccount);

			// Check if switched account matches expected role address
			setExpectedAddress(prev => {
				if (prev) {
					setAddressMismatch(newAccount.toLowerCase() !== prev.toLowerCase());
				}
				return prev;
			});
		}
	}, [disconnectWallet]);

	useEffect(() => {
		// Check if already connected
		if (window.ethereum) {
			checkConnection();
			// Listen for account changes
			window.ethereum.on('accountsChanged', handleAccountsChanged);
			// Listen for chain changes
			window.ethereum.on('chainChanged', () => window.location.reload());
		}

		return () => {
			if (window.ethereum) {
				window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
			}
		};
	}, [checkConnection, handleAccountsChanged]);

	const connectWallet = useCallback(async () => {
		try {
			setError(null);
			if (!window.ethereum) {
				throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			// Request account access
			const accounts = await provider.send('eth_requestAccounts', []);

			if (accounts.length === 0) {
				throw new Error('No accounts found. Please unlock MetaMask.');
			}

			await setupProvider(provider, accounts[0]);
		} catch (err: any) {
			console.error('Error connecting wallet:', err);
			setError(err.message || 'Failed to connect wallet');
			throw err;
		}
	}, [setupProvider]);

	/**
	 * Connect wallet for a specific role.
	 * Uses wallet_requestPermissions to let the user pick an account,
	 * then validates it matches the expected role address.
	 */
	const connectWalletForRole = useCallback(async (role: string) => {
		try {
			setError(null);
			setAddressMismatch(false);

			if (!window.ethereum) {
				throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
			}

			const roleExpectedAddress = ROLE_ACCOUNTS[role];
			if (roleExpectedAddress) {
				setExpectedAddress(roleExpectedAddress);
			}

			// Prompt user to pick an account — they must select the correct role account
			await window.ethereum.request({
				method: 'wallet_requestPermissions',
				params: [{ eth_accounts: {} }],
			});

			const web3Provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await web3Provider.send('eth_accounts', []);

			if (!accounts || accounts.length === 0) {
				throw new Error('No account selected. Please select an account in MetaMask.');
			}

			const selectedAccount: string = accounts[0];

			// Validate the selected account matches the expected role address
			if (roleExpectedAddress && selectedAccount.toLowerCase() !== roleExpectedAddress.toLowerCase()) {
				setAddressMismatch(true);
				throw new Error(
					`Wrong account selected.\n\nExpected: ${roleExpectedAddress}\nSelected: ${selectedAccount}\n\nPlease reopen MetaMask and select the correct account for the ${role} role.`
				);
			}

			setAddressMismatch(false);
			await setupProvider(web3Provider, selectedAccount);
		} catch (err: any) {
			console.error('Error connecting wallet for role:', err);
			setError(err.message || 'Failed to connect wallet');
			throw err;
		}
	}, [setupProvider]);

	return (
		<Web3Context.Provider
			value={{
				account,
				provider,
				contract,
				isConnected,
				connectWallet,
				connectWalletForRole,
				disconnectWallet,
				error,
				expectedAddress,
				addressMismatch,
			}}
		>
			{children}
		</Web3Context.Provider>
	);
};

// Extend Window interface for TypeScript
declare global {
	interface Window {
		ethereum?: any;
	}
}
