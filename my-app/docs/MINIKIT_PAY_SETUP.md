# MiniKit Pay Setup Guide

This guide will help you complete the setup for MiniKit Pay in your application.

## 🚨 Critical Steps Required

### 1. Get Your Developer Portal API Key

✅ **App ID Already Configured**: Your `NEXT_PUBLIC_WLD_APP_ID` is already set to `app_960683747d9e6074f64601c654c8775f`

Now you just need the API key:

1. Go to [World Developer Portal](https://developer.worldcoin.org/)
2. Sign in with your World ID
3. Navigate to your app: `app_960683747d9e6074f64601c654c8775f`
4. Go to the **API Keys** section
5. Generate a new API key
6. Copy the API key

### 2. Update Environment Variables

Replace the placeholder in your `.env.production` file:

```bash
# Replace this placeholder with your actual API key
DEV_PORTAL_API_KEY="your_actual_dev_portal_api_key_here"
```

### 3. Whitelist Your Economy Contract

**This is the most critical step!** Your Economy contract must be whitelisted to accept payments.

1. In the [World Developer Portal](https://developer.worldcoin.org/)
2. Go to your app settings
3. Navigate to **MiniKit Pay** or **Payment Settings**
4. Add your Economy contract address to the whitelist:
   ```
   0xC49e59216Ae053586F416fEde49b1A9d2B290a29
   ```
5. Make sure to specify the network: **Worldchain Mainnet**
6. Save the settings

### 4. Verify Contract Addresses

Ensure these contract addresses are correct in your environment:

- **Economy Contract**: `0xC49e59216Ae053586F416fEde49b1A9d2B290a29`
- **LIFE Token**: `0xa1d119264C1D84756f02abd8c06dA44911349749`
- **Network**: Worldchain (Chain ID: 480)

## 🔧 What Was Fixed

### 1. Environment Variables
- Added `DEV_PORTAL_API_KEY` for payment verification
- Added `APP_ID` for MiniKit Pay configuration

### 2. Payment Implementation
- **Before**: Used `sendTransaction` for LIFE token approval (caused "disallowed_operation" error)
- **After**: Uses MiniKit Pay command for both WLD and LIFE payments
- Proper token amount formatting with `ContractUtils.formatTokenAmount()`
- Added network specification for LIFE tokens

### 3. Payment Flow
Both WLD and LIFE payments now follow the same secure flow:
1. Initiate payment on backend (`/api/initiate-payment`)
2. Use MiniKit Pay command with proper payload
3. Verify payment with World Developer Portal API (`/api/confirm-payment`)
4. Mint property using Economy contract

## 🧪 Testing

After completing the setup:

1. **Test WLD Payment**:
   - Select a property type
   - Choose "WLD" as payment method
   - Confirm the payment in World App

2. **Test LIFE Payment**:
   - Select a property type  
   - Choose "LIFE" as payment method
   - Confirm the payment in World App

## 🚨 Troubleshooting

### "disallowed_operation" Error
- **Cause**: Economy contract not whitelisted in Developer Portal
- **Solution**: Complete step 3 above (whitelist contract)

### "Payment verification failed"
- **Cause**: Missing or incorrect `DEV_PORTAL_API_KEY`
- **Solution**: Complete steps 1-2 above

### "World App is required"
- **Cause**: App not running in World App environment
- **Solution**: Open the app in World App mobile application

## 📚 Resources

- [MiniKit Pay Documentation](https://docs.world.org/mini-apps/commands/pay)
- [World Developer Portal](https://developer.worldcoin.org/)
- [Worldchain Explorer](https://explorer.worldcoin.org/)

---

**Next Steps**: Complete the whitelisting process in the Developer Portal, then test both payment methods!