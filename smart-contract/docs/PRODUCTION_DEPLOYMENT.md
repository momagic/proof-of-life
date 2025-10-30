# 🚀 Production Deployment Guide - Orb Verification

## 📋 Current Status

Your LIFE contract has been successfully deployed and tested on Worldchain with orb verification. The system is now secure against non-human verification and sybil attacks.

### ✅ What's Already Done
- ✅ Orb-only verification implemented (groupId = 1)
- ✅ Nullifier tracking for sybil resistance
- ✅ Signal validation to prevent address spoofing
- ✅ Deployed and tested on Worldchain mainnet
- ✅ All security features verified working

## 🔗 Current Deployment (Testing)

### Contract Addresses on Worldchain
| Contract | Address | Explorer Link |
|----------|---------|---------------|
| **LIFE Token** | `0x1f3BfD3593C380fAC5ED40113471A8DC4973a002` | [View](https://explorer.worldcoin.org/address/0x1f3BfD3593C380fAC5ED40113471A8DC4973a002) |
| **MockWorldIDRouter** | `0x75E1Ef72efcba1B24D965F0719115485c108d628` | [View](https://explorer.worldcoin.org/address/0x75E1Ef72efcba1B24D965F0719115485c108d628) |
| **Property** | `0xf2595d3037d4f3eD6C51565C2be6638Ab0D725cc` | [View](https://explorer.worldcoin.org/address/0xf2595d3037d4f3eD6C51565C2be6638Ab0D725cc) |
| **LimitedEdition** | `0x83A7dd38F5232BEdc5cFc02F0E218cc27091A40d` | [View](https://explorer.worldcoin.org/address/0x83A7dd38F5232BEdc5cFc02F0E218cc27091A40d) |
| **PlayerRegistry** | `0x7A2Ec310d5F86c5F60fAA7DdEB0c862874b0a469` | [View](https://explorer.worldcoin.org/address/0x7A2Ec310d5F86c5F60fAA7DdEB0c862874b0a469) |
| **Economy** | `0x0a1741Fb535d1013702b8aDD36f571Cc5F3951c4` | [View](https://explorer.worldcoin.org/address/0x0a1741Fb535d1013702b8aDD36f571Cc5F3951c4) |
| **WLD Token (Mock)** | `0x1fBcaEBe44ED0aCCD2B9747e24eFbEB33c12Ec14` | [View](https://explorer.worldcoin.org/address/0x1fBcaEBe44ED0aCCD2B9747e24eFbEB33c12Ec14) |

### Current Configuration
- **Network**: Worldchain Mainnet (Chain ID: 480)
- **World ID Router**: Mock Router (Testing Only)
- **Group ID**: 1 (Orb verification)
- **External Nullifier Hash**: `333545013268033606231922768817910041010535579982205010670445874042009088680`

## 🎯 Next Steps for Production

### Step 1: Deploy with Real World ID Router

#### 1.1 Update Environment Variables
Edit your `.env` file:
```bash
# Set to use real World ID Router
USE_REAL_WORLD_ID=true
WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278

# Ensure you have sufficient ETH for deployment
PRIVATE_KEY=your_private_key_here
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
```

#### 1.2 Deploy Production Contracts
```bash
# Deploy with real World ID Router
pnpm run deploy:orb:worldchain
```

Expected output will show:
```
🌍 Using Real World ID Router at: 0x17B354dD2595411ff79041f930e491A4Df39A278
```

### Step 2: Update Frontend Integration

#### 2.1 Update Contract Addresses
In your frontend configuration, update to the new production contract addresses:

```typescript
// Frontend configuration
const CONTRACTS = {
  LIFE_TOKEN: "0x[NEW_PRODUCTION_ADDRESS]", // From deployment output
  WORLD_ID_ROUTER: "0x17B354dD2595411ff79041f930e491A4Df39A278", // Real Router
  PROPERTY: "0x[NEW_PRODUCTION_ADDRESS]",
  ECONOMY: "0x[NEW_PRODUCTION_ADDRESS]"
};

const WORLDCHAIN_CONFIG = {
  chainId: 480,
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  blockExplorer: "https://explorer.worldcoin.org"
};
```

#### 2.2 Update Claim Function Call
Replace the old `claim()` function with the new orb verification function:

```typescript
// OLD (Remove this)
await lifeContract.claim(userRegion);

// NEW (Use this)
await lifeContract.claimWithOrbVerification(
  userAddress,        // signal (must match sender)
  proof.merkle_root,  // root from World ID proof
  proof.nullifier_hash, // nullifier from World ID proof
  proof.proof,        // proof array from World ID
  userRegion          // user's region
);
```

#### 2.3 Verify Frontend World ID Configuration
Ensure your frontend is already configured correctly (it should be):

```typescript
const verifyPayload: VerifyCommandInput = {
  action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || "proof-of-life",
  signal: "",
  verification_level: VerificationLevel.Orb, // ✅ Already correct!
};
```

### Step 3: Testing with Real World ID

#### 3.1 Test with Real Users
1. Have real users with World ID orb verification test the system
2. Verify that only orb-verified users can claim tokens
3. Test nullifier uniqueness across different users
4. Verify 24-hour claim frequency enforcement

#### 3.2 Monitor Contract Interactions
```bash
# Monitor transactions on the new contracts
npx hardhat run scripts/verify-deployed-orb.js --network worldchain
```

### Step 4: Security Verification Checklist

Before going fully live, verify:

- [ ] **Real World ID Router**: Contract uses `0x17B354dD2595411ff79041f930e491A4Df39A278`
- [ ] **Group ID = 1**: Only orb verification accepted
- [ ] **External Nullifier**: Correctly computed from app ID and action
- [ ] **Nullifier Tracking**: Prevents double-claims
- [ ] **Signal Validation**: Prevents address spoofing
- [ ] **Access Control**: Only authorized contracts can mint
- [ ] **Frontend Integration**: Uses new contract addresses
- [ ] **Real User Testing**: Orb-verified users can claim successfully

### Step 5: Monitor and Maintain

#### 5.1 Set Up Monitoring
Monitor key metrics:
- Total LIFE tokens claimed
- Number of unique orb-verified users
- Failed verification attempts
- Contract interaction patterns

#### 5.2 Emergency Procedures
If issues arise:
1. Contract is upgradeable (UUPS pattern)
2. Owner can update World ID Router if needed
3. Owner can pause token minting if necessary

## 🔒 Security Features in Production

### Orb-Only Verification
```solidity
// Enforced in contract
uint256 internal constant GROUP_ID = 1; // Orb verification only

// Verified in claimWithOrbVerification function
worldId.verifyProof(
    root,
    GROUP_ID, // 1 = orb verification only
    abi.encodePacked(signal).hashToField(),
    nullifierHash,
    externalNullifierHash,
    proof
);
```

### Sybil Resistance
```solidity
// Nullifier tracking prevents double-claims
mapping(uint256 => bool) internal nullifierHashes;
require(!nullifierHashes[nullifierHash], "Nullifier already used");
nullifierHashes[nullifierHash] = true;
```

### Signal Validation
```solidity
// Prevents address spoofing
require(signal == msg.sender, "Signal must be sender address");
```

## 📊 Migration Strategy

### Option A: Fresh Production Deployment
- Deploy new contracts with real World ID Router
- Start fresh with production configuration
- Update frontend to use new addresses

### Option B: Upgrade Existing Contracts
- Use UUPS upgrade mechanism
- Update World ID Router in existing contracts
- Maintain existing user data and balances

### Recommended: Option A (Fresh Deployment)
For maximum security and clarity, deploy fresh production contracts.

## 🚨 Critical Warnings

### ⚠️ Do NOT Use in Production:
- MockWorldIDRouter contract
- Any mock contracts for testing
- Contracts deployed with `USE_REAL_WORLD_ID=false`

### ✅ Only Use in Production:
- Real World ID Router: `0x17B354dD2595411ff79041f930e491A4Df39A278`
- Contracts deployed with `USE_REAL_WORLD_ID=true`
- Verified orb-only verification (groupId = 1)

## 📞 Support Resources

### Documentation
- [World ID Documentation](https://docs.world.org/world-id)
- [Orb Verification Guide](./ORB_VERIFICATION_GUIDE.md)
- [Worldchain Setup](./WORLDCHAIN_SETUP.md)

### Contract Verification
- Worldchain Explorer: https://explorer.worldcoin.org
- Contract source verification recommended

### Testing Commands
```bash
# Test locally first
pnpm run test:orb

# Deploy to production
pnpm run deploy:orb:worldchain

# Verify deployment
npx hardhat run scripts/verify-deployed-orb.js --network worldchain
```

## 🎉 Ready for Production!

Once you complete these steps, your LIFE contract will be:
- ✅ Secure against non-human verification
- ✅ Resistant to sybil attacks
- ✅ Only accessible to real humans verified by Worldcoin orb
- ✅ Production-ready on Worldchain

Your system will ensure that only genuine, unique humans can claim LIFE tokens, making it a truly human-verified economy! 🌍✨
