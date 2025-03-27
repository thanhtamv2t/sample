import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Define the ERC721 interface we need
const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)"
];

// Create the wallet context
interface WalletContextType {
    provider: ethers.providers.Web3Provider | null;
    account: string | null;
    isConnected: boolean;
    connecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    getERC721Balance: (contractAddress: string, ownerAddress?: string) => Promise<number>;
}

const WalletContext = createContext<WalletContextType>({
    provider: null,
    account: null,
    isConnected: false,
    connecting: false,
    connectWallet: async () => {},
    disconnectWallet: () => {},
    getERC721Balance: async () => 0,
});

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(false);

    const connectWallet = async () => {
        if (!window.ethereum) {
            console.error("No ethereum wallet found. Please install MetaMask.");
            return;
        }

        try {
            setConnecting(true);
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
            
            setProvider(ethersProvider);
            setAccount(accounts[0]);
            setIsConnected(true);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        } finally {
            setConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setProvider(null);
        setAccount(null);
        setIsConnected(false);
    };

    const getERC721Balance = async (contractAddress: string, ownerAddress?: string): Promise<number> => {
        if (!provider || (!ownerAddress && !account)) {
            throw new Error("Wallet not connected or no owner address provided");
        }
        
        try {
            const contract = new ethers.Contract(
                contractAddress,
                ERC721_ABI,
                provider
            );
            
            const address = ownerAddress || account;
            const balance = await contract.balanceOf(address);
            
            // Convert BigNumber to regular number
            return balance.toNumber();
        } catch (error) {
            console.error("Error getting ERC721 balance:", error);
            throw error;
        }
    };

    useEffect(() => {
        // Handle account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    return (
        <WalletContext.Provider value={{
            provider,
            account,
            isConnected,
            connecting,
            connectWallet,
            disconnectWallet,
            getERC721Balance
        }}>
            {children}
        </WalletContext.Provider>
    );
};

// Hook for using the wallet context
export const useWallet = () => useContext(WalletContext);

export default WalletProvider;