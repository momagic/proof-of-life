# 🚀 Production Deployment Commands

## 📋 **Pre-Deployment Checklist**

### **Environment Setup**
```bash
# 1. Install dependencies
npm install
# or
pnpm install

# 2. Compile contracts
npx hardhat compile

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your production settings
```

### **Required Environment Variables**
```bash
# .env file configuration
PRIVATE_KEY=your_private_key_without_0x_prefix
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
USE_REAL_WORLD_ID=true
WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278
WLD_TOKEN_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003
```

### **Balance Verification**
```bash
# Check deployer balance (need minimum 0.1 ETH)
npx hardhat run scripts/check-balance.js --network worldchain
```

## 🚀 **Production Deployment**

### **Option 1: Full Production Deployment**
```bash
# Deploy all contracts with real World ID integration
USE_REAL_WORLD_ID=true npx hardhat run deploy-production.js --network worldchain
```

### **Option 2: Step-by-Step Deployment**
```bash
# 1. Test local compilation
npx hardhat compile

# 2. Test deployment on local network first
npx hardhat node
# In another terminal:
npx hardhat run deploy-production.js --network localhost

# 3. Deploy to Worldchain mainnet
npx hardhat run deploy-production.js --network worldchain
```

### **Option 3: Using Package Scripts**
```bash
# Add to package.json scripts:
"scripts": {
  "deploy:prod": "USE_REAL_WORLD_ID=true hardhat run deploy-production.js --network worldchain",
  "deploy:test": "hardhat run test-real-worldid-flow.js --network worldchain",
  "verify:deployment": "hardhat run verify-production.js --network worldchain"
}

# Then run:
npm run deploy:prod
```

## 🔍 **Post-Deployment Verification**

### **1. Contract Verification on Explorer**
```bash
# Verify LIFE token
npx hardhat verify --network worldchain <LIFE_ADDRESS> <WORLD_ID_ROUTER> <DEV_WALLET>

# Verify Property contract
npx hardhat verify --network worldchain <PROPERTY_ADDRESS> <OWNER_ADDRESS>

# Verify Economy contract
npx hardhat verify --network worldchain <ECONOMY_ADDRESS> <OWNER> <LIFE> <WLD> <PROPERTY> <LIMITED_EDITION> <PLAYER_REGISTRY> <TREASURY> <DEV_WALLET>
```

### **2. Functional Testing**
```bash
# Run production flow test with real contracts
npx hardhat run test-real-worldid-flow.js --network worldchain

# Test specific functions
npx hardhat run verify-production.js --network worldchain
```

### **3. Manual Verification Checklist**
```bash
# Check each contract on Worldchain explorer:
# 1. LIFE token - verify orb verification setup
# 2. Economy - verify pricing and permissions
# 3. Property - verify base stats and minting
# 4. PlayerRegistry - verify integration
# 5. LimitedEdition - verify template system
```

## 🧪 **Testing with Real Users**

### **Test Script for Real World ID**
```bash
# Run comprehensive test with production contracts
node test-real-worldid-flow.js

# Expected output should show:
# ✅ Contracts deployed with real World ID Router
# ✅ Orb verification configured correctly
# ✅ Economic parameters verified
# 🚀 Ready for real user testing
```

### **User Testing Protocol**
1. **Recruit orb-verified testers**
   - Find users with World ID orb verification
   - Provide test wallets with small ETH amounts
   - Give clear testing instructions

2. **Test the complete flow**
   ```
   User Journey:
   1. Connect wallet to your dApp
   2. Complete World ID orb verification
   3. Claim LIFE tokens (should receive 1,001 LIFE)
   4. Purchase a property (any type/level)
   5. Wait 24+ hours
   6. Claim property income
   7. Test property buyback (optional)
   ```

3. **Monitor and collect feedback**
   - Watch transactions on Worldchain explorer
   - Note any failed transactions
   - Collect user feedback on UX
   - Check for edge cases

## 📊 **Monitoring Commands**

### **Contract Interaction Monitoring**
```bash
# Monitor LIFE token transactions
npx hardhat run scripts/monitor-life.js --network worldchain

# Monitor Economy transactions
npx hardhat run scripts/monitor-economy.js --network worldchain

# Check system health
npx hardhat run scripts/health-check.js --network worldchain
```

### **Analytics Queries**
```bash
# Get total LIFE claimed
npx hardhat run scripts/analytics/total-life-claimed.js --network worldchain

# Get property purchase stats
npx hardhat run scripts/analytics/property-stats.js --network worldchain

# Get user count by region
npx hardhat run scripts/analytics/regional-stats.js --network worldchain
```

## 🚨 **Emergency Procedures**

### **If Deployment Fails**
```bash
# 1. Check gas price and network status
npx hardhat run scripts/check-network.js --network worldchain

# 2. Review failed deployment logs
cat failed-deployment.json

# 3. Resume deployment from specific step (if needed)
npx hardhat run scripts/resume-deployment.js --network worldchain
```

### **If Contracts Need Updates**
```bash
# Use UUPS upgrade pattern
npx hardhat run scripts/upgrade-life.js --network worldchain
npx hardhat run scripts/upgrade-economy.js --network worldchain
```

### **Emergency Pause (if needed)**
```bash
# Pause token minting (owner only)
npx hardhat run scripts/emergency-pause.js --network worldchain
```

## 📱 **Frontend Integration Commands**

### **Generate ABI Files for Frontend**
```bash
# Extract ABIs for frontend integration
npx hardhat run scripts/extract-abis.js

# Copy to frontend project
cp artifacts/contracts/LIFE.sol/LIFE.json ../frontend/src/abis/
cp artifacts/contracts/Economy.sol/Economy.json ../frontend/src/abis/
cp artifacts/contracts/Property.sol/Property.json ../frontend/src/abis/
```

### **Update Frontend Contract Addresses**
```bash
# Generate contract address constants
npx hardhat run scripts/generate-addresses.js --network worldchain

# Output format for frontend:
# export const CONTRACTS = {
#   LIFE_TOKEN: "0x...",
#   ECONOMY: "0x...",
#   // etc.
# };
```

## 🎯 **Production Launch Checklist**

### **Technical Readiness**
- [ ] All contracts deployed successfully
- [ ] Contract verification completed on explorer
- [ ] Real World ID integration tested
- [ ] User flow tested with orb-verified users
- [ ] Frontend updated with production addresses
- [ ] Monitoring and analytics set up

### **Business Readiness**
- [ ] User education materials prepared
- [ ] Customer support team trained
- [ ] Community guidelines established
- [ ] Launch announcement ready
- [ ] Social media campaigns prepared

### **Security Readiness**
- [ ] Audit results reviewed (if applicable)
- [ ] Emergency procedures documented
- [ ] Access controls verified
- [ ] Backup plans established
- [ ] Team incident response ready

## 🎉 **Launch Day Commands**

### **Final System Check**
```bash
# 1. Verify all systems operational
npm run verify:all

# 2. Check contract balances and permissions
npm run check:permissions

# 3. Test complete user flow one final time
npm run test:production-flow

# 4. Start monitoring
npm run start:monitoring
```

### **Go Live!**
```bash
echo "🚀 LIFE Economy is now LIVE on Worldchain!"
echo "🌍 Only orb-verified humans can participate"
echo "💰 Economic sustainability through property income"
echo "🏆 Human-verified leaderboards and status"
```

---

**Your LIFE token economy is ready for production! 🌟**
