# 🚀 Frontend Update Guide - Production Deployment

## Current Issue
Your frontend at [https://proof-of-life.vercel.app/](https://proof-of-life.vercel.app/) is showing:
- ❌ "contract_inactive" 
- ❌ "0 balance"
- ❌ "0 supply"

This is because it's still pointing to old/inactive contracts instead of your new production contracts.

---

## ✅ Solution: Update Environment Variables

### Step 1: Copy Production Environment Variables

Copy the contents of `frontend-env-production.txt` to your frontend's `.env.local` file:

```bash
# In your frontend project (my-app/ directory)
cp ../smart-contract/frontend-env-production.txt .env.local
```

Or manually copy these variables:

```env
# ⚠️ CRITICAL: Your frontend app URL
NEXT_PUBLIC_APP_URL=https://proof-of-life.vercel.app

# Production Contract Addresses (LIVE ON WORLDCHAIN)
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=0xCb60B6C6f44138Eef5d8e0ABECcA4Ad34Db16B68
NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS=0xa9df17292D42Ce503daBE61ec3da107E45E836C9
NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS=0xaECD39A7aFE6C34Fbd76446d95EbB2D97eA6B070
NEXT_PUBLIC_LIMITED_EDITION_ADDRESS=0xd31AeDF0d364e17363BaBB5164DBC64e42d9A34e
NEXT_PUBLIC_PLAYER_REGISTRY_ADDRESS=0x292B0D28b54F241ad230eba9Cdc235c6B7A6FF57
NEXT_PUBLIC_WORLD_ID_ROUTER_ADDRESS=0x17B354dD2595411ff79041f930e491A4Df39A278
NEXT_PUBLIC_WLD_CONTRACT_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=480
NEXT_PUBLIC_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public

# World ID Configuration (Production)
NEXT_PUBLIC_WORLD_ID_APP_ID=app_960683747d9e6074f64601c654c8775f
NEXT_PUBLIC_WORLD_ID_ACTION=proof-of-life

# Alternative World ID Environment Variable Names (Legacy Support)
NEXT_PUBLIC_WLD_APP_ID=app_960683747d9e6074f64601c654c8775f
NEXT_PUBLIC_WLD_ACTION_ID=proof-of-life
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_960683747d9e6074f64601c654c8775f

# Frontend Environment (Required for MiniKit)
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_NODE_ENV=production
```

### Step 2: Update Vercel Environment Variables

If you're using Vercel for deployment, you need to update the environment variables in your Vercel dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`proof-of-life`)
3. Go to Settings → Environment Variables
4. Add/Update each `NEXT_PUBLIC_*` variable from the list above
5. Redeploy your application

### Step 3: Verify Local Development

Test locally first:

```bash
# In your frontend directory
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000` and check that:
- ✅ Contract addresses are loaded correctly
- ✅ LIFE token balance shows correct values
- ✅ Total supply shows 1,000,000 LIFE (dev premint)
- ✅ Network shows "Worldchain (480)"

---

## 🔍 Debug Your Current Setup

### Check Current Environment Variables

In your browser console on your live app, run:

```javascript
// Check if environment variables are loaded
console.log('Environment Check:', {
  lifeToken: process?.env?.NEXT_PUBLIC_LIFE_TOKEN_ADDRESS,
  economy: process?.env?.NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS,
  chainId: process?.env?.NEXT_PUBLIC_CHAIN_ID,
  rpcUrl: process?.env?.NEXT_PUBLIC_RPC_URL,
  worldIdApp: process?.env?.NEXT_PUBLIC_WORLD_ID_APP_ID
});
```

### Verify Contract Connections

In browser console:

```javascript
// Check if contracts are responding
const lifeAddress = "0xCb60B6C6f44138Eef5d8e0ABECcA4Ad34Db16B68";
console.log('Production LIFE Token:', lifeAddress);

// This should show the new production contract address
console.log('Current frontend config:', window.location.href);
```

---

## 🎯 Expected Results After Update

After updating environment variables and redeploying, your app should show:

- ✅ **contract_active** status
- ✅ **1,000,000.00 LIFE** total supply (dev premint)
- ✅ **Production contract addresses** in network info
- ✅ **World ID orb verification** working
- ✅ **Real blockchain data** from Worldchain mainnet

---

## 🚨 Important Notes

### Required Environment Variables

Your frontend **MUST** have these variables to work:

1. **Contract Addresses** - All 5 production contract addresses
2. **Network Config** - Chain ID 480 and RPC URL
3. **World ID Config** - App ID and action for orb verification
4. **App URL** - Your frontend URL for proper routing

### Deployment Process

1. **Local Testing** - Always test locally first
2. **Environment Variables** - Update all production variables
3. **Vercel Deployment** - Update Vercel environment variables
4. **Cache Clearing** - Clear any cached builds
5. **Verification** - Test live app with real user flow

---

## 📱 Testing with Real Users

Once deployed with production contracts, test with real orb-verified users:

1. **World ID Verification** - User completes orb verification
2. **LIFE Token Claim** - First claim gives 1,000 LIFE + daily 1 LIFE
3. **Property Purchase** - Buy properties with LIFE tokens
4. **Income Generation** - Properties generate daily income
5. **Leaderboard** - Users appear on global/regional leaderboards

---

## 🛠️ Troubleshooting

### Common Issues

**"Contract not found" errors:**
- Check contract addresses are correct
- Verify network is Worldchain (480)
- Ensure RPC URL is working

**"0 balance" showing:**
- Contract addresses might be wrong
- Network mismatch (check chain ID)
- RPC connection issues

**World ID not working:**
- Check app ID matches production: `app_960683747d9e6074f64601c654c8775f`
- Verify action is "proof-of-life"
- Ensure orb verification is required

### Quick Fixes

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Force refresh Vercel deployment
git commit --allow-empty -m "Force redeploy with production contracts"
git push origin main
```

---

**🌍 Your human-verified token economy is ready to launch! ✨**

*After updating these environment variables, your app will connect to the live production contracts on Worldchain!*
