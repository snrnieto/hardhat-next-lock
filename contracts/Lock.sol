// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Lock {
    mapping(address => uint256) private balances;
    mapping(address => uint256) private lockTime;

    event Deposit(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit(uint256 _lockDurationInDays) external payable {
        require(msg.value > 0, "Must deposit some amount");
        require(_lockDurationInDays > 0, "Lock duration must be greater than 0");
        
        if (balances[msg.sender] == 0) {
            // Set the lock time only for new deposits
            lockTime[msg.sender] = block.timestamp + (_lockDurationInDays * 1 days);
        }
        // Add the new deposit to the existing balance
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, lockTime[msg.sender]);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        require(block.timestamp >= lockTime[msg.sender], "Funds are still locked");
        
        balances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getUnlockTime() external view returns (uint256) {
        return lockTime[msg.sender];
    }
}
