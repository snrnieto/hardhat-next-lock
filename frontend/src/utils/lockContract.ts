import { ethers } from 'ethers';
import { getContractInstance } from './web3Config';
import { Lock } from '../../../typechain-types';

// Contract address from the deployment
export const LOCK_CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

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
    return await getContractInstance(LOCK_CONTRACT_ADDRESS, LOCK_CONTRACT_ABI);
};

export const deposit = async (durationInDays: number, amount: string) => {
    try {
        const contract = await getLockContract();
        const tx = await contract.deposit(durationInDays, { value: ethers.parseEther(amount) });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Error in deposit:', error);
        throw error;
    }
};

export const withdraw = async () => {
    try {
        const contract = await getLockContract();
        const tx = await contract.withdraw();
        await tx.wait();
        return tx;
    } catch (error) {
        console.error('Error in withdraw:', error);
        throw error;
    }
};

export const getBalance = async () => {
    try {
        const contract = await getLockContract();
        const balance = await contract.getBalance(); 
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
};

export const getUnlockTime = async () => {
    try {
        const contract = await getLockContract();
        const unlockTime = await contract.getUnlockTime();
        return Number(unlockTime);
    } catch (error) {
        console.error('Error getting unlock time:', error);
        throw error;
    }
};