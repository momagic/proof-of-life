# LIFE Token Deployment Guide for Worldchain

This guide will help you deploy the LIFE token contract to Worldchain mainnet.

## Prerequisites

1. **Wallet Setup**: You need a wallet with ETH on Worldchain for gas fees
2. **Private Key**: Export your private key from MetaMask or your preferred wallet
3. **Worldchain Network**: Add Worldchain to your wallet if not already added

### Worldchain Network Details
- **Network Name**: Worldchain Mainnet
- **RPC URL**: `https://worldchain-mainnet.g.alchemy.com/public`
- **Chain ID**: `480`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://explorer.worldcoin.org`

Note: World Chain is built on the OP Stack and part of the Superchain; it is EVM-equivalent and uses Ethereum for data availability and finality.

## Step-by-Step Deployment

### 1. Configure Environment Variables

Edit the `.env` file in the smart-contract directory:

```bash
# Replace with your actual private key (without 0x prefix)
PRIVATE_KEY="your-actual-private-key-here"

# Use public RPC or get your own from Alchemy
WORLDCHAIN_RPC_URL="https://worldchain-mainnet.g.alchemy.com/public"

# Optional: For contract verification
WORLDCHAIN_API_KEY="your-worldchain-api-key-here"
```

**⚠️ SECURITY WARNING**: Never commit your `.env` file to version control!

### 2. Get Worldchain ETH

You need ETH on Worldchain to pay for gas fees. You can:
- Bridge ETH from Ethereum mainnet to Worldchain
- Use the official Worldchain bridge at [bridge.worldcoin.org](https://bridge.worldcoin.org)

### 3. Deploy the Contract

Run the deployment command:

```bash
pnpm deploy:worldchain
```

Or manually:

```bash
pnpm hardhat run scripts/deploy.js --network worldchain
```

### 4. Verify Deployment

The deployment script will output:
- Contract addresses
- Transaction hashes
- Network information
- Deployment summary

**Save this information!** You'll need the contract addresses for your frontend.

### 5. Verify Contract (Optional)

To verify your contract on the Worldchain explorer:

```bash
pnpm hardhat verify --network worldchain <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
pnpm hardhat verify --network worldchain 0x1234... 0x5678...
```

## What Gets Deployed

1. **MockWorldIDAddressBook**: A mock contract for testing WorldID integration
2. **LIFE Token**: The main ERC-20 token contract with:
   - Daily claim functionality (1 LIFE per day)
   - Signing bonus (1000 LIFE for first-time users)
   - WorldID integration (currently disabled for testing)

## Contract Features

- **Token Name**: LIFE
- **Token Symbol**: LIFE
- **Daily Claim**: 1 LIFE token every 24 hours
- **Signing Bonus**: 1000 LIFE tokens for new users
- **WorldID Integration**: Ready for proof-of-life verification

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Make sure you have enough ETH on Worldchain
2. **"Invalid private key"**: Check your private key format (no 0x prefix)
3. **"Network error"**: Verify your RPC URL and internet connection

### Getting Help

- Check the [Worldchain documentation](https://docs.worldcoin.org)
- Visit the [Worldchain explorer](https://explorer.worldcoin.org)
- Join the Worldcoin Discord for community support

## Next Steps

After successful deployment:

1. **Update Frontend**: Add the contract addresses to your React app
2. **Test Integration**: Test the claim functionality
3. **Enable WorldID**: Uncomment WorldID verification when ready
4. **Monitor**: Keep track of your contract on the explorer

## Security Notes

- Keep your private key secure and never share it
- Consider using a hardware wallet for mainnet deployments
- Test thoroughly on testnets before mainnet deployment
- Audit your contracts before handling significant value

---

**Ready to deploy?** Make sure you've:
- ✅ Configured your `.env` file
- ✅ Have ETH on Worldchain
- ✅ Compiled the contracts
- ✅ Reviewed the deployment script

Then run: `pnpm deploy:worldchain`