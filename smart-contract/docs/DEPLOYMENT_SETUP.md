# 🚀 Production Deployment Setup Guide

## Step 1: Environment Setup

### Required Environment Variables

You need to set up your `.env` file with the following variables:

```bash
# Private key for deploying contracts (without 0x prefix)
PRIVATE_KEY="your-private-key-here"

# Worldchain Network Configuration
WORLDCHAIN_RPC_URL="https://worldchain-mainnet.g.alchemy.com/public"

# Optional: Custom RPC if you have Alchemy/Infura account
# WORLDCHAIN_RPC_URL="https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

### ⚠️ IMPORTANT SECURITY NOTES:

1. **Private Key**: This should be the private key of the wallet that will own the contracts
2. **Balance**: Make sure your wallet has at least **0.2 ETH** on Worldchain for deployment
3. **Backup**: Keep your private key secure and backed up
4. **Never Commit**: Never commit your `.env` file to git

## Step 2: Check Your Wallet Balance

Before deployment, verify you have enough ETH on Worldchain:

```bash
# Check your balance
node -e "
const { ethers } = require('hardhat');
async function checkBalance() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer:', deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  console.log('Required: 0.2 ETH minimum');
  console.log('Ready:', balance >= ethers.parseEther('0.2') ? '✅ YES' : '❌ NO');
}
checkBalance().catch(console.error);
"
```

## Step 3: Test Connection

Test your Worldchain connection:

```bash
# Test network connection
npx hardhat run --network worldchain -e "
async function test() {
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId);
  console.log('Block Number:', await ethers.provider.getBlockNumber());
}
test().catch(console.error);
"
```

## Step 4: Deploy Contracts

Once your environment is set up and you have confirmed your balance:

```bash
# Deploy to production with real World ID
node deploy-production.js
```

## Step 5: Verify Deployment

After deployment, run the verification script:

```bash
# Verify all contracts are working correctly
node verify-production.js
```

## Deployment Checklist

- [ ] `.env` file configured with private key
- [ ] Wallet has at least 0.2 ETH on Worldchain
- [ ] Network connection tested
- [ ] All dependencies installed (`npm install`)
- [ ] Contracts compiled (`npx hardhat compile`)
- [ ] Ready to deploy!

## Expected Output

The deployment will:

1. ✅ Deploy LIFE Token with real World ID Router
2. ✅ Deploy Property Contract
3. ✅ Deploy LimitedEdition Contract
4. ✅ Deploy PlayerRegistry Contract
5. ✅ Deploy Economy Contract
6. ✅ Configure all permissions between contracts
7. ✅ Verify all systems are working
8. ✅ Generate contract addresses for frontend

## After Deployment

You'll get contract addresses that need to be updated in your frontend:

```typescript
export const CONTRACTS = {
  LIFE_TOKEN: "0x...",     // New address from deployment
  ECONOMY: "0x...",        // New address from deployment
  PROPERTY: "0x...",       // New address from deployment
  LIMITED_EDITION: "0x...", // New address from deployment
  PLAYER_REGISTRY: "0x...", // New address from deployment
  WORLD_ID_ROUTER: "0x17B354dD2595411ff79041f930e491A4Df39A278", // Production
  WLD_TOKEN: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" // Worldchain WLD
};
```

## Troubleshooting

### Common Issues:

1. **Insufficient balance**: Add more ETH to your wallet
2. **Network connection**: Check your RPC URL in `.env`
3. **Private key**: Ensure it's correct and without `0x` prefix
4. **Compilation errors**: Run `npx hardhat compile` first

### Support:

- Check deployment logs in `production-deployment.json`
- Verify contracts on Worldchain explorer
- Test with real World ID orb verification

---

**Ready to launch your human-verified token economy! 🌍✨**
