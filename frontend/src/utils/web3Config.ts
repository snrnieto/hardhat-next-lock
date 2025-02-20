import { ethers } from 'ethers';

export const getEthereumProvider = () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
};

export const connectWallet = async () => {
    try {
        console.log('Connecting to wallet...');
        if (typeof window === 'undefined' || !window.ethereum) {
            console.error('MetaMask not detected');
            throw new Error('Please install MetaMask');
        }

        // First request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
            console.error('No accounts returned from MetaMask');
            throw new Error('No accounts found');
        }


        // Then get the provider and signer
        const provider = getEthereumProvider();
        if (!provider) {
            console.error('Failed to initialize provider');
            throw new Error('Provider initialization failed');
        }

        const signer = await provider.getSigner();
        
        return signer;
    } catch (error) {
        console.error('Detailed wallet connection error:', error);
        throw error;
    }
};

export const getContractInstance = async (contractAddress: string, contractABI: any) => {
    try {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('Please install MetaMask');
        }

        // First initialize provider
        const provider = getEthereumProvider();
        if (!provider) throw new Error('Provider initialization failed');

        // Then request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        // Get signer after account access is granted
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        return contract;
    } catch (error) {
        console.error('Error getting contract instance:', error);
        throw error;
    }
};