# 🌍 LIFE Token - Orb Verification Implementation Guide

## ✅ What Was Fixed

Your LIFE contract has been upgraded to enforce **orb-only verification** using the official World ID protocol. This ensures only real humans verified through Worldcoin's orb can claim LIFE tokens.

### 🚨 Previous Security Issues (FIXED)
- ❌ **Non-orb verification accepted**: Contract accepted phone/device verification
- ❌ **Mock implementation in production**: Using `MockWorldIDAddressBook` that could be manipulated
- ❌ **No sybil resistance**: Same person could potentially claim multiple times
- ❌ **No verification level enforcement**: Any World ID verification was accepted

### ✅ New Security Features
- ✅ **Orb-only verification**: Only `groupId = 1` (orb verification) is accepted
- ✅ **Zero-knowledge proof verification**: Uses official World ID Router contract
- ✅ **Sybil resistance**: Nullifier tracking prevents double-claims
- ✅ **Signal validation**: Prevents address spoofing attacks
- ✅ **Proper external nullifier**: Computed from app ID and action

## 🔧 Implementation Details

### New Contract Architecture

```
IWorldID.sol              # Official World ID Router interface
├── ByteHasher library     # Field element hashing utilities
└── IWorldID interface     # Proof verification interface

LIFE.sol (Updated)         # Main LIFE token contract
├── Orb verification      # New claimWithOrbVerification() function
├── Nullifier tracking    # Prevents double-spending
├── Legacy support        # Backward compatibility
└── Security features     # Signal validation, group ID enforcement

MockWorldIDRouter.sol      # Testing mock (DO NOT USE IN PRODUCTION)
├── Test utilities        # Valid roots/nullifiers for testing
└── Failure simulation    # Test error conditions
```

### Key Functions

#### 🎯 Primary Function: `claimWithOrbVerification()`
```solidity
function claimWithOrbVerification(
    address signal,           // Must be msg.sender
    uint256 root,            // World ID Merkle root
    uint256 nullifierHash,   // Prevents double-claiming
    uint256[8] calldata proof, // ZK proof
    string memory region     // User's region
) external
```

**Security Checks:**
1. Signal must match sender address
2. Nullifier must not be used before
3. World ID proof must be valid with `groupId = 1` (orb only)
4. Standard claim frequency and region validation

#### 📊 Utility Functions
- `isNullifierUsed(uint256)` - Check if nullifier was used
- `getExternalNullifierHash()` - Get computed external nullifier
- `getGroupId()` - Returns 1 (orb verification)
- `updateWorldIdRouter()` - Admin function to update router

### 🔒 Security Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Group ID** | `1` | Orb verification only |
| **App ID** | `app_960683747d9e6074f64601c654c8775f` | Your World ID app |
| **Action** | `proof-of-life` | Verification action |
| **External Nullifier** | Computed from app ID + action | Prevents cross-app replay |

## 🚀 Deployment Options

### Option 1: Production with Real World ID
```bash
# Set environment variables
export USE_REAL_WORLD_ID=true
export WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278

# Deploy with orb verification
npx hardhat run scripts/deploy-orb-verification.js --network worldchain
```

### Option 2: Testing with Mock Router
```bash
# Deploy with mock for testing
npx hardhat run scripts/deploy-orb-verification.js --network worldchain
```

## 🧪 Testing

### Run Comprehensive Tests
```bash
# Install dependencies
npm install

# Run orb verification tests
npx hardhat test test-orb-verification.js

# Run with verbose output
npx hardhat test test-orb-verification.js --verbose
```

### Test Coverage
- ✅ Orb verification setup and configuration
- ✅ Valid orb-verified claims with proper rewards
- ✅ Sybil resistance (nullifier double-spend prevention)
- ✅ Signal validation (address spoofing prevention)
- ✅ Invalid root/nullifier rejection
- ✅ 24-hour claim frequency enforcement
- ✅ Security failure simulation
- ✅ Legacy function compatibility
- ✅ Admin function access control

## 🌐 Frontend Integration

### Update Your Frontend

Your frontend verification button already specifies orb verification:
```typescript
const verifyPayload: VerifyCommandInput = {
  action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || "web3-template",
  signal: "",
  verification_level: VerificationLevel.Orb, // ✅ Already correct!
};
```

### Add Contract Integration

You'll need to update your frontend to call the new function:

```typescript
// Instead of the old claim() function, use:
await lifeContract.claimWithOrbVerification(
  userAddress,        // signal
  proof.merkle_root,  // root
  proof.nullifier_hash, // nullifierHash
  proof.proof,        // proof array
  userRegion          // region
);
```

## 📋 Migration Guide

### For Existing Deployments

1. **Deploy new orb-verified contract**
2. **Migrate token balances** (if needed)
3. **Update frontend** to use new claim function
4. **Test thoroughly** before switching users over

### Environment Setup

Create a `.env` file with:
```bash
# World ID Configuration
NEXT_PUBLIC_WLD_APP_ID=app_960683747d9e6074f64601c654c8775f
NEXT_PUBLIC_WLD_ACTION_ID=proof-of-life

# Production World ID Router (Worldchain)
WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278
USE_REAL_WORLD_ID=true

# Development
DEV_PORTAL_API_KEY=your_dev_portal_api_key
```

## ⚠️ Important Security Notes

### 🔴 CRITICAL: Production Checklist
- [ ] **NEVER** use `MockWorldIDRouter` in production
- [ ] **ALWAYS** use real World ID Router: `0x17B354dD2595411ff79041f930e491A4Df39A278`
- [ ] **VERIFY** `groupId = 1` in contract
- [ ] **TEST** nullifier uniqueness thoroughly
- [ ] **VALIDATE** external nullifier hash computation

### 🟡 Deployment Warnings
- Legacy `claimLegacy()` function is disabled by default
- Mock contracts contain test utilities that could be exploited
- Always verify contract addresses before frontend integration

## 🎯 Benefits of New Implementation

### 🛡️ Security Improvements
1. **Sybil Resistance**: Nullifier tracking prevents multiple claims
2. **Orb-Only Verification**: Only real humans verified by orb can claim
3. **Address Validation**: Signal must match sender address
4. **Replay Protection**: External nullifier prevents cross-app attacks

### 🚀 Production Ready
1. **Official World ID Integration**: Uses real World ID Router
2. **Upgradeable Contract**: Can be updated if needed
3. **Comprehensive Testing**: Full test suite included
4. **Monitoring Ready**: Events for tracking verification

### 🔧 Developer Experience
1. **Clear Error Messages**: Specific revert reasons
2. **Utility Functions**: Easy to check nullifier status
3. **Backward Compatibility**: Legacy functions for migration
4. **Documentation**: Complete implementation guide

## 🎉 Verification Complete!

Your LIFE contract now enforces **orb-only verification** and is secure against:
- ❌ Non-human verification
- ❌ Multiple claims by same person
- ❌ Address spoofing attacks
- ❌ Cross-app replay attacks

Deploy with confidence knowing only real, verified humans can claim LIFE tokens! 🌍✨
