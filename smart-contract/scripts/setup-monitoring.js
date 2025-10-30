const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Production Monitoring Setup
 * Sets up event listeners and monitoring for production contracts
 */

async function setupMonitoring() {
  console.log("📊 Setting Up Production Monitoring...\n");
  
  // Load production deployment info
  const deployment = JSON.parse(fs.readFileSync('./production-deployment.json', 'utf8'));
  const contracts = deployment.contracts;
  
  console.log("📋 Monitoring Configuration:");
  console.log(`Network: Worldchain (${deployment.chainId})`);
  console.log(`Deployer: ${deployment.deployer}`);
  console.log(`Deployed: ${deployment.deployedAt}`);
  
  // Key Events to Monitor
  const monitoringConfig = {
    contracts: {
      life: {
        address: contracts.life,
        events: [
          'DailyRewardClaimed',
          'OrbVerificationCompleted', 
          'Transfer'
        ]
      },
      economy: {
        address: contracts.economy,
        events: [
          'PropertyPurchased',
          'LimitedEditionPurchased',
          'PropertyIncomeClaimed',
          'PropertySoldToContract'
        ]
      },
      property: {
        address: contracts.property,
        events: [
          'Transfer',
          'PropertyMinted',
          'PropertyUpgraded'
        ]
      },
      limitedEdition: {
        address: contracts.limitedEdition,
        events: [
          'Transfer',
          'LimitedEditionMinted'
        ]
      },
      playerRegistry: {
        address: contracts.playerRegistry,
        events: [
          'PlayerRegistered',
          'PlayerDataUpdated',
          'NewSeasonStarted'
        ]
      }
    },
    
    // Analytics Endpoints
    analytics: {
      explorerBase: "https://explorer.worldcoin.org",
      rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
      chainId: 480
    },
    
    // Key Metrics to Track
    metrics: [
      'Daily Active Users (claiming LIFE)',
      'Total Orb Verifications',
      'Property Sales Volume',
      'Limited Edition Sales',
      'Property Income Generated',
      'Player Registrations',
      'Regional Distribution'
    ]
  };
  
  // Generate monitoring dashboard config
  const dashboardConfig = {
    title: "LIFE Token Economy - Production Dashboard",
    contracts: monitoringConfig.contracts,
    
    // Key Performance Indicators
    kpis: [
      {
        name: "Total Users",
        contract: "playerRegistry",
        function: "getTotalPlayers()",
        format: "number"
      },
      {
        name: "Total LIFE Supply",
        contract: "life",
        function: "totalSupply()",
        format: "token"
      },
      {
        name: "Total Properties",
        contract: "property", 
        function: "totalSupply()",
        format: "number"
      },
      {
        name: "Total Limited Editions",
        contract: "limitedEdition",
        function: "totalSupply()",
        format: "number"
      }
    ],
    
    // Event Monitoring
    events: {
      realTime: [
        "DailyRewardClaimed",
        "OrbVerificationCompleted",
        "PropertyPurchased",
        "LimitedEditionPurchased"
      ],
      hourly: [
        "PropertyIncomeClaimed",
        "PlayerRegistered",
        "Transfer"
      ]
    },
    
    // Alerts
    alerts: [
      {
        name: "High Volume Claims",
        condition: "DailyRewardClaimed events > 100/hour",
        severity: "info"
      },
      {
        name: "Large Property Purchase",
        condition: "PropertyPurchased value > 10000 LIFE",
        severity: "info"
      },
      {
        name: "Contract Error",
        condition: "Transaction reverted",
        severity: "warning"
      }
    ]
  };
  
  // Save monitoring configuration
  fs.writeFileSync('./monitoring-config.json', JSON.stringify(monitoringConfig, null, 2));
  fs.writeFileSync('./dashboard-config.json', JSON.stringify(dashboardConfig, null, 2));
  
  console.log("✅ Monitoring config saved to: monitoring-config.json");
  console.log("✅ Dashboard config saved to: dashboard-config.json");
  
  // Generate monitoring scripts
  const webhookScript = `
// Webhook for Real-time Event Monitoring
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('${monitoringConfig.analytics.rpcUrl}');

// Monitor key events in real-time
async function startEventMonitoring() {
  console.log('🔍 Starting real-time event monitoring...');
  
  // LIFE Token Events
  const lifeContract = new ethers.Contract(
    '${contracts.life}',
    ['event DailyRewardClaimed(address indexed user, uint256 amount, string region)'],
    provider
  );
  
  lifeContract.on('DailyRewardClaimed', (user, amount, region, event) => {
    console.log('💰 LIFE Claimed:', {
      user: user,
      amount: ethers.formatEther(amount),
      region: region,
      tx: event.transactionHash
    });
    // Send to analytics service
  });
  
  // Add more event listeners for other contracts...
}

startEventMonitoring().catch(console.error);
`;
  
  fs.writeFileSync('./monitoring-webhook.js', webhookScript);
  console.log("✅ Webhook script saved to: monitoring-webhook.js");
  
  // Generate documentation
  const monitoringDocs = `
# Production Monitoring Guide

## Overview
Your LIFE token economy is now live on Worldchain with comprehensive monitoring setup.

## Key Metrics to Track

### User Engagement
- Daily Active Users (DAU) - Users claiming LIFE tokens
- Orb Verification Rate - New human-verified users
- Regional Distribution - Geographic spread of users

### Economic Activity  
- Property Sales Volume - Total LIFE spent on properties
- Limited Edition Sales - Collectible trading activity
- Property Income Generated - Passive income system activity

### System Health
- Transaction Success Rate - Contract interaction reliability
- Gas Usage Trends - Cost optimization monitoring
- Error Rate Monitoring - Contract failure tracking

## Monitoring Tools

### Real-time Dashboard
Use the dashboard-config.json with your preferred monitoring solution:
- Grafana + Prometheus
- Datadog
- Custom React dashboard

### Event Monitoring
Key events to monitor:
- \`DailyRewardClaimed\` - Track user engagement
- \`OrbVerificationCompleted\` - Monitor human verification
- \`PropertyPurchased\` - Track economic activity
- \`PlayerRegistered\` - Monitor user onboarding

### Alerts Setup
Recommended alerts:
- High transaction volume (potential viral growth)
- Contract errors (system issues)
- Unusual spending patterns (potential issues)

## Analytics Queries

### Daily Active Users
\`\`\`sql
SELECT DATE(block_timestamp) as date, COUNT(DISTINCT user_address) as dau
FROM life_token_events 
WHERE event_name = 'DailyRewardClaimed'
GROUP BY DATE(block_timestamp)
\`\`\`

### Revenue Tracking
\`\`\`sql
SELECT SUM(amount) as total_revenue 
FROM economy_events 
WHERE event_name IN ('PropertyPurchased', 'LimitedEditionPurchased')
\`\`\`

## Block Explorer Links
- LIFE Token: https://explorer.worldcoin.org/address/${contracts.life}
- Economy: https://explorer.worldcoin.org/address/${contracts.economy}
- Property: https://explorer.worldcoin.org/address/${contracts.property}

## Support Escalation
Monitor for:
- Users unable to claim tokens
- Property purchase failures  
- World ID verification issues
- Income claiming problems

Set up automated alerts to notify your support team of critical issues.
`;
  
  fs.writeFileSync('./MONITORING_GUIDE.md', monitoringDocs);
  console.log("✅ Monitoring guide saved to: MONITORING_GUIDE.md");
  
  console.log("\n🎯 Monitoring Setup Complete!");
  console.log("\n📊 Next Steps:");
  console.log("1. Set up your monitoring dashboard using dashboard-config.json");
  console.log("2. Configure webhook endpoints for real-time alerts");
  console.log("3. Start the event monitoring webhook: node monitoring-webhook.js");
  console.log("4. Set up analytics tracking for user behavior");
  console.log("5. Configure support team alert notifications");
  
  return true;
}

// Run the setup
if (require.main === module) {
  setupMonitoring()
    .then(() => {
      console.log("\n✅ Monitoring setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Monitoring setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupMonitoring };
