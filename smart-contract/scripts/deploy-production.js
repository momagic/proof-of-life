const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Production Deployment Script for LIFE Economy
 * 
 * This script deploys all contracts to Worldchain mainnet with real World ID integration
 * and performs comprehensive verification of the deployment.
 */

async function deployProduction() {
  console.log("🚀 Starting Production Deployment to Worldchain...\n");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log("📋 Deployment Configuration:");
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  
  // Verify we have enough ETH for deployment (Worldchain has very low gas costs)
  const minBalance = ethers.parseEther("0.0001"); // Require at least 0.0001 ETH (OP Stack rollup)
  console.log(`Current balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Required balance: ${ethers.formatEther(minBalance)} ETH`);
  if (balance < minBalance) {
    throw new Error(`Insufficient balance. Have ${ethers.formatEther(balance)} ETH, need at least ${ethers.formatEther(minBalance)} ETH`);
  }
  
  // Configuration
  const REAL_WORLD_ID_ROUTER = "0x17B354dD2595411ff79041f930e491A4Df39A278";
  const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  
  const config = {
    worldIdRouter: REAL_WORLD_ID_ROUTER,
    wldToken: WLD_TOKEN_ADDRESS,
    devWallet: deployerAddress,
    treasury: deployerAddress, // Can be changed later
    useRealWorldId: true
  };
  
  console.log("\n🔧 Production Configuration:");
  console.log(`World ID Router: ${config.worldIdRouter}`);
  console.log(`WLD Token: ${config.wldToken}`);
  console.log(`Dev Wallet: ${config.devWallet}`);
  console.log(`Treasury: ${config.treasury}`);
  
  const deploymentResults = {
    network: "worldchain",
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployerAddress,
    deployedAt: new Date().toISOString(),
    contracts: {},
    configuration: config,
    verification: {},
    gasUsed: {}
  };
  
  try {
    // 1. Deploy LIFE Token with Real World ID
    console.log("\n💎 1. Deploying LIFE Token...");
    
    const LIFE = await ethers.getContractFactory("LIFE");
    const lifeStartGas = await ethers.provider.getBalance(deployerAddress);
    
    const life = await upgrades.deployProxy(LIFE, [config.worldIdRouter, config.devWallet], {
      initializer: "initialize",
      kind: "uups"
    });
    await life.waitForDeployment();
    
    const lifeAddress = await life.getAddress();
    deploymentResults.contracts.life = lifeAddress;
    deploymentResults.gasUsed.life = ethers.formatEther(lifeStartGas - await ethers.provider.getBalance(deployerAddress));
    
    console.log(`✅ LIFE Token deployed: ${lifeAddress}`);
    
    // 2. Deploy Property Contract
    console.log("\n🏠 2. Deploying Property Contract...");
    
    const Property = await ethers.getContractFactory("Property");
    const propertyStartGas = await ethers.provider.getBalance(deployerAddress);
    
    const property = await upgrades.deployProxy(Property, [deployerAddress], {
      initializer: "initialize",
      kind: "uups"
    });
    await property.waitForDeployment();
    
    const propertyAddress = await property.getAddress();
    deploymentResults.contracts.property = propertyAddress;
    deploymentResults.gasUsed.property = ethers.formatEther(propertyStartGas - await ethers.provider.getBalance(deployerAddress));
    
    console.log(`✅ Property Contract deployed: ${propertyAddress}`);
    
    // 3. Deploy LimitedEdition Contract
    console.log("\n🎨 3. Deploying LimitedEdition Contract...");
    
    const LimitedEdition = await ethers.getContractFactory("LimitedEdition");
    const leStartGas = await ethers.provider.getBalance(deployerAddress);
    
    const limitedEdition = await upgrades.deployProxy(LimitedEdition, [deployerAddress], {
      initializer: "initialize", 
      kind: "uups"
    });
    await limitedEdition.waitForDeployment();
    
    const limitedEditionAddress = await limitedEdition.getAddress();
    deploymentResults.contracts.limitedEdition = limitedEditionAddress;
    deploymentResults.gasUsed.limitedEdition = ethers.formatEther(leStartGas - await ethers.provider.getBalance(deployerAddress));
    
    console.log(`✅ LimitedEdition Contract deployed: ${limitedEditionAddress}`);
    
    // 4. Deploy PlayerRegistry Contract
    console.log("\n👥 4. Deploying PlayerRegistry Contract...");
    
    const PlayerRegistry = await ethers.getContractFactory("PlayerRegistry");
    const prStartGas = await ethers.provider.getBalance(deployerAddress);
    
    const playerRegistry = await upgrades.deployProxy(PlayerRegistry, [
      deployerAddress,
      lifeAddress,
      propertyAddress,
      limitedEditionAddress
    ], {
      initializer: "initialize",
      kind: "uups"
    });
    await playerRegistry.waitForDeployment();
    
    const playerRegistryAddress = await playerRegistry.getAddress();
    deploymentResults.contracts.playerRegistry = playerRegistryAddress;
    deploymentResults.gasUsed.playerRegistry = ethers.formatEther(prStartGas - await ethers.provider.getBalance(deployerAddress));
    
    console.log(`✅ PlayerRegistry Contract deployed: ${playerRegistryAddress}`);
    
    // 5. Deploy Economy Contract
    console.log("\n💰 5. Deploying Economy Contract...");
    
    const Economy = await ethers.getContractFactory("Economy");
    const economyStartGas = await ethers.provider.getBalance(deployerAddress);
    
    const economy = await upgrades.deployProxy(Economy, [
      deployerAddress,        // owner
      lifeAddress,           // lifeToken
      config.wldToken,       // wldToken
      propertyAddress,       // propertyContract
      limitedEditionAddress, // limitedEditionContract
      playerRegistryAddress, // playerRegistry
      config.treasury,       // treasury
      config.devWallet      // devWallet
    ], {
      initializer: "initialize",
      kind: "uups"
    });
    await economy.waitForDeployment();
    
    const economyAddress = await economy.getAddress();
    deploymentResults.contracts.economy = economyAddress;
    deploymentResults.gasUsed.economy = ethers.formatEther(economyStartGas - await ethers.provider.getBalance(deployerAddress));
    
    console.log(`✅ Economy Contract deployed: ${economyAddress}`);
    
    // 6. Configure Permissions
    console.log("\n🔐 6. Configuring Contract Permissions...");
    
    const permissionTxs = [];
    
    // LIFE token permissions
    permissionTxs.push(await life.addAuthorizedMinter(economyAddress));
    console.log("✅ Added Economy as LIFE minter");
    
    // Property contract permissions
    permissionTxs.push(await property.addAuthorizedMinter(economyAddress));
    console.log("✅ Added Economy as Property minter");
    
    // LimitedEdition contract permissions
    permissionTxs.push(await limitedEdition.addAuthorizedMinter(economyAddress));
    console.log("✅ Added Economy as LimitedEdition minter");
    
    // PlayerRegistry permissions
    permissionTxs.push(await playerRegistry.addAuthorizedUpdater(economyAddress));
    console.log("✅ Added Economy as PlayerRegistry updater");
    
    // Wait for all permission transactions
    await Promise.all(permissionTxs.map(tx => tx.wait()));
    console.log("✅ All permissions configured");
    
    // 7. Verification Phase
    console.log("\n🔍 7. Verifying Deployment...");
    
    const verification = {
      lifeToken: {},
      economy: {},
      property: {},
      limitedEdition: {},
      playerRegistry: {},
      worldId: {}
    };
    
    // Verify LIFE token
    verification.lifeToken.name = await life.name();
    verification.lifeToken.symbol = await life.symbol();
    verification.lifeToken.groupId = Number(await life.getGroupId());
    verification.lifeToken.appId = await life.APP_ID();
    verification.lifeToken.action = await life.INCOGNITO_ACTION();
    verification.lifeToken.dailyAmount = ethers.formatEther(await life.DAILY_CLAIM_AMOUNT());
    verification.lifeToken.signingBonus = ethers.formatEther(await life.SIGNING_BONUS());
    verification.lifeToken.devPremint = ethers.formatEther(await life.DEV_PREMINT());
    
    console.log(`Token: ${verification.lifeToken.name} (${verification.lifeToken.symbol})`);
    console.log(`Group ID: ${verification.lifeToken.groupId} (1 = orb verification)`);
    console.log(`Daily Amount: ${verification.lifeToken.dailyAmount} LIFE`);
    console.log(`Signing Bonus: ${verification.lifeToken.signingBonus} LIFE`);
    
    // Verify Economy parameters
    verification.economy.treasuryFee = Number(await economy.treasuryFee());
    verification.economy.devFee = Number(await economy.devFee());
    verification.economy.buybackPercentage = Number(await economy.buybackPercentage());
    verification.economy.wldToLifeRate = ethers.formatEther(await economy.wldToLifeRate());
    
    console.log(`Treasury Fee: ${verification.economy.treasuryFee/100}%`);
    console.log(`Dev Fee: ${verification.economy.devFee/100}%`);
    console.log(`Buyback Rate: ${verification.economy.buybackPercentage/100}%`);
    console.log(`WLD to LIFE Rate: ${verification.economy.wldToLifeRate}`);
    
    // Verify Property base stats
    const propertyTypes = ["house", "apartment", "office", "land", "mansion"];
    verification.property.baseStats = {};
    
    for (const propertyType of propertyTypes) {
      const price = await economy.getPropertyPrice(propertyType);
      verification.property.baseStats[propertyType] = {
        lifePrice: ethers.formatEther(price.lifePrice),
        wldPrice: ethers.formatEther(price.wldPrice),
        isActive: price.isActive
      };
      console.log(`${propertyType}: ${verification.property.baseStats[propertyType].lifePrice} LIFE`);
    }
    
    // Verify permissions
    verification.economy.canMintLife = await life.authorizedMinters(economyAddress);
    verification.economy.canMintProperty = await property.authorizedMinters(economyAddress);
    verification.economy.canMintLE = await limitedEdition.authorizedMinters(economyAddress);
    verification.economy.canUpdatePlayer = await playerRegistry.authorizedUpdaters(economyAddress);
    
    console.log(`Economy can mint LIFE: ${verification.economy.canMintLife}`);
    console.log(`Economy can mint Properties: ${verification.economy.canMintProperty}`);
    console.log(`Economy can mint Limited Editions: ${verification.economy.canMintLE}`);
    console.log(`Economy can update Players: ${verification.economy.canUpdatePlayer}`);
    
    deploymentResults.verification = verification;
    
    // 8. Generate deployment summary
    console.log("\n📊 8. Generating Deployment Summary...");
    
    const totalGasUsed = Object.values(deploymentResults.gasUsed)
      .reduce((sum, gas) => sum + parseFloat(gas), 0);
    
    deploymentResults.totalGasUsed = totalGasUsed.toFixed(6);
    deploymentResults.finalBalance = ethers.formatEther(await ethers.provider.getBalance(deployerAddress));
    
    // Save deployment info
    const deploymentPath = path.join(__dirname, 'production-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentResults, null, 2));
    
    console.log(`✅ Deployment info saved to: ${deploymentPath}`);
    
    // 9. Final status check
    console.log("\n🎯 9. Final Production Status Check...");
    
    const allChecks = [
      verification.lifeToken.groupId === 1,
      verification.economy.canMintLife,
      verification.economy.canMintProperty,
      verification.economy.canMintLE,
      verification.economy.canUpdatePlayer,
      verification.economy.treasuryFee === 500,
      verification.economy.devFee === 200
    ];
    
    const passedChecks = allChecks.filter(check => check).length;
    const totalChecks = allChecks.length;
    
    console.log(`Status checks passed: ${passedChecks}/${totalChecks}`);
    
    if (passedChecks === totalChecks) {
      console.log("🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!");
      console.log("✅ All systems verified and ready");
      console.log("🚀 Ready for real user testing");
    } else {
      console.log("⚠️ Some verification checks failed");
      console.log("🔧 Review configuration before proceeding");
    }
    
    // 10. Next steps
    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend with new contract addresses");
    console.log("2. Test with real orb-verified users");
    console.log("3. Monitor contract interactions");
    console.log("4. Set up analytics and monitoring");
    console.log("5. Prepare customer support");
    
    console.log("\n📜 Contract Addresses for Frontend:");
    console.log(`LIFE_TOKEN: "${lifeAddress}"`);
    console.log(`ECONOMY: "${economyAddress}"`);
    console.log(`PROPERTY: "${propertyAddress}"`);
    console.log(`LIMITED_EDITION: "${limitedEditionAddress}"`);
    console.log(`PLAYER_REGISTRY: "${playerRegistryAddress}"`);
    console.log(`WORLD_ID_ROUTER: "${config.worldIdRouter}"`);
    
    return deploymentResults;
    
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:", error);
    
    // Save partial results for debugging
    deploymentResults.error = error.message;
    deploymentResults.status = "failed";
    
    const errorPath = path.join(__dirname, 'failed-deployment.json');
    fs.writeFileSync(errorPath, JSON.stringify(deploymentResults, null, 2));
    
    throw error;
  }
}

// Export for testing
module.exports = { deployProduction };

// Run if called directly
if (require.main === module) {
  deployProduction()
    .then((results) => {
      console.log("\n✅ Production deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Production deployment failed:", error);
      process.exit(1);
    });
}
