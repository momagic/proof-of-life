# 🎯 Customer Support Guide - LIFE Token Economy

## Overview
This guide helps your support team assist users with the LIFE token economy on Worldchain. The system requires World ID orb verification and provides property-based income generation.

---

## 🔐 System Requirements

### For Users to Participate
1. **World ID Orb Verification** - Users MUST be orb-verified humans
2. **Worldchain Wallet** - Compatible wallet on Chain ID 480
3. **Small ETH Balance** - For transaction fees (~0.001 ETH)
4. **World ID App** - For proof generation

### Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Web3 wallet extension

---

## 🚨 Common User Issues & Solutions

### Issue 1: "Cannot Claim LIFE Tokens"

**Symptoms:**
- User gets error when trying to claim daily tokens
- Transaction fails or reverts

**Diagnosis Steps:**
1. Check if user has completed World ID orb verification
2. Verify user is on Worldchain network (Chain ID 480)
3. Check if user has claimed within last 24 hours
4. Verify user has small ETH balance for gas

**Solutions:**
```
✅ Not Orb Verified: Direct user to nearest World ID location
✅ Wrong Network: Guide user to switch to Worldchain
✅ Already Claimed: Explain 24-hour cooldown period
✅ No ETH: Instruct user to get ETH on Worldchain
```

**Escalation:** If user claims to be orb-verified but cannot claim, check nullifier usage on contract.

### Issue 2: "Property Purchase Failed"

**Symptoms:**
- Transaction reverts during property purchase
- "Player not registered" error

**Diagnosis Steps:**
1. Verify user has claimed LIFE tokens at least once (auto-registers player)
2. Check user's LIFE token balance vs property price
3. Verify property type is available and active
4. Check if user has sufficient ETH for gas

**Solutions:**
```
✅ Not Registered: User must claim LIFE tokens first (sets region)
✅ Insufficient LIFE: User needs to claim more tokens or buy different property
✅ Property Inactive: Direct user to available property types
✅ Gas Issues: Help user get more ETH for transaction fees
```

### Issue 3: "Cannot Claim Property Income"

**Symptoms:**
- No income generated from properties
- Income claim transaction fails

**Diagnosis Steps:**
1. Check if 24+ hours have passed since property purchase
2. Verify property ownership on blockchain
3. Calculate expected income based on property type and level
4. Check for any contract interaction issues

**Solutions:**
```
✅ Too Early: Explain 24-hour minimum holding period
✅ No Income: Verify property generates income (check yield rate)
✅ Contract Error: Check recent transactions for errors
✅ Calculation Issues: Use income calculator formula
```

### Issue 4: "World ID Verification Problems"

**Symptoms:**
- Cannot generate World ID proof
- "Signal must be sender address" error
- "Nullifier already used" error

**Diagnosis Steps:**
1. Check if user is using correct wallet address as signal
2. Verify user hasn't used this World ID proof before
3. Check World ID app configuration
4. Verify orb verification status

**Solutions:**
```
✅ Wrong Signal: Ensure wallet address matches proof signal
✅ Duplicate Nullifier: Each proof can only be used once
✅ App Config: Verify app ID and action are correct
✅ Not Orb Verified: Complete orb verification first
```

---

## 📊 How to Check User Status

### On Blockchain Explorer (https://explorer.worldcoin.org)

**Check LIFE Balance:**
1. Go to LIFE token contract: `0xCb60B6C6f44138Eef5d8e0ABECcA4Ad34Db16B68`
2. Use "balanceOf" function with user's address
3. Result is in wei (divide by 1e18 for LIFE tokens)

**Check Last Claim Time:**
1. Use "getLastClaimTime" function on LIFE contract
2. Convert timestamp to readable date
3. Add 24 hours to get next claim time

**Check Property Ownership:**
1. Go to Property contract: `0xaECD39A7aFE6C34Fbd76446d95EbB2D97eA6B070`
2. Use "getPropertiesByOwner" function
3. Returns array of owned property token IDs

**Check Player Registration:**
1. Go to PlayerRegistry: `0x292B0D28b54F241ad230eba9Cdc235c6B7A6FF57`
2. Use "getPlayerData" function
3. Check if player is registered and has region set

### Quick Status Check Script
```javascript
// Use this in browser console on block explorer
async function checkUserStatus(userAddress) {
    // This would require contract interaction
    console.log("Checking status for:", userAddress);
    // Implementation would use Web3 provider
}
```

---

## 💰 Economic System Explanation

### Daily LIFE Claim System
- **Amount:** 1 LIFE token per day
- **Requirement:** World ID orb verification
- **Cooldown:** 24 hours between claims
- **Bonus:** 1,000 LIFE tokens for first-time users
- **Region:** User sets region during first claim

### Property System
| Property Type | Price (LIFE) | Price (WLD) | Daily Income | Status Points |
|---------------|-------------|-------------|--------------|---------------|
| Apartment | 500 | 5.0 | ~0.02 LIFE | 50 |
| House | 1,000 | 10.0 | ~0.03 LIFE | 100 |
| Land | 750 | 7.5 | ~0.01 LIFE | 75 |
| Office | 2,000 | 20.0 | ~0.10 LIFE | 200 |
| Mansion | 5,000 | 50.0 | ~0.40 LIFE | 500 |

### Income Calculation
```
Daily Income = (Base Rate × Level × Yield Rate × Days × (1 + Holding Bonus)) / 10000
Base Rate = 1 LIFE per day
Holding Bonus = 0.1% per day (max 50% after 500 days)
```

### Fee Structure
- **Treasury Fee:** 5% on all purchases
- **Development Fee:** 2% on all purchases
- **Total Fees:** 7% (helps fund development and growth)

---

## 🔧 Troubleshooting Tools

### Contract Addresses
```
LIFE Token: 0xCb60B6C6f44138Eef5d8e0ABECcA4Ad34Db16B68
Economy: 0xa9df17292D42Ce503daBE61ec3da107E45E836C9
Property: 0xaECD39A7aFE6C34Fbd76446d95EbB2D97eA6B070
Limited Edition: 0xd31AeDF0d364e17363BaBB5164DBC64e42d9A34e
Player Registry: 0x292B0D28b54F241ad230eba9Cdc235c6B7A6FF57
World ID Router: 0x17B354dD2595411ff79041f930e491A4Df39A278
```

### Network Information
```
Network: Worldchain Mainnet
Chain ID: 480
RPC URL: https://worldchain-mainnet.g.alchemy.com/public
Explorer: https://explorer.worldcoin.org
```

### World ID Configuration
```
App ID: app_960683747d9e6074f64601c654c8775f
Action: proof-of-life
Verification Level: Orb (required)
```

---

## 📞 Escalation Procedures

### Level 1: Basic Support
- Help with wallet setup
- Explain claiming process
- Guide through property purchases
- Answer questions about income

### Level 2: Technical Issues
- Debug contract interactions
- Investigate failed transactions
- Help with World ID verification
- Property income calculations

### Level 3: Critical Issues
- Contract malfunctions
- World ID system problems
- Large-scale user issues
- Security concerns

### Emergency Contacts
- **Development Team:** [Your Contact]
- **World ID Support:** [Worldcoin Support]
- **Blockchain Issues:** [RPC Provider Support]

---

## 📚 User Education Scripts

### "How to Get Started"
```
1. Complete World ID orb verification at a location near you
2. Set up a Web3 wallet and connect to Worldchain network
3. Get a small amount of ETH for transaction fees
4. Visit our app and claim your first LIFE tokens
5. Use LIFE tokens to buy properties and start earning income
```

### "Why World ID is Required"
```
We use World ID orb verification to ensure only real humans can participate in our economy. This prevents bots and fake accounts, making the system fair for everyone. Each person can only have one account.
```

### "How Property Income Works"
```
Properties generate daily LIFE token income. The amount depends on:
- Property type (Mansion earns more than Apartment)
- Property level (can be upgraded)
- How long you've owned it (holding bonus)
- Current yield rates

Income accumulates and can be claimed anytime after 24 hours.
```

---

## 🎯 Success Metrics for Support

### Key Performance Indicators
- **Ticket Resolution Time:** < 24 hours for level 1
- **User Satisfaction:** > 4.5/5 rating
- **First Contact Resolution:** > 80%
- **Escalation Rate:** < 10%

### Common Resolution Times
- Basic questions: 15 minutes
- Wallet issues: 30 minutes
- Contract problems: 1-2 hours
- World ID issues: 2-4 hours (may require external help)

---

## 🔍 Monitoring & Alerts

### Real-time Monitoring
Monitor these events for potential support spikes:
- High transaction failure rates
- World ID verification issues
- Contract errors
- Network congestion

### Proactive Support
- Welcome new users after first claim
- Check in with users having issues
- Provide property purchase guidance
- Share income optimization tips

---

**Remember: Our goal is to help every human thrive in the LIFE token economy! 🌍✨**
