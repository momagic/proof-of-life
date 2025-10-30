# Coolify Deployment Guide - Proof of Life App

## Overview

This Proof of Life application is optimized for deployment on Coolify using standard Next.js Docker configuration. The app includes a Next.js frontend with Worldcoin integration, smart contract interactions, and MiniKit Pay functionality.

## Deployment Configuration

### Approach
Following proven deployment patterns, this app uses **standard Next.js build** approach for optimal Coolify compatibility:

- **Docker Configuration**: Multi-stage build with standard Next.js output
- **Build Process**: Standard `npm build` without standalone mode
- **Runtime**: Uses `npm start` command for production server
- **Environment**: `ENABLE_STANDALONE=false` for deployment builds

### Dockerfile Optimizations

The Dockerfile has been optimized for Coolify deployment:
- Multi-stage build process for smaller image size
- Proper user permissions and security
- Standard Next.js runtime without standalone complexity
- Port 3000 exposed with proper environment variables
- Uses `npm start` instead of standalone server.js

### Next.js Configuration

The `next.config.js` is configured for deployment compatibility:
- Standalone mode explicitly disabled
- ESLint and TypeScript errors ignored during builds (for faster deployment)
- Environment-based configuration support

## Environment Variables for Coolify

Set these environment variables in your Coolify deployment dashboard:

### Required Core Variables
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
ENABLE_STANDALONE=false
```

### Worldcoin Configuration
```
NEXT_PUBLIC_WLD_APP_ID=app_YOUR_MINI_APP_ID_HERE
NEXT_PUBLIC_WLD_ACTION_ID=your-action-id-here
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_a_random_secret_key_for_production
NEXTAUTH_URL=https://your-domain.com
```

### Smart Contract Configuration (Worldchain Mainnet)
```
NEXT_PUBLIC_CHAIN_ID=480
NEXT_PUBLIC_NETWORK_NAME=Worldchain
NEXT_PUBLIC_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
NEXT_PUBLIC_BLOCK_EXPLORER=https://explorer.worldcoin.org
```

### Contract Addresses
```
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=0xE4D62e62013EaF065Fa3F0316384F88559C80889
NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS=0xbb457f7eD8e9d3bEb45DfdEa40BD7413556D4983
NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS=0xd58fCd9b3185aD4421F4b154341147C13e8dE2C5
NEXT_PUBLIC_ECONOMY_V2_ADDRESS=0xf1E488c97BC7C1Dec98234562B753864ee78A771
NEXT_PUBLIC_PROPERTY_V2_ADDRESS=0xdD180a7c50459Adf7D733966D73d5a7EED8b66f2
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003
```

## Coolify Setup Steps

### 1. Repository Configuration
- Ensure your code is pushed to GitHub: `https://github.com/momagic/proof-of-life`
- The repository is already configured and ready for deployment

### 2. Coolify Project Setup
1. Create a new project in Coolify
2. Connect your GitHub repository
3. Set the build context to `/my-app` (important!)
4. Select the Dockerfile deployment method

### 3. Environment Variables
1. Go to your project's Environment Variables section
2. Copy all variables from `.env.production`
3. Update the following with your actual values:
   - `NEXT_PUBLIC_APP_URL` (your domain)
   - `NEXTAUTH_URL` (your domain)
   - `NEXT_PUBLIC_WLD_APP_ID` (your Worldcoin app ID)
   - `NEXT_PUBLIC_WLD_ACTION_ID` (your action ID)
   - `DEV_PORTAL_API_KEY` (your API key)
   - `NEXTAUTH_SECRET` (generate a secure random string)

### 4. Build Configuration
- **Build Context**: `/my-app`
- **Dockerfile Path**: `Dockerfile` (in the my-app directory)
- **Port**: `3000`
- **Health Check**: `/` (optional)

### 5. Domain Configuration
1. Add your custom domain in Coolify
2. Enable SSL/TLS certificates
3. Update environment variables with your actual domain

## Build Commands

- **Local development**: `npm run dev`
- **Local build**: `npm run build`
- **Production start**: `npm start`
- **Deployment build**: Handled automatically by Docker

## Port Configuration

The application runs on port 3000 by default. Coolify will automatically handle port mapping.

## Important Notes

### Build Context
⚠️ **Critical**: Set the build context to `/my-app` in Coolify, not the root directory. The Dockerfile and application code are in the `my-app` subdirectory.

### Environment Variables
- All environment variables from `.env.production` must be set in Coolify
- Update placeholder values with your actual configuration
- The `ENABLE_STANDALONE=false` variable is crucial for proper deployment

### Smart Contract Integration
- The app is configured for Worldchain mainnet
- Contract addresses are already set for production
- Ensure your Worldcoin app is properly configured for your domain

## Troubleshooting

### Common Issues
1. **Build Context Error**: Ensure build context is set to `/my-app`
2. **Environment Variables**: Verify all required variables are set
3. **Domain Configuration**: Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`
4. **Port Issues**: Application should run on port 3000

### Build Logs
If deployment fails:
1. Check Coolify build logs for dependency or build errors
2. Verify environment variables are properly set
3. Ensure the Docker build completes all stages successfully
4. Check that the build context is correctly set to `/my-app`

### Performance
- The standard build approach provides better compatibility with Coolify
- Build times may be longer than standalone mode but deployment is more reliable
- The multi-stage Docker build optimizes the final image size

## Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Application starts on port 3000
- ✅ Health checks pass
- ✅ Domain resolves correctly
- ✅ Worldcoin integration works
- ✅ Smart contract interactions function properly

## Support

If you encounter issues:
1. Check the Coolify build and runtime logs
2. Verify environment variable configuration
3. Ensure your domain DNS is properly configured
4. Test the application locally with the same environment variables