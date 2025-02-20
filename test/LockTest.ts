import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock Contract", function () {
  async function deployLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy();
    return { lock, owner, otherAccount };
  }

  describe("Deposit", function () {
    it("Should allow depositing ETH with lock duration", async function () {
      const { lock, owner } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 7; // 7 days
      const currentTime = await time.latest();
      const expectedUnlockTime = currentTime + (lockDuration * 24 * 60 * 60);

      const tx = await lock.deposit(lockDuration, { value: depositAmount });
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error("Transaction receipt is null");
      }
      
      const event = receipt.logs[0];
      if (!event) {
        throw new Error("Event log is null");
      }
      
      const decodedEvent = lock.interface.parseLog({ topics: event.topics, data: event.data });
      if (!decodedEvent) {
        throw new Error("Failed to decode event");
      }
      expect(decodedEvent.name).to.equal("Deposit");
      expect(decodedEvent.args[0]).to.equal(owner.address);
      expect(decodedEvent.args[1]).to.equal(depositAmount);
      expect(Number(decodedEvent.args[2])).to.be.closeTo(expectedUnlockTime, 1); // Allow 1 second variation

      const balance = await lock.getBalance();
      expect(balance).to.equal(depositAmount);
    });

    it("Should reject deposit with zero amount", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      await expect(lock.deposit(7, { value: 0 }))
        .to.be.revertedWith("Must deposit some amount");
    });

    it("Should reject deposit with zero lock duration", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      await expect(lock.deposit(0, { value: depositAmount }))
        .to.be.revertedWith("Lock duration must be greater than 0");
    });

    it("Should allow multiple deposits from same address", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      
      await lock.deposit(7, { value: depositAmount });
      await lock.deposit(7, { value: depositAmount });
      
      const balance = await lock.getBalance();
      expect(balance).to.equal(depositAmount * 2n);
    });

    it("Should allow multiple deposits from same address without changing lock time", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 7; // 7 days
      
      // First deposit and get initial unlock time
      const tx1 = await lock.deposit(lockDuration, { value: depositAmount });
      const receipt1 = await tx1.wait();
      const event1 = receipt1!.logs[0];
      const decodedEvent1 = lock.interface.parseLog({ topics: event1.topics, data: event1.data });
      const initialUnlockTime = decodedEvent1!.args[2];
      
      // Second deposit
      const tx2 = await lock.deposit(lockDuration, { value: depositAmount });
      const receipt2 = await tx2.wait();
      const event2 = receipt2!.logs[0];
      const decodedEvent2 = lock.interface.parseLog({ topics: event2.topics, data: event2.data });
      const secondUnlockTime = decodedEvent2!.args[2];
      
      // Verify unlock time hasn't changed
      expect(secondUnlockTime).to.equal(initialUnlockTime);
      
      // Verify total balance
      const balance = await lock.getBalance();
      expect(balance).to.equal(depositAmount * 2n);
    });
  });

  describe("Withdrawal", function () {
    it("Should not allow withdrawal before lock time", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      
      await lock.deposit(7, { value: depositAmount });
      await expect(lock.withdraw()).to.be.revertedWith("Funds are still locked");
    });

    it("Should allow withdrawal after lock time", async function () {
      const { lock, owner } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 7; // 7 days
      
      await lock.deposit(lockDuration, { value: depositAmount });
      
      // Increase time by 7 days
      await time.increase(7 * 24 * 60 * 60);
      
      await expect(lock.withdraw())
        .to.changeEtherBalances(
          [lock, owner],
          [-depositAmount, depositAmount]
        );
    });

    it("Should emit Withdrawal event", async function () {
      const { lock, owner } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      
      await lock.deposit(7, { value: depositAmount });
      await time.increase(7 * 24 * 60 * 60);
      
      await expect(lock.withdraw())
        .to.emit(lock, "Withdrawal")
        .withArgs(owner.address, depositAmount);
    });

    it("Should not allow withdrawal with zero balance", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      await expect(lock.withdraw()).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Balance and Lock Time", function () {
    it("Should return correct balance", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      const depositAmount = ethers.parseEther("1.0");
      
      await lock.deposit(7, { value: depositAmount });
      const balance = await lock.getBalance();
      expect(balance).to.equal(depositAmount);
    });

    it("Should return zero balance for new accounts", async function () {
      const { lock, otherAccount } = await loadFixture(deployLockFixture);
      const balance = await lock.connect(otherAccount).getBalance();
      expect(balance).to.equal(0);
    });
  });
});