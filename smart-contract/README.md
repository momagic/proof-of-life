# LIFE Smart Contracts

This repository contains the smart contracts for the LIFE ecosystem, a gamified social economy built on World Chain.

## 📋 Quick Overview

The LIFE ecosystem is a **sybil-resistant virtual economy** that leverages World Chain's unique human-verification capabilities. Only users with orb-verified World ID can participate, creating a fair and sustainable social economy.

### Key Features
- 🌍 **World ID Integration**: Orb verification for sybil resistance
- 💰 **Dual Token Economy**: LIFE and WLD token support
- 🏠 **Virtual Real Estate**: Property NFTs with yield generation
- 🏆 **Social Competition**: Leaderboards and status systems
- 🎁 **Daily Rewards**: Sustainable engagement incentives

## 📚 Documentation

- **[📊 Comprehensive Smart Contract Analysis](./docs/SMART_CONTRACT_ANALYSIS.md)** - Detailed technical analysis and architecture overview
- **[🌍 World Chain Setup Guide](./docs/WORLDCHAIN_SETUP.md)** - Deployment and testing instructions
- **[🚀 Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment process
- **[🔗 Integration Guide](./docs/INTEGRATION.md)** - Frontend integration instructions

## 🏗️ Contract Architecture

- **LIFE.sol**: ERC20 token with World ID integration for proof-of-life verification
- **Economy.sol**: Central marketplace for property and limited edition purchases
- **Property.sol**: ERC721 NFTs representing virtual real estate with yield generation
- **LimitedEdition.sol**: ERC721 NFTs for collectible items and seasonal campaigns
- **PlayerRegistry.sol**: Player data management, leaderboards, and social features

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- World ID verification (for testing)
- World Chain testnet ETH

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Configure your environment variables in .env
```

### Local Development
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### World Chain Deployment
```bash
npx hardhat run scripts/deploy.js --network worldchain
```

## 🧪 Testing

Run the complete test suite:
```bash
npx hardhat test
```

Test specific functionality:
```bash
npx hardhat test test/LIFE.test.js
npx hardhat test test/Economy.test.js
```

## 🔍 Contract Verification

After deployment, verify contracts on World Chain:
```bash
npx hardhat verify --network worldchain <CONTRACT_ADDRESS>
```

## 🌐 Network Information

### World Chain Mainnet
- **Chain ID**: 480
- **RPC URL**: https://worldchain-mainnet.g.alchemy.com/public
- **Explorer**: https://worldscan.org

### Deployed Contracts
See [production-deployment.json](./production-deployment.json) for current mainnet addresses.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.