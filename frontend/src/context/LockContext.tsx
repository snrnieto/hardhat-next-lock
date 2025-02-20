/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet } from '@/utils/web3Config';
import { deposit, withdraw, getBalance, getUnlockTime } from '@/utils/lockContract';
import { ethers } from 'ethers';


interface LockContextType {
    amount: string;
    setAmount: (amount: string) => void;
    duration: string;
    setDuration: (duration: string) => void;
    balance: string;
    unlockTime: number;
    loading: boolean;
    error: string;
    connected: boolean;
    timeLeft: string;
    handleConnect: () => Promise<void>;
    handleDeposit: (e: React.FormEvent) => Promise<void>;
    handleWithdraw: () => Promise<void>;
    formatDate: (timestamp: number) => string;
    walletBalance: string;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export function LockProvider({ children }: { children: ReactNode }) {
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [balance, setBalance] = useState('0');
    const [unlockTime, setUnlockTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [walletBalance, setWalletBalance] = useState('0');
    const address = window.ethereum?.selectedAddress || '';


    const loadContractData = async () => {
        try {
            const balance = await getBalance();
            const unlockTime = await getUnlockTime();
            setBalance(balance);
            setUnlockTime(unlockTime);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleConnect = async () => {
        try {
            await connectWallet();
            setConnected(true);
            await loadContractData();
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setError('Failed to connect wallet');
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const currentDuration = duration.length > 0 ? Number(duration) : 1;
            await deposit(Number(currentDuration), amount);
            await loadContractData();
            setAmount('');
            setDuration('');
        } catch (error: any) {
            console.log('Error depositing funds:', error);
            setError(error.reason || 'Error depositing funds');
        }
        setLoading(false);
    };

    const handleWithdraw = async () => {
        setLoading(true);
        setError('');
        try {
            await withdraw();
            await loadContractData();
        } catch (error: any) {
            console.log('Error withdrawing funds:', error);
            setError(error.reason || 'Error withdrawing funds');
        }
        setLoading(false);
    };

    const formatDate = (timestamp: number) => {
        if (timestamp === 0) return 'No active lock';
        return new Date(timestamp * 1000).toLocaleString();
    };

    const fetchWalletBalance = async () => {
        console.log('Fetching wallet balance...');
        if (window.ethereum && address) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(address);
                setWalletBalance(ethers.formatEther(balance));
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        }
    };

    useEffect(() => {
        loadContractData();
    }, []);

    useEffect(() => {
        if (unlockTime === 0) return;

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const difference = unlockTime - now;

            if (difference <= 0) {
                setTimeLeft('Unlock time reached');
                return;
            }

            const days = Math.floor(difference / (60 * 60 * 24));
            const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((difference % (60 * 60)) / 60);
            const seconds = difference % 60;

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [unlockTime]);

    useEffect(() => {
        const handleAccountsChanged = async () => {
            setConnected(false);
            setBalance('0');
            setUnlockTime(0);
            setTimeLeft('');
            setWalletBalance('0');
            try {
                await connectWallet();
                setConnected(true);
                await loadContractData();
                await fetchWalletBalance();
            } catch (error) {
                console.error('Error reconnecting wallet:', error);
                setError('Failed to connect with new account');
            }
        };

        const handleChainChanged = async () => {
            const chainId = await window.ethereum?.request({ method: 'eth_chainId' });
            if (chainId !== '0xaa36a7') { // Sepolia chainId
                try {
                    await window.ethereum?.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await window.ethereum?.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0xaa36a7',
                                chainName: 'Sepolia',
                                nativeCurrency: {
                                    name: 'SepoliaETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }],
                        });
                    }
                    setError('Please switch to Sepolia network');
                    setConnected(false);
                }
            } else {
                setError('');
                await handleAccountsChanged();
            }
        };

        handleChainChanged();

        // Listen for account and chain changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [address]);

    const value = {
        amount,
        setAmount,
        duration,
        setDuration,
        balance,
        unlockTime,
        loading,
        error,
        connected,
        timeLeft,
        handleConnect,
        handleDeposit,
        handleWithdraw,
        formatDate,
        walletBalance,
    };

    return (
        <LockContext.Provider value={value}>
            {children}
        </LockContext.Provider>
    );
}

export function useLock() {
    const context = useContext(LockContext);
    if (context === undefined) {
        throw new Error('useLock must be used within a LockProvider');
    }
    return context;
}