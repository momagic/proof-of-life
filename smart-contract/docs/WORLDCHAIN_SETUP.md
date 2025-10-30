# 🌍 Worldchain Testing Setup Guide

## About World Chain (OP Stack & Superchain)
- World Chain is built on the OP Stack and part of the Superchain. It is EVM-equivalent and uses Ethereum for data availability and finality, inheriting Ethereum security.
- World Chain is designed for unique humans. Orb-only verification (Group ID = 1) via the World ID Router provides strong sybil resistance.
- Contracts in this repo validate ZK proofs and track nullifiers on-chain to prevent double claims.
- Reference: https://docs.world.org/world-chain

## Prerequisites

1. **Install Dependencies**
```bash
cd smart-contract
npm install
```

2. **Set Up Environment Variables**
Create a `.env` file in the `smart-contract` directory:

```bash
# Worldchain Configuration
PRIVATE_KEY=your_private_key_here
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
WORLDCHAIN_API_KEY=your_worldchain_api_key_here

# World ID Configuration
NEXT_PUBLIC_WLD_APP_ID=app_960683747d9e6074f64601c654c8775f
NEXT_PUBLIC_WLD_ACTION_ID=proof-of-life

# Production World ID Router (Worldchain Mainnet)
WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278
USE_REAL_WORLD_ID=false

# Development
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here
```

3. **Get Worldchain ETH**
- Get your wallet address from your private key
- Use a Worldchain faucet to get test ETH
- Ensure you have at least 0.1 ETH for deployments

> Note: For production, set `USE_REAL_WORLD_ID=true` and use the real World ID Router address. Ensure Group ID is `1` (orb-only).

## Testing Commands

### 1. Install Missing Dependencies
```bash
npm install @nomicfoundation/hardhat-verify@^2.0.0 chai@^4.3.10
```

### 2. Local Testing (Recommended First)
```bash
# Test orb verification locally
npm run test:orb
```

### 3. Deploy to Worldchain with Mock Router (Testing)
```bash
# Deploy with mock World ID Router for testing
npm run deploy:orb:worldchain
```

### 4. Test Deployed Contracts on Worldchain
```bash
# Run comprehensive test on deployed contracts
npx hardhat run scripts/test-worldchain-orb.js --network worldchain
```

### 5. Deploy to Worldchain with Real World ID (Production)
```bash
# Set USE_REAL_WORLD_ID=true in .env, then:
npm run deploy:orb:worldchain
```

## Verification Steps

After deployment, verify:

1. **Contract Deployment**
   - Check contract addresses in deployment output
   - Verify on Worldchain explorer: https://explorer.worldcoin.org

2. **Orb Verification Setup**
   - Group ID should be 1 (orb verification)
   - External nullifier hash should be computed
   - World ID Router should be set correctly
   - Signal should match the user address (or defined identifier)

3. **Functionality Testing**
   - Test claim with valid orb verification
   - Test sybil resistance (double-spend prevention)
   - Test invalid proof rejection

## Troubleshooting

### Common Issues

1. **"Insufficient balance" Error**
   - Get more ETH from Worldchain faucet
   - Minimum 0.01 ETH required for testing

2. **"Cannot find module" Error**
   - Run `npm install` to install dependencies
   - Check that all required packages are installed

3. **"Invalid nullifier" Error in Mock**
   - The mock router requires pre-setup of valid nullifiers
   - Use the test script which sets up valid test data

4. **RPC Connection Issues**
   - Check WORLDCHAIN_RPC_URL in .env
   - Try alternative RPC endpoints if available

### Network Information

- **Chain ID**: 480
- **RPC URL**: https://worldchain-mainnet.g.alchemy.com/public
- **Explorer**: https://explorer.worldcoin.org
- **Currency**: ETH

## Security Checklist

Before production deployment:

- [ ] Use real World ID Router address
- [ ] Set USE_REAL_WORLD_ID=true
- [ ] Verify Group ID is 1 (orb verification)
- [ ] Test nullifier uniqueness
- [ ] Verify external nullifier computation
- [ ] Remove or secure mock contracts
- [ ] Test with real World ID proofs

## Next Steps

1. **Local Testing**: Test orb verification logic locally first
2. **Worldchain Testing**: Deploy and test on Worldchain with mock router
3. **Production Setup**: Switch to real World ID Router
4. **Frontend Integration**: Update frontend to use new contract addresses
5. **Monitoring**: Set up monitoring for contract interactions
