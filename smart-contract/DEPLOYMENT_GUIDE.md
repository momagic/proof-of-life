# Proof of Life - Deployment & World Dev Portal Setup Guide

## Overview

This guide provides step-by-step instructions for deploying the new EconomyV2 and PropertyV2 contracts and configuring them in the World Dev Portal for seamless integration with World App's minikit.pay() system.

## Prerequisites

- Node.js and npm installed
- Hardhat development environment
- World App Developer Account
- Testnet/Mainnet ETH for deployment
- Access to World Dev Portal

## Deployment Steps

### 1. Environment Setup

Create a `.env` file in your project root:

```env
# Network Configuration
PRIVATE_KEY=your_deployer_private_key
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Addresses (existing)
LIFE_TOKEN_ADDRESS=0x... # Your existing LIFE token address

# World App Configuration
WORLD_APP_ID=your_world_app_id
WORLD_ID_CONTRACT_ADDRESS=0x... # World ID contract address for your network

# Fee Configuration
TREASURY_ADDRESS=0x... # Address to receive treasury fees
DEV_FEE_ADDRESS=0x... # Address to receive development fees
```

### 2. Hardhat Configuration

Update your `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Testnet
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    // Mainnet
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    // Optimism (recommended for World App)
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    "optimism-sepolia": {
      url: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### 3. Deployment Script

Create `scripts/deploy.js`:

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract addresses from environment
  const LIFE_TOKEN_ADDRESS = process.env.LIFE_TOKEN_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const DEV_FEE_ADDRESS = process.env.DEV_FEE_ADDRESS;
  const WORLD_ID_CONTRACT = process.env.WORLD_ID_CONTRACT_ADDRESS;

  // Deploy PropertyV2 first
  console.log("\n=== Deploying PropertyV2 ===");
  const PropertyV2 = await ethers.getContractFactory("PropertyV2");
  const propertyV2 = await upgrades.deployProxy(
    PropertyV2,
    [
      "Proof of Life Property", // name
      "POLP",                   // symbol
      "https://api.proofoflife.app/metadata/" // baseURI
    ],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );
  await propertyV2.deployed();
  console.log("PropertyV2 deployed to:", propertyV2.address);

  // Deploy EconomyV2
  console.log("\n=== Deploying EconomyV2 ===");
  const EconomyV2 = await ethers.getContractFactory("EconomyV2");
  const economyV2 = await upgrades.deployProxy(
    EconomyV2,
    [
      LIFE_TOKEN_ADDRESS,
      propertyV2.address,
      TREASURY_ADDRESS,
      DEV_FEE_ADDRESS,
      WORLD_ID_CONTRACT
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  await economyV2.deployed();
  console.log("EconomyV2 deployed to:", economyV2.address);

  // Set EconomyV2 as minter in PropertyV2
  console.log("\n=== Configuring Contracts ===");
  await propertyV2.setMinter(economyV2.address, true);
  console.log("EconomyV2 set as minter in PropertyV2");

  // Configure property types in EconomyV2
  const propertyTypes = [
    {
      name: "house",
      baseLifePrice: ethers.utils.parseEther("1000"),
      baseWldPrice: ethers.utils.parseEther("10"),
      incomeRate: 100, // 1% per day
      available: true,
      requiresWorldId: false
    },
    {
      name: "apartment", 
      baseLifePrice: ethers.utils.parseEther("500"),
      baseWldPrice: ethers.utils.parseEther("5"),
      incomeRate: 80,
      available: true,
      requiresWorldId: false
    },
    {
      name: "office",
      baseLifePrice: ethers.utils.parseEther("2000"),
      baseWldPrice: ethers.utils.parseEther("20"),
      incomeRate: 150,
      available: true,
      requiresWorldId: true
    },
    {
      name: "land",
      baseLifePrice: ethers.utils.parseEther("800"),
      baseWldPrice: ethers.utils.parseEther("8"),
      incomeRate: 60,
      available: true,
      requiresWorldId: false
    },
    {
      name: "mansion",
      baseLifePrice: ethers.utils.parseEther("5000"),
      baseWldPrice: ethers.utils.parseEther("50"),
      incomeRate: 200,
      available: true,
      requiresWorldId: true
    }
  ];

  for (const propertyType of propertyTypes) {
    await economyV2.setPropertyPrice(
      propertyType.name,
      propertyType.baseLifePrice,
      propertyType.baseWldPrice,
      propertyType.incomeRate,
      propertyType.available,
      propertyType.requiresWorldId
    );
    console.log(`Configured property type: ${propertyType.name}`);
  }

  // Verify contracts on Etherscan
  console.log("\n=== Contract Verification ===");
  console.log("Run these commands to verify contracts:");
  console.log(`npx hardhat verify --network ${network.name} ${propertyV2.address}`);
  console.log(`npx hardhat verify --network ${network.name} ${economyV2.address}`);

  // Output deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log("PropertyV2:", propertyV2.address);
  console.log("EconomyV2:", economyV2.address);
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PropertyV2: propertyV2.address,
      EconomyV2: economyV2.address,
      LIFE: LIFE_TOKEN_ADDRESS
    },
    configuration: {
      treasury: TREASURY_ADDRESS,
      devFee: DEV_FEE_ADDRESS,
      worldId: WORLD_ID_CONTRACT
    }
  };

  require("fs").writeFileSync(
    `deployment-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployment-${network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy Contracts

```bash
# Deploy to testnet first
npx hardhat run scripts/deploy.js --network optimism-sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network optimism
```

### 5. Verify Contracts

```bash
# Verify PropertyV2
npx hardhat verify --network optimism <PropertyV2_ADDRESS>

# Verify EconomyV2  
npx hardhat verify --network optimism <EconomyV2_ADDRESS>
```

## World Dev Portal Configuration

### 1. Access World Dev Portal

1. Go to [World Dev Portal](https://developer.worldcoin.org/)
2. Sign in with your World ID
3. Navigate to your existing "Proof of Life" app or create a new one

### 2. Configure Whitelisted Payment Addresses

Navigate to **App Settings > Payment Configuration > Whitelisted Payment Addresses**

Add the following addresses:

```
Contract Addresses to Whitelist:
- EconomyV2 Contract: <YOUR_ECONOMYV2_ADDRESS>
- Treasury Address: <YOUR_TREASURY_ADDRESS>
- Dev Fee Address: <YOUR_DEV_FEE_ADDRESS>

Purpose: These addresses will receive WLD payments from minikit.pay()
```

**Configuration Steps:**
1. Click "Add Address"
2. Enter the EconomyV2 contract address
3. Set description: "Main economy contract for property purchases"
4. Set payment limit (recommended: 1000 WLD per transaction)
5. Repeat for treasury and dev fee addresses

### 3. Configure Contract Entrypoints

Navigate to **App Settings > Smart Contracts > Contract Entrypoints**

Add the following entrypoints:

```json
{
  "contract_address": "<YOUR_ECONOMYV2_ADDRESS>",
  "entrypoints": [
    {
      "function_name": "completePayment",
      "function_signature": "completePayment(bytes32)",
      "description": "Complete WLD payment for property purchase",
      "gas_limit": 500000,
      "access_level": "public"
    },
    {
      "function_name": "initiatePayment", 
      "function_signature": "initiatePayment(string,string,string,uint256,bool,string)",
      "description": "Initiate property purchase payment",
      "gas_limit": 300000,
      "access_level": "public"
    },
    {
      "function_name": "purchasePropertyWithLife",
      "function_signature": "purchasePropertyWithLife(string,string,string,uint256,string)",
      "description": "Purchase property with LIFE tokens",
      "gas_limit": 400000,
      "access_level": "public"
    }
  ]
}
```

**Configuration Steps:**
1. Click "Add Contract"
2. Enter EconomyV2 contract address
3. Add each entrypoint with the specified parameters
4. Set appropriate gas limits
5. Enable public access for user transactions

### 4. Configure Permit2 Tokens

Navigate to **App Settings > Tokens > Permit2 Configuration**

Add token configurations:

```json
{
  "tokens": [
    {
      "symbol": "LIFE",
      "contract_address": "<YOUR_LIFE_TOKEN_ADDRESS>",
      "decimals": 18,
      "permit2_enabled": true,
      "max_allowance": "1000000000000000000000000",
      "description": "Proof of Life token for property purchases"
    },
    {
      "symbol": "WLD",
      "contract_address": "0x...", // WLD token address on your network
      "decimals": 18,
      "permit2_enabled": true,
      "max_allowance": "1000000000000000000000",
      "description": "Worldcoin token for property purchases"
    }
  ]
}
```

**Configuration Steps:**
1. Click "Add Token"
2. Enter LIFE token details
3. Enable Permit2 for gasless approvals
4. Set reasonable allowance limits
5. Repeat for WLD token

### 5. App Metadata Configuration

Update your app metadata in **App Settings > General**:

```json
{
  "app_name": "Proof of Life",
  "description": "Daily LIFE token claiming and property investment game",
  "category": "DeFi/Gaming",
  "website": "https://proofoflife.app",
  "support_email": "support@proofoflife.app",
  "privacy_policy": "https://proofoflife.app/privacy",
  "terms_of_service": "https://proofoflife.app/terms",
  "logo_url": "https://proofoflife.app/logo.png",
  "supported_networks": ["optimism", "optimism-sepolia"],
  "payment_methods": ["WLD", "LIFE"],
  "features": [
    "Daily token claiming",
    "Property NFT purchases", 
    "Dual payment support",
    "Property income generation"
  ]
}
```

## Frontend Integration Setup

### 1. Install Dependencies

```bash
npm install @worldcoin/minikit-js ethers
```

### 2. Environment Configuration

Create `.env.local` for your frontend:

```env
# Contract Addresses
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=<YOUR_LIFE_TOKEN_ADDRESS>
NEXT_PUBLIC_ECONOMY_V2_ADDRESS=<YOUR_ECONOMYV2_ADDRESS>
NEXT_PUBLIC_PROPERTY_V2_ADDRESS=<YOUR_PROPERTYV2_ADDRESS>

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=10 # Optimism mainnet
NEXT_PUBLIC_RPC_URL=https://optimism-mainnet.infura.io/v3/YOUR_KEY

# World App Configuration
NEXT_PUBLIC_WORLD_APP_ID=<YOUR_WORLD_APP_ID>
NEXT_PUBLIC_WORLD_ID_ACTION_ID=<YOUR_ACTION_ID>
```

### 3. Contract ABI Setup

Create `lib/contracts.js`:

```javascript
import EconomyV2ABI from './abis/EconomyV2.json';
import PropertyV2ABI from './abis/PropertyV2.json';
import LIFEABI from './abis/LIFE.json';

export const contracts = {
  LIFE: {
    address: process.env.NEXT_PUBLIC_LIFE_TOKEN_ADDRESS,
    abi: LIFEABI
  },
  EconomyV2: {
    address: process.env.NEXT_PUBLIC_ECONOMY_V2_ADDRESS,
    abi: EconomyV2ABI
  },
  PropertyV2: {
    address: process.env.NEXT_PUBLIC_PROPERTY_V2_ADDRESS,
    abi: PropertyV2ABI
  }
};
```

## Testing & Validation

### 1. Contract Testing

Create comprehensive tests in `test/integration.test.js`:

```javascript
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Integration Tests", function() {
  let economyV2, propertyV2, lifeToken;
  let owner, user1, treasury, devFee;

  beforeEach(async function() {
    [owner, user1, treasury, devFee] = await ethers.getSigners();
    
    // Deploy contracts (similar to deployment script)
    // ... deployment code ...
  });

  describe("LIFE Token Purchases", function() {
    it("Should purchase property with LIFE tokens", async function() {
      // Test LIFE token purchase flow
    });
  });

  describe("World App Integration", function() {
    it("Should initiate and complete WLD payments", async function() {
      // Test World App payment flow
    });
  });

  describe("Property Management", function() {
    it("Should handle property income and upgrades", async function() {
      // Test property functionality
    });
  });
});
```

### 2. Frontend Testing

Test World App integration:

```javascript
// Test minikit.pay() integration
import { MiniKit } from '@worldcoin/minikit-js';

const testWorldAppPayment = async () => {
  try {
    const payload = {
      reference: "test-payment-123",
      to: economyV2Address,
      tokens: [{
        symbol: "WLD",
        token_amount: "10000000000000000000" // 10 WLD
      }],
      description: "Test property purchase"
    };

    const result = await MiniKit.commandsAsync.pay(payload);
    console.log("Payment result:", result);
  } catch (error) {
    console.error("Payment failed:", error);
  }
};
```

## Monitoring & Maintenance

### 1. Event Monitoring

Set up event listeners for important contract events:

```javascript
// Monitor property purchases
economyV2.on("PropertyPurchased", (buyer, tokenId, propertyType, paymentMethod, amount) => {
  console.log(`Property purchased: ${tokenId} by ${buyer} using ${paymentMethod}`);
});

// Monitor payment initiations
economyV2.on("PaymentInitiated", (paymentId, buyer, amount, propertyType) => {
  console.log(`Payment initiated: ${paymentId} for ${propertyType}`);
});
```

### 2. Health Checks

Implement regular health checks:

```javascript
const healthCheck = async () => {
  try {
    // Check contract accessibility
    const economyAddress = await economyV2.address;
    const propertyAddress = await propertyV2.address;
    
    // Check balances
    const treasuryBalance = await ethers.provider.getBalance(treasuryAddress);
    
    // Check property counts
    const totalProperties = await propertyV2.totalSupply();
    
    console.log("Health check passed:", {
      economyAddress,
      propertyAddress,
      treasuryBalance: ethers.utils.formatEther(treasuryBalance),
      totalProperties: totalProperties.toString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
  }
};
```

## Troubleshooting

### Common Issues

1. **"Transaction reverted" errors**
   - Check gas limits in World Dev Portal
   - Verify contract addresses are correct
   - Ensure sufficient token balances

2. **World App payment failures**
   - Verify whitelisted addresses in Dev Portal
   - Check payment limits and restrictions
   - Ensure proper payload format

3. **Contract upgrade issues**
   - Use OpenZeppelin's upgrade plugins
   - Test upgrades on testnet first
   - Maintain storage layout compatibility

### Debug Commands

```bash
# Check contract deployment
npx hardhat console --network optimism
> const economyV2 = await ethers.getContractAt("EconomyV2", "<ADDRESS>");
> await economyV2.owner();

# Verify contract state
> await economyV2.getPropertyPrice("house");
> await economyV2.treasuryAddress();
```

## Security Considerations

1. **Access Controls**: Ensure only authorized addresses can upgrade contracts
2. **Payment Validation**: Always verify World App payments before completion
3. **Reentrancy Protection**: All external calls are protected
4. **Rate Limiting**: Consider implementing purchase limits per user
5. **Emergency Pause**: Implement pause functionality for emergency situations

## Support & Resources

- **World Developer Documentation**: https://docs.worldcoin.org/
- **OpenZeppelin Upgrades**: https://docs.openzeppelin.com/upgrades-plugins/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Optimism Developer Docs**: https://docs.optimism.io/

For additional support, contact the development team or refer to the integration guide for detailed implementation examples.