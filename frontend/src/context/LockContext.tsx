/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet } from '@/utils/web3Config';
import { deposit, withdraw, getBalance, getUnlockTime } from '@/utils/lockContract';

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
        formatDate
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