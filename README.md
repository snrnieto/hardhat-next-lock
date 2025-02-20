
# Hardhat Next.js Lock Project

This project demonstrates a basic Ethereum smart contract integration with a Next.js frontend. It includes a Lock contract where users can deposit ETH and lock it for a specified duration.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## Project Setup

1. Clone the repository and install dependencies:
```shell
git clone <repository-url>
cd hardhat-next-lock
npm install
cd frontend
npm install
cd ..
```

2. Create a `.env` file in the root directory with your network configurations:
```
ALCHEMY_API_KEY_SEPOLIA=your_alchemy_sepolia_api_key
ALCHEMY_API_KEY_MUMBAI=your_alchemy_mumbai_api_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## Available Commands

### Smart Contract Development

```shell
npx hardhat test
```
Runs the test suite for the Lock smart contract. The tests verify deposit functionality, withdrawal mechanisms, and balance management.

```shell
npx hardhat node
```
Starts a local Hardhat network for development. This creates a blockchain environment on your machine with pre-funded accounts for testing.

```shell
npx hardhat compile
```
Compiles the smart contracts and generates the necessary artifacts and TypeScript types.

```shell
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```
Deploys the Lock contract to your local Hardhat network using Hardhat Ignition. This deployment system ensures reliable and reproducible deployments.

```shell
npx hardhat run scripts/deploy.ts --network sepolia
```
Deploys the Lock contract to the Sepolia testnet. Make sure you have ETH in your wallet on Sepolia and have configured your `.env` file.

### Frontend Development

```shell
cd frontend
npm run dev
```
Starts the Next.js development server for the frontend application. Once running, open [http://localhost:3000](http://localhost:3000) in your browser to interact with the dApp.

## Project Structure

- `/contracts`: Contains the Solidity smart contracts
- `/test`: Contains the test files for smart contracts
- `/frontend`: Contains the Next.js frontend application
- `/ignition`: Contains deployment configurations using Hardhat Ignition

## Networks

The project is configured to work with:
- Local Hardhat Network (for development)
- Sepolia Testnet (Ethereum)
- Mumbai Testnet (Polygon)

Make sure to have test tokens (ETH for Sepolia, MATIC for Mumbai) before deploying to testnets.

## Support

If you have any questions or need help, please open an issue in the repository.
