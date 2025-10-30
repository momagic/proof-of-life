# Smart Contract Withdrawal Guide

This guide explains how to withdraw funds from the Economy smart contract using the withdrawal script.

## Overview

The Economy contract has emergency withdrawal functions that allow the contract owner to withdraw:
- **LIFE tokens** - The native game token
- **WLD tokens** - Worldcoin tokens

## Prerequisites

1. **You must be the contract owner** - Only the owner can withdraw funds
2. **Environment setup** - Ensure your `.env` file is configured with:
   ```
   PRIVATE_KEY="your-private-key-here"
   WORLDCHAIN_RPC_URL="https://worldchain-mainnet.g.alchemy.com/public"
   ```
3. **Dependencies installed** - Run `npm install` if you haven't already

## Contract Information

- **Network**: Worldchain Mainnet (Chain ID: 480)
- **Economy Contract**: `0xd58fCd9b3185aD4421F4b154341147C13e8dE2C5` (Updated Economy contract)
- **LIFE Token**: `0xE4D62e62013EaF065Fa3F0316384F88559C80889`
- **WLD Token**: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`

## Usage

### Basic Commands

**⚠️ IMPORTANT**: Always specify the `--network worldchain` parameter to connect to the correct network.

```bash
# Check current balances (no withdrawal)
npm run withdraw -- --network worldchain

# Withdraw all available tokens (recommended)
npm run withdraw -- --network worldchain

# Alternative: Run the script directly with network parameter
npx hardhat run scripts/withdraw-funds.js --network worldchain
```

### Local Testing

```bash
# For local hardhat network testing (development only)
npm run withdraw:local -- --life 100
```

## Command Options

The withdrawal script automatically withdraws all available tokens from the contract when run with the correct network parameter.

| Command | Description | Example |
|---------|-------------|----------|
| `npm run withdraw -- --network worldchain` | Withdraw all available tokens from contract | Main command to use |
| `npx hardhat run scripts/withdraw-funds.js --network worldchain` | Direct script execution | Alternative method |

## Script Features

✅ **Safety Checks**:
- Verifies you are the contract owner
- Checks contract balances before withdrawal
- Validates withdrawal amounts don't exceed available balance

✅ **Comprehensive Logging**:
- Shows current contract balances
- Displays transaction hashes
- Confirms successful withdrawals

✅ **Error Handling**:
- Clear error messages for common issues
- Graceful handling of failed transactions

## Example Output

```
💰 Withdrawing Tokens from Economy Contract
===========================================
Network: worldchain (Chain ID: 480)
Owner: 0xA13A18ccD767B83543212B0424426A374f565Fb8

Contract addresses:
Economy: 0xd58fCd9b3185aD4421F4b154341147C13e8dE2C5
WLD Token: 0x2cFc85d8E48F8EAB294be644d9E25C3030863003

📊 Contract Token Balances:
   LIFE: 0.0 LIFE
   WLD: 5.0 WLD

✅ Ownership verified. Proceeding with withdrawal...

💸 Withdrawing 5.0 WLD tokens...
✅ WLD withdrawal successful! 
   Transaction: 0xc95f951da9171b2ad677683a6f87e9febe11940eefd4d023901b6c41de5aa6e4
   Gas used: 57646

📊 Updated Balances:
   Contract LIFE: 0.0 LIFE
   Contract WLD: 0.0 WLD
   Your LIFE: 1000000.0 LIFE
   Your WLD: 5.0 WLD

✅ Withdrawal completed successfully!
```

## Common Issues

### "execution reverted" or "WLD withdrawal failed"
- **Most Common Cause**: Not using the correct network parameter
- **Solution**: Always use `--network worldchain` parameter
- **Correct Command**: `npm run withdraw -- --network worldchain`
- **Why**: The script defaults to local Hardhat network (Chain ID: 31337) instead of Worldchain Mainnet (Chain ID: 480)

### "You are not the contract owner"
- **Solution**: Ensure you're using the correct private key for the contract owner account
- **Owner Address**: `0xA13A18ccD767B83543212B0424426A374f565Fb8`

### "Contract not found" or "Contract exists: false"
- **Solution**: Verify you're connected to Worldchain Mainnet with `--network worldchain`
- **Check**: The contract exists at `0xd58fCd9b3185aD4421F4b154341147C13e8dE2C5` on Worldchain only

### "Transaction failed"
- **Solution**: Ensure you have enough ETH for gas fees on Worldchain
- **Gas Cost**: Typical withdrawal uses ~60,000 gas

### "Network connection issues"
- **Solution**: Verify your `WORLDCHAIN_RPC_URL` in the `.env` file
- **Default RPC**: `https://worldchain-mainnet.g.alchemy.com/public`

## Security Notes

⚠️ **Important Security Considerations**:

1. **Private Key Security**: Never share your private key or commit it to version control
2. **Owner-Only Functions**: These withdrawal functions are restricted to the contract owner only
3. **Emergency Use**: These are emergency withdrawal functions - use responsibly
4. **Gas Costs**: Each withdrawal requires ETH for gas fees on Worldchain

## Smart Contract Functions Used

The script calls these contract functions from the **EconomyV2** contract:

```solidity
// Withdraw any ERC20 token (owner only) - Used for WLD tokens
function emergencyWithdraw(address token, uint256 amount) external onlyOwner

// Legacy function for LIFE tokens (if available)
function emergencyWithdrawLife(uint256 amount) external onlyOwner

// Legacy function for WLD tokens (if available)  
function emergencyWithdrawWld(uint256 amount) external onlyOwner
```

**Note**: The current EconomyV2 contract uses the generic `emergencyWithdraw` function which can withdraw any ERC20 token by specifying the token address.

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your environment configuration
3. Ensure you have sufficient ETH for gas fees
4. Confirm you're using the correct network (Worldchain)

---

**File Location**: `scripts/withdraw-funds.js`  
**Last Updated**: Updated after successful withdrawal from EconomyV2 contract  
**Contract Type**: EconomyV2 (UUPS Upgradeable)  
**Successful Withdrawal**: 5.0 WLD on 2025-01-27 (TX: 0xc95f951da9171b2ad677683a6f87e9febe11940eefd4d023901b6c41de5aa6e4)