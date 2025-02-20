'use client';

import { useState, useEffect } from 'react';
import { useLock } from '@/context/LockContext';

export default function Navbar() {
    const { connected ,walletBalance} = useLock();

    const truncateAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getAddressLetters = (address: string) => {
        if (!address) return '';
        return address.slice(2, 4).toUpperCase();
    };

    const [address, setAddress] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
            setAddress(window.ethereum.selectedAddress);
        }
    }, []);


    return (
        <nav className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md border-b border-purple-500/20 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            ETH Lock
                        </span>
                    </div>
                    {connected && (
                        <div className="flex items-center space-x-4">
                            <div className="text-gray-300">
                                <span title={
                                    walletBalance
                                } className="font-mono text-purple-400 whitespace-nowrap">{walletBalance.slice(0,10)} ETH</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                    {getAddressLetters(address)}
                                </div>
                                <span className="text-gray-300 font-mono">
                                    {truncateAddress(address)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}