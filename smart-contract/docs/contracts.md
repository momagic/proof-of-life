# LIFE Ecosystem Smart Contracts

## Current Deployment Status

**🚀 Status:** Production Ready with Real World ID Integration  
**Network:** Worldchain Mainnet  
**Chain ID:** 480  
**Last Updated:** December 2024  

### Architecture Summary
- Upgradeable core using OpenZeppelin: `Initializable`, `UUPSUpgradeable`, `OwnableUpgradeable`; `Economy` adds `ReentrancyGuardUpgradeable`.
- `LIFE` integrates the real World ID Router (Group ID = 1) for orb-only verification with ZK proof checks, signal validation, and on-chain nullifier tracking.
- `Economy` coordinates purchases (LIFE or WLD), fee distribution, exchange rate conversions, property income generation, and buyback; optional World ID–exclusive property gating.
- `Property` and `LimitedEdition` are ERC-721 upgradeable tokens with authorized minting and metadata; `Property` includes levels, yield rates, and daily income.
- `PlayerRegistry` tracks region, status score, and check-ins with owner/authorized updater roles.

### Production Configuration
- ✅ **World ID Orb Verification**: Group ID = 1 (Orb-only verification)
- ✅ **Sybil Resistance**: Nullifier tracking implemented
- ✅ **Human-Verified Economy**: Only orb-verified humans can participate
- ✅ **Complete Integration**: All contracts working together seamlessly

---

## Latest Contract Addresses (Update After Production Deployment)

| Contract | Address | Type | Status |
|----------|---------|------|--------|
| **LIFE Token** | `[TO_BE_UPDATED]` | ERC-20 (Upgradeable) | ✅ Production Ready |
| **Property Contract** | `[TO_BE_UPDATED]` | ERC-721 (Upgradeable) | ✅ Production Ready |
| **LimitedEdition Contract** | `[TO_BE_UPDATED]` | ERC-721 (Upgradeable) | ✅ Production Ready |
| **PlayerRegistry Contract** | `[TO_BE_UPDATED]` | Registry (Upgradeable) | ✅ Production Ready |
| **Economy Contract** | `[TO_BE_UPDATED]` | Economy Hub (Upgradeable) | ✅ Production Ready |
| **World ID Router** | `0x17B354dD2595411ff79041f930e491A4Df39A278` | Production Router | ✅ Live |
| **WLD Token** | `0x2cFc85d8E48F8EAB294be644d9E25C3030863003` | Worldcoin Token | ✅ Live |

### Previous Test Deployment (Replaced)
| Contract | Address | Type | Status |
|----------|---------|------|--------|
| MockWorldIDAddressBook | `0xf7D6017CA009c8Abe2A3f43E463Dd1a1CFe5af5A` | Mock Contract | 🔄 Replaced with Real World ID |
| LIFE Token (Old) | `0xa1d119264C1D84756f02abd8c06dA44911349749` | ERC-20 (Upgradeable) | 🔄 Upgraded |
| Property (Old) | `0xc31851a3f3A8fe340f0520222e46fA42cFB2ed58` | ERC-721 (Upgradeable) | 🔄 Upgraded |
| Economy (Old) | `0x2ce4DcC9f1f27C375E46d4de7C0D4B77e59569f2` | Economy Hub (Upgradeable) | 🔄 Upgraded |

---

## Contract Details

### 1. LIFE Token Contract
**Address:** `[TO_BE_UPDATED_ON_DEPLOYMENT]`  
**Type:** ERC-20 Upgradeable (UUPS Pattern)

#### Production Features:
- **🔐 World ID Orb Verification:** Only orb-verified humans can claim tokens
- **💰 Daily Claiming:** Users can claim 1 LIFE token every 24 hours
- **🎁 Signing Bonus:** 1,000 LIFE tokens for first-time users
- **🛡️ Sybil Resistance:** Nullifier tracking prevents double-claims
- **🌍 Region Support:** Users set their region during first claim
- **⚡ Authorized Minting:** Economy contract can mint for property income
- **🔄 Upgradeable:** Uses UUPS proxy pattern for future upgrades

#### Constants:
- **Daily Claim Amount:** 1 LIFE token (1e18 wei)
- **Signing Bonus:** 1,000 LIFE tokens (1000e18 wei)
- **Dev Premint:** 1,000,000 LIFE tokens (1e24 wei)
- **Claim Frequency:** 24 hours (86400 seconds)
- **Group ID:** 1 (Orb verification only)
- **App ID:** `app_960683747d9e6074f64601c654c8775f`
- **Action:** `proof-of-life`

#### Key Functions:
- `claimWithOrbVerification(address signal, uint256 root, uint256 nullifierHash, uint256[8] proof, string region)` - Claim with World ID orb verification
- `claimLegacy(string region)` - Legacy claim function (deprecated)
- `mint(address to, uint256 amount)` - Mint tokens (authorized minters only)
- `timeUntilNextClaim(address user)` - Check when user can claim next
- `getUserRegion(address user)` - Get user's region
- `getLifetimeCheckIns(address user)` - Get user's total check-ins
- `isNullifierUsed(uint256 nullifierHash)` - Check if nullifier was used

---

### 2. Property Contract
**Address:** `[TO_BE_UPDATED_ON_DEPLOYMENT]`  
**Type:** ERC-721 Upgradeable (UUPS Pattern)

#### Production Features:
- **🏠 Property NFTs:** Real estate NFTs with full metadata
- **📊 Status Points System:** Each property provides status points based on type and level
- **📍 Metadata Support:** Name, type, location, level, yield rate tracking
- **🔐 Authorized Minting:** Only Economy contract can mint properties
- **📈 Income Generation:** Properties generate daily LIFE token income
- **⬆️ Level System:** Properties can be upgraded from level 1-10
- **🔄 Ownership Tracking:** Tracks ownership duration for holding bonuses
- **💰 Buyback System:** Properties can be sold back to contract

#### Property Types & Economics:
| Type | Base Price | Base Status Points | Base Yield Rate | Daily Income (Level 1) |
|------|------------|-------------------|-----------------|------------------------|
| **Apartment** | 500 LIFE | 50 | 2% (200 bp) | ~0.02 LIFE |
| **House** | 1,000 LIFE | 100 | 3% (300 bp) | ~0.03 LIFE |
| **Land** | 750 LIFE | 75 | 1% (100 bp) | ~0.01 LIFE |
| **Office** | 2,000 LIFE | 200 | 5% (500 bp) | ~0.10 LIFE |
| **Mansion** | 5,000 LIFE | 500 | 8% (800 bp) | ~0.40 LIFE |

#### Level System:
- **Price Multiplier:** +20% per level above 1
- **Status Points:** Base points × level
- **Yield Rate:** Base rate + 0.5% per level above 1
- **Example:** Level 3 House = 1,400 LIFE, 300 status points, 4% yield

#### Key Functions:
- `mintProperty(address to, string name, string propertyType, string location, uint256 level, uint256 purchasePrice, string tokenURI)` - Mint property NFT
- `getProperty(uint256 tokenId)` - Get complete property information
- `getPropertiesByOwner(address owner)` - Get all properties owned by address
- `getTotalStatusPoints(address owner)` - Get user's total status points from properties
- `upgradeProperty(uint256 tokenId)` - Upgrade property level (owner only)
- `burn(uint256 tokenId)` - Burn property (authorized only, for buyback system)
- `getOwnershipDuration(uint256 tokenId)` - Get how long current owner has held property

---

### 3. LimitedEdition Contract
**Address:** `[TO_BE_UPDATED_ON_DEPLOYMENT]`  
**Type:** ERC-721 Upgradeable (UUPS Pattern)

#### Production Features:
- **🎨 Limited Edition NFTs:** Special collectible NFTs with unique designs
- **🏆 Template System:** Pre-configured templates with rarity and status points
- **💎 Rarity Levels:** Common, Rare, Epic, Legendary with varying status points
- **📊 Status Points:** Contribute to user's overall status score
- **🔢 Supply Management:** Maximum supply limits per template
- **🎪 Seasonal Collections:** Time-limited collections with special themes
- **🔐 Authorized Minting:** Only Economy contract can mint
- **⚡ Template Management:** Owner can create and manage templates

#### Template System:
- **Template Creation:** Owner can create new limited edition templates
- **Supply Control:** Each template has a maximum supply limit
- **Pricing:** Dynamic pricing based on rarity and demand
- **Season Support:** Templates can be tied to specific seasons
- **Status Contribution:** Each NFT contributes fixed status points

#### Key Functions:
- `mintLimitedEdition(address to, string templateName, string tokenURI)` - Mint limited edition from template
- `mint(address to, string name, string rarity, uint256 statusPoints)` - Direct mint (legacy support)
- `createTemplate(string templateName, string category, string rarity, uint256 statusPoints, uint256 maxSupply, uint256 purchasePrice, string season)` - Create new template
- `getLimitedEdition(uint256 templateId)` - Get limited edition template info
- `getTotalStatusPoints(address owner)` - Get user's total status points from limited editions
- `getUserStatusPoints(address user)` - Get user's status points (public view)
- `updateTemplateStatus(string templateName, bool isActive)` - Enable/disable template

---

### 4. PlayerRegistry Contract
**Address:** `[TO_BE_UPDATED_ON_DEPLOYMENT]`  
**Type:** Registry Contract (Upgradeable)

#### Production Features:
- **👥 Player Management:** Centralized player data and registration
- **📊 Status Score Aggregation:** Combines status from all sources with configurable weights
- **🏆 Leaderboard System:** Global and regional rankings with seasonal resets
- **🌍 Regional Tracking:** Players grouped by geographic regions
- **⚖️ Weighted Scoring:** Configurable weights for different status sources
- **🔄 Real-time Updates:** Automatic updates when players make purchases
- **🎯 Season Management:** Support for seasonal competitions and resets

#### Status Score Calculation:
The total status score is calculated using weighted components:
- **LIFE Token Balance** (30% weight): Normalized balance contribution
- **Property Status Points** (40% weight): Combined points from all properties
- **Limited Edition Points** (20% weight): Combined points from limited edition NFTs
- **Lifetime Check-ins** (10% weight): Bonus for consistent participation

#### Regional Features:
- Players are grouped by region (set during LIFE token claim)
- Regional leaderboards for local competition
- Regional statistics and analytics
- Support for region-specific events

#### Key Functions:
- `registerPlayer(address player)` - Register new player (requires region from LIFE contract)
- `updatePlayerData(address player)` - Recalculate player's total status score
- `getPlayerData(address player)` - Get comprehensive player information
- `getGlobalLeaderboard(uint256 limit)` - Get top global players
- `getRegionalLeaderboard(string region, uint256 limit)` - Get top regional players
- `getPlayerRank(address player)` - Get player's global and regional rank
- `calculateStatusScore(uint256 lifeBalance, uint256 propertyPoints, uint256 limitedPoints, uint256 checkIns)` - Calculate weighted status score
- `updateStatusWeights(uint256 lifeWeight, uint256 propertyWeight, uint256 limitedWeight, uint256 checkInWeight)` - Update scoring weights (owner only)
- `startNewSeason()` - Start new competitive season (owner only)

---

### 5. Economy Contract
**Address:** `[TO_BE_UPDATED_ON_DEPLOYMENT]`  
**Type:** Economy Hub (Upgradeable)

#### Production Features:
- **💰 Central Economic Hub:** Manages all token flows and NFT purchases
- **🏠 Property Marketplace:** Purchase properties with LIFE or WLD tokens
- **🎨 Limited Edition Sales:** Buy limited edition NFTs from templates
- **💸 Fee Management:** Transparent fee structure with treasury and dev allocations
- **🔄 Token Exchange:** Convert between WLD and LIFE tokens
- **📈 Income Generation:** Properties generate daily LIFE token income
- **💰 Buyback System:** Sell properties back to contract for 75% value
- **🎯 Player Integration:** Automatic player registration and updates
- **⚡ Reentrancy Protection:** Comprehensive security against attacks

#### Economic Parameters:
- **Treasury Fee:** 5% (500 basis points) on all purchases
- **Development Fee:** 2% (200 basis points) on all purchases
- **Total Fee:** 7% on purchases (goes to treasury and dev wallets)
- **WLD to LIFE Rate:** 1 WLD = 100 LIFE tokens
- **Buyback Rate:** 75% of original purchase price
- **Base Income Rate:** 1 LIFE token per day base rate
- **Holding Bonus:** 0.1% additional per day of ownership (max 50%)
- **Max Holding Bonus:** 50% after 500 days of ownership

#### Income System:
Properties generate daily income based on:
1. **Base Rate:** 1 LIFE token per day
2. **Level Multiplier:** Property level affects income
3. **Yield Rate:** Property type affects yield (1%-8%)
4. **Holding Bonus:** Increases over time (max 50% after 500 days)
5. **Formula:** `(baseRate × level × yieldRate × days × (1 + holdingBonus)) / 10000`

#### Key Functions:
- `purchaseProperty(string propertyType, string name, string location, uint256 level, bool useWLD, string tokenURI)` - Buy property NFT
- `purchaseLimitedEdition(string templateName, bool useWLD, string tokenURI)` - Buy limited edition NFT
- `sellPropertyToContract(uint256 tokenId)` - Sell property back for 75% value
- `claimPropertyIncome(uint256 tokenId)` - Claim daily income from single property
- `claimAllPropertyIncome(uint256[] tokenIds)` - Claim income from multiple properties
- `calculatePropertyIncome(uint256 tokenId)` - Calculate pending income for property
- `calculateBuybackPrice(uint256 tokenId)` - Calculate buyback value
- `convertWldToLife(uint256 wldAmount)` - Calculate WLD to LIFE conversion
- `convertLifeToWld(uint256 lifeAmount)` - Calculate LIFE to WLD conversion
- `getPropertyPrice(string propertyType)` - Get current property pricing
- `getLimitedEditionPrice(string templateName)` - Get limited edition pricing
- `getPurchaseStats(address user)` - Get user's purchase statistics

---

### 6. World ID Integration (Production)
**World ID Router:** `0x17B354dD2595411ff79041f930e491A4Df39A278`  
**Type:** Production World ID Router (Live on Worldchain)

#### Production Features:
- **🔐 Real Orb Verification:** Uses actual World ID orb verification system
- **🛡️ Sybil Resistance:** Prevents duplicate accounts through nullifier tracking
- **🌍 Global Verification:** Connects to Worldcoin's global verification network
- **⚡ Instant Verification:** Real-time proof verification on-chain
- **🎯 Production Ready:** Live system handling real user verifications

#### Previous Mock System (Deprecated):
- **MockWorldIDAddressBook:** `0xf7D6017CA009c8Abe2A3f43E463Dd1a1CFe5af5A` (Testing only)
- **Development Testing:** Used for local development and testing
- **Replaced:** Now uses real World ID Router for production security

---

## Contract Interactions & User Flow

### Production User Journey:
1. **🔐 World ID Verification:** User completes orb verification at World ID location
2. **💰 Claim LIFE Tokens:** User claims daily LIFE + signing bonus (sets region)
3. **👤 Player Registration:** Automatic registration in PlayerRegistry (region-based)
4. **🏠 Purchase Properties:** Buy properties with LIFE or WLD tokens
5. **📈 Generate Income:** Properties generate daily LIFE token income
6. **💸 Claim Income:** Users claim accumulated income from properties
7. **🏆 Compete:** Participate in global and regional leaderboards

### Authorization Flow:
1. **Economy Contract** is authorized as:
   - **LIFE Token Minter:** Can mint income rewards
   - **Property Minter:** Can mint property NFTs
   - **LimitedEdition Minter:** Can mint limited edition NFTs
   - **PlayerRegistry Updater:** Can update player data

2. **PlayerRegistry** aggregates data from:
   - **LIFE Token:** Balance and lifetime check-ins
   - **Property Contract:** Status points and ownership count
   - **LimitedEdition Contract:** Status points from collectibles

### Economic Flow:
1. **Purchase Fees:** 7% total (5% treasury, 2% dev) on all purchases
2. **Income Generation:** Properties generate daily LIFE based on type and level
3. **Holding Bonuses:** Long-term ownership increases income (up to 50% after 500 days)
4. **Buyback System:** Properties can be sold back for 75% of purchase price
5. **Status Competition:** Players compete on global and regional leaderboards

### Status Score Calculation:
**Weighted Formula:**
- **LIFE Balance** (30%): Normalized token balance
- **Property Points** (40%): Base points × level for each property
- **Limited Edition Points** (20%): Fixed points based on rarity
- **Lifetime Check-ins** (10%): Consistency bonus for daily participation

**Example Calculation:**
- User with 5,000 LIFE, Level 3 House (300 points), Epic NFT (200 points), 50 check-ins
- Score = (5000 × 0.3) + (300 × 0.4) + (200 × 0.2) + (50 × 0.1) = 1,500 + 120 + 40 + 5 = **1,665 points**

---

## Production Integration Guide

### Frontend Configuration (Update After Deployment):
```typescript
export const CONTRACTS = {
  LIFE_TOKEN: "[UPDATE_AFTER_DEPLOYMENT]",
  ECONOMY: "[UPDATE_AFTER_DEPLOYMENT]", 
  PROPERTY: "[UPDATE_AFTER_DEPLOYMENT]",
  LIMITED_EDITION: "[UPDATE_AFTER_DEPLOYMENT]",
  PLAYER_REGISTRY: "[UPDATE_AFTER_DEPLOYMENT]",
  WORLD_ID_ROUTER: "0x17B354dD2595411ff79041f930e491A4Df39A278", // Production Router
  WLD_TOKEN: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" // Worldchain WLD
};

export const WORLDCHAIN_CONFIG = {
  chainId: 480,
  name: "Worldchain Mainnet",
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  blockExplorer: "https://explorer.worldcoin.org"
};

export const WORLD_ID_CONFIG = {
  appId: "app_960683747d9e6074f64601c654c8775f",
  action: "proof-of-life",
  verification_level: VerificationLevel.Orb // Orb verification required
};
```

### Critical Integration Requirements:
1. **🔐 World ID Orb Verification:** Must be completed before any other actions
2. **💰 LIFE Token Claiming:** Required before purchases (sets user region)
3. **🏠 Property Purchases:** Use Economy contract with proper user verification
4. **📈 Income Claiming:** Properties generate daily income after 24 hours
5. **🏆 Status Tracking:** PlayerRegistry for leaderboards and rankings

### Required User Flow Implementation:
```typescript
// 1. World ID Verification
const proof = await worldIdVerification();

// 2. Claim LIFE Tokens (sets region)
await lifeContract.claimWithOrbVerification(signal, root, nullifierHash, proof, region);

// 3. Now user can purchase properties
await economyContract.purchaseProperty(type, name, location, level, useWLD, tokenURI);

// 4. Claim income after 24+ hours
await economyContract.claimPropertyIncome(tokenId);
```

### Security Notes:
- ✅ Only orb-verified humans can participate
- ✅ Nullifier tracking prevents Sybil attacks
- ✅ Region-based competition and tracking
- ✅ Comprehensive access controls
- ✅ Reentrancy protection on all critical functions

---

## Production Security Features

### Maximum Security Implementation:
- **🔐 World ID Orb Verification:** Only orb-verified humans can participate
- **🛡️ Sybil Resistance:** Nullifier tracking prevents duplicate accounts
- **🔒 Access Control:** Role-based permissions with OpenZeppelin standards
- **⚡ Reentrancy Protection:** Comprehensive guards against reentrancy attacks
- **🔄 Upgradeable Contracts:** All contracts use UUPS proxy pattern for future improvements
- **💰 Transparent Economics:** Clear fee structure with treasury allocation
- **📊 Audit Trail:** Complete event logging for all critical operations
- **🎯 Signal Validation:** Prevents address spoofing in World ID proofs

### Production Deployment Features:
- **Real World ID Router:** Uses production Worldcoin infrastructure
- **Nullifier Database:** Prevents proof replay attacks
- **Regional Segregation:** Fair competition through geographic grouping
- **Income Verification:** Properties generate verified daily income
- **Economic Sustainability:** Buyback system and holding incentives

---

## Production Status & Next Steps

### ✅ Current Status: PRODUCTION READY
- **Smart Contracts:** Fully tested and verified
- **World ID Integration:** Production router configured
- **Economic Model:** Sustainable tokenomics implemented
- **Security:** Maximum protection against attacks
- **User Experience:** Complete flow from verification to income

### 🚀 Deployment Commands:
```bash
# Deploy to production with real World ID
USE_REAL_WORLD_ID=true npx hardhat run deploy-production.js --network worldchain

# Verify deployment
npx hardhat run verify-production.js --network worldchain

# Test with real users
node test-real-worldid-flow.js
```

### 📋 Post-Deployment Checklist:
- [ ] Update contract addresses in frontend
- [ ] Test complete user flow with orb-verified users
- [ ] Monitor contract interactions on Worldchain explorer
- [ ] Set up analytics and user support
- [ ] Launch community engagement

---

## Development & Testing Resources

### Testing Scripts Available:
- `test-real-worldid-flow.js` - Test World ID integration
- `test-production-flow.js` - Test complete economic flow
- `verify-production.js` - Verify deployment configuration
- `deploy-production.js` - Automated production deployment

### Documentation:
- `FRONTEND_INTEGRATION_GUIDE.md` - Complete frontend implementation guide
- `USER_EDUCATION_GUIDE.md` - User onboarding and education
- `DEPLOYMENT_COMMANDS.md` - Production deployment reference
- `IMMEDIATE_ACTION_ITEMS_COMPLETED.md` - Implementation summary

---

*Last Updated: December 2024*  
*Status: Production Ready with Real World ID Integration*  
*Network: Worldchain Mainnet (Chain ID: 480)*  
*Security Level: Maximum (Orb-verified humans only)*