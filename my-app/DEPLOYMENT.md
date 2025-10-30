# Coolify Deployment Guide

This guide will help you deploy the Proof of Life Web3 Mini App to your Coolify server.

## Prerequisites

1. A running Coolify server
2. Access to your Coolify dashboard
3. Your GitHub repository URL: `https://github.com/tasksouq/proof-of-life.git`
4. Domain name configured for your deployment

## Deployment Steps

### 1. Create New Application in Coolify

1. Log into your Coolify dashboard
2. Click "New Resource" → "Application"
3. Choose "Public Repository"
4. Enter repository URL: `https://github.com/tasksouq/proof-of-life.git`
5. Set the build pack to "Docker"
6. Set the root directory to: `MiniAppWeb3template/my-app`

### 2. Configure Build Settings

- **Build Command**: `docker build -t proof-of-life .`
- **Start Command**: `docker run -p 3000:3000 proof-of-life`
- **Port**: `3000`
- **Dockerfile Path**: `./Dockerfile`

### 3. Environment Variables

Add the following environment variables in Coolify:

#### Required Variables
```
NEXT_PUBLIC_WLD_APP_ID=app_YOUR_MINI_APP_ID_HERE
NEXT_PUBLIC_WLD_ACTION_ID=your-action-id-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here
APP_ID=app_YOUR_MINI_APP_ID_HERE
NEXTAUTH_SECRET=generate_a_random_secret_key_for_production
NEXTAUTH_URL=https://your-domain.com
```

#### Blockchain Configuration
```
NEXT_PUBLIC_CHAIN_ID=480
NEXT_PUBLIC_NETWORK_NAME=Worldchain
NEXT_PUBLIC_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
NEXT_PUBLIC_BLOCK_EXPLORER=https://explorer.worldcoin.org
```

#### Contract Addresses (Update with your deployed contracts)
```
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=YOUR_LIFE_TOKEN_ADDRESS_HERE
NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS=YOUR_PROPERTY_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_LIMITED_EDITION_ADDRESS=YOUR_LIMITED_EDITION_ADDRESS_HERE
NEXT_PUBLIC_PLAYER_REGISTRY_ADDRESS=YOUR_PLAYER_REGISTRY_ADDRESS_HERE
NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS=0xC49e59216Ae053586F416fEde49b1A9d2B290a29
NEXT_PUBLIC_WORLD_ID_ADDRESS_BOOK=YOUR_WORLD_ID_ADDRESS_BOOK_HERE
```

#### Production Optimizations
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Domain Configuration

1. In Coolify, go to your application settings
2. Add your domain name
3. Enable SSL/TLS certificate (Let's Encrypt)
4. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to match your domain

### 5. Deploy

1. Click "Deploy" in Coolify
2. Monitor the build logs
3. Once deployed, test your application

## Health Check

The application includes a health check endpoint. You can configure Coolify to use:
- **Health Check Path**: `/api/health`
- **Health Check Port**: `3000`

## Troubleshooting

### Build Issues
- Ensure the root directory is set to `MiniAppWeb3template/my-app`
- Check that all environment variables are properly set
- Review build logs for specific error messages

### Runtime Issues
- Verify all contract addresses are correct
- Ensure your domain is properly configured
- Check that World ID app configuration matches your environment variables

### Performance Optimization
- The Dockerfile uses multi-stage builds for optimal image size
- Static assets are properly cached
- The application runs in production mode

## Monitoring

Consider setting up monitoring for:
- Application uptime
- Response times
- Error rates
- Resource usage

## Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Trigger a new deployment in Coolify
3. Monitor the deployment process

## Support

If you encounter issues:
1. Check Coolify logs
2. Verify environment variables
3. Test locally with Docker first
4. Review the application logs