import { ethers } from 'ethers';
import { getContractInstance } from './web3Config';

// Contract address from the deployment
export const LOCK_CONTRACT_ADDRESS = "0xb103F73A03614f69dC238552bE327e0798cF816E";

// Contract ABI
export const LOCK_CONTRACT_ABI = [
    "function deposit(uint256 _lockDurationInDays) external payable",
    "function withdraw() external",
    "function getBalance() external view returns (uint256)",
    "function getUnlockTime() external view returns (uint256)",
    "event Deposit(address indexed user, uint256 amount, uint256 unlockTime)",
    "event Withdrawal(address indexed user, uint256 amount)"
];

export const getLockContract = async () => {
    if (typeof window === 'undefined') return null;
    return await getContractInstance(LOCK_CONTRACT_ADDRESS, LOCK_CONTRACT_ABI);
};

export const deposit = async (durationInDays: number, amount: string) => {
    if (typeof window === 'undefined') return null;
    try {
        const contract = await getLockContract();
        if (!contract) throw new Error('Contract initialization failed');
        const tx = await contract.deposit(durationInDays, { value: ethers.parseEther(amount) });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Error in deposit:', error);
        throw error;
    }
};

export const withdraw = async () => {
    if (typeof window === 'undefined') return null;
    try {
        const contract = await getLockContract();
        if (!contract) throw new Error('Contract initialization failed');
        const tx = await contract.withdraw();
        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Error in withdraw:', error);
        throw error;
    }
};

export const getBalance = async () => {
    if (typeof window === 'undefined') return '0';
    try {
        const contract = await getLockContract();
        if (!contract) return '0';
        const balance = await contract.getBalance(); 
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
};

export const getUnlockTime = async () => {
    if (typeof window === 'undefined') return 0;
    try {
        const contract = await getLockContract();
        if (!contract) return 0;
        const unlockTime = await contract.getUnlockTime();
        return Number(unlockTime);
    } catch (error) {
        console.error('Error getting unlock time:', error);
        throw error;
    }
};