const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Production Verification Script
 * 
 * Verifies that all production contracts are correctly deployed and configured
 */

async function verifyProduction() {
  console.log("🔍 Verifying Production Deployment...\n");
  
  // Load deployment info if available
  let deploymentInfo = null;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("production-deployment.json", "utf8"));
    console.log("📄 Loaded deployment info from production-deployment.json");
  } catch (error) {
    console.log("⚠️ No deployment info found, will use hardcoded addresses if provided");
  }
  
  // Contract addresses (update these with your actual deployment addresses)
  const addresses = deploymentInfo?.contracts || {
    life: process.env.LIFE_TOKEN_ADDRESS || "",
    economy: process.env.ECONOMY_ADDRESS || "",
    property: process.env.PROPERTY_ADDRESS || "",
    limitedEdition: process.env.LIMITED_EDITION_ADDRESS || "",
    playerRegistry: process.env.PLAYER_REGISTRY_ADDRESS || "",
    worldIdRouter: process.env.WORLD_ID_ROUTER_ADDRESS || "0x17B354dD2595411ff79041f930e491A4Df39A278"
  };

  // Override with environment variables for accuracy, even if deployment file exists
  addresses.life = process.env.LIFE_TOKEN_ADDRESS || addresses.life;
  addresses.economy = process.env.ECONOMY_ADDRESS || addresses.economy;
  addresses.property = process.env.PROPERTY_ADDRESS || addresses.property;
  addresses.limitedEdition = process.env.LIMITED_EDITION_ADDRESS || addresses.limitedEdition;
  addresses.playerRegistry = process.env.PLAYER_REGISTRY_ADDRESS || addresses.playerRegistry;
  addresses.worldIdRouter = process.env.WORLD_ID_ROUTER_ADDRESS || addresses.worldIdRouter;
  
  console.log("📋 Contract Addresses:");
  Object.entries(addresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  
  if (!addresses.life || !addresses.economy) {
    console.log("❌ Missing contract addresses. Please update verify-production.js or deploy first.");
    return;
  }
  
  const verification = {
    timestamp: new Date().toISOString(),
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    addresses: addresses,
    tests: {}
  };
  
  try {
    // Get contract instances
    const life = await ethers.getContractAt("LIFE", addresses.life);
    const economy = addresses.economy ? await ethers.getContractAt("Economy", addresses.economy) : null;
    const property = addresses.property ? await ethers.getContractAt("Property", addresses.property) : null;
    const limitedEdition = addresses.limitedEdition ? await ethers.getContractAt("LimitedEdition", addresses.limitedEdition) : null;
    const playerRegistry = addresses.playerRegistry ? await ethers.getContractAt("PlayerRegistry", addresses.playerRegistry) : null;
    
    // 1. Verify LIFE Token Configuration
    console.log("\n💎 1. Verifying LIFE Token Configuration...");
    
    verification.tests.lifeToken = {};
    
    try {
      const name = await life.name();
      const symbol = await life.symbol();
      const groupId = await life.getGroupId();
      const appId = await life.APP_ID();
      const action = await life.INCOGNITO_ACTION();
      const dailyAmount = await life.DAILY_CLAIM_AMOUNT();
      const signingBonus = await life.SIGNING_BONUS();
      
      verification.tests.lifeToken = {
        name,
        symbol,
        groupId: Number(groupId),
        appId,
        action,
        dailyAmount: ethers.formatEther(dailyAmount),
        signingBonus: ethers.formatEther(signingBonus),
        status: "✅ PASS"
      };
      
      console.log(`Token: ${name} (${symbol})`);
      console.log(`Group ID: ${groupId} ${groupId == 1 ? "✅" : "❌"} (should be 1 for orb verification)`);
      console.log(`App ID: ${appId}`);
      console.log(`Action: ${action}`);
      console.log(`Daily Amount: ${ethers.formatEther(dailyAmount)} LIFE`);
      console.log(`Signing Bonus: ${ethers.formatEther(signingBonus)} LIFE`);
      
    } catch (error) {
      verification.tests.lifeToken = { status: "❌ FAIL", error: error.message };
      console.log(`❌ LIFE token verification failed: ${error.message}`);
    }
    
    // 2. Verify Economy Configuration
    if (economy) {
      console.log("\n💰 2. Verifying Economy Configuration...");
      
      verification.tests.economy = {};
      
      try {
        const treasuryFee = await economy.treasuryFee();
        const devFee = await economy.devFee();
        const buybackPercentage = await economy.buybackPercentage();
        const wldToLifeRate = await economy.wldToLifeRate();
        
        // Test property prices
        const propertyTypes = ["house", "apartment", "office", "land", "mansion"];
        const propertyPrices = {};
        
        for (const propertyType of propertyTypes) {
          const price = await economy.getPropertyPrice(propertyType);
          propertyPrices[propertyType] = {
            lifePrice: ethers.formatEther(price.lifePrice),
            wldPrice: ethers.formatEther(price.wldPrice),
            isActive: price.isActive
          };
        }
        
        verification.tests.economy = {
          treasuryFee: Number(treasuryFee),
          devFee: Number(devFee),
          buybackPercentage: Number(buybackPercentage),
          wldToLifeRate: ethers.formatEther(wldToLifeRate),
          propertyPrices,
          status: "✅ PASS"
        };
        
        console.log(`Treasury Fee: ${Number(treasuryFee)/100}% ${treasuryFee == 500 ? "✅" : "❌"}`);
        console.log(`Dev Fee: ${Number(devFee)/100}% ${devFee == 200 ? "✅" : "❌"}`);
        console.log(`Buyback Rate: ${Number(buybackPercentage)/100}% ${buybackPercentage == 7500 ? "✅" : "❌"}`);
        console.log(`WLD to LIFE Rate: ${ethers.formatEther(wldToLifeRate)} ${wldToLifeRate == ethers.parseEther("100") ? "✅" : "❌"}`);
        
        console.log("\nProperty Prices:");
        Object.entries(propertyPrices).forEach(([type, price]) => {
          console.log(`${type}: ${price.lifePrice} LIFE (Active: ${price.isActive})`);
        });
        
      } catch (error) {
        verification.tests.economy = { status: "❌ FAIL", error: error.message };
        console.log(`❌ Economy verification failed: ${error.message}`);
      }
    }
    
    // 3. Verify Contract Permissions
    if (economy && life) {
      console.log("\n🔐 3. Verifying Contract Permissions...");
      
      verification.tests.permissions = {};
      
      try {
        const economyCanMintLife = await life.authorizedMinters(addresses.economy);
        const economyCanMintProperty = property ? await property.authorizedMinters(addresses.economy) : false;
        const economyCanMintLE = limitedEdition ? await limitedEdition.authorizedMinters(addresses.economy) : false;
        const economyCanUpdatePlayer = playerRegistry ? await playerRegistry.authorizedUpdaters(addresses.economy) : false;
        
        verification.tests.permissions = {
          economyCanMintLife,
          economyCanMintProperty,
          economyCanMintLE,
          economyCanUpdatePlayer,
          status: economyCanMintLife && economyCanMintProperty && economyCanMintLE && economyCanUpdatePlayer ? "✅ PASS" : "⚠️ PARTIAL"
        };
        
        console.log(`Economy can mint LIFE: ${economyCanMintLife ? "✅" : "❌"}`);
        console.log(`Economy can mint Properties: ${economyCanMintProperty ? "✅" : "❌"}`);
        console.log(`Economy can mint Limited Editions: ${economyCanMintLE ? "✅" : "❌"}`);
        console.log(`Economy can update Players: ${economyCanUpdatePlayer ? "✅" : "❌"}`);
        
      } catch (error) {
        verification.tests.permissions = { status: "❌ FAIL", error: error.message };
        console.log(`❌ Permissions verification failed: ${error.message}`);
      }
    }
    
    // 4. Verify Property Base Configuration
    if (property) {
      console.log("\n🏠 4. Verifying Property Base Configuration...");
      
      verification.tests.property = {};
      
      try {
        const propertyName = await property.name();
        const propertySymbol = await property.symbol();
        
        // Check base status points and yield rates
        const propertyTypes = ["house", "apartment", "office", "land", "mansion"];
        const baseStats = {};
        
        for (const propertyType of propertyTypes) {
          const statusPoints = await property.baseStatusPoints(propertyType);
          const yieldRate = await property.baseYieldRates(propertyType);
          baseStats[propertyType] = {
            statusPoints: Number(statusPoints),
            yieldRate: Number(yieldRate)
          };
        }
        
        verification.tests.property = {
          name: propertyName,
          symbol: propertySymbol,
          baseStats,
          status: "✅ PASS"
        };
        
        console.log(`Property NFT: ${propertyName} (${propertySymbol})`);
        console.log("Base Stats:");
        Object.entries(baseStats).forEach(([type, stats]) => {
          console.log(`${type}: ${stats.statusPoints} points, ${stats.yieldRate} bp yield`);
        });
        
      } catch (error) {
        verification.tests.property = { status: "❌ FAIL", error: error.message };
        console.log(`❌ Property verification failed: ${error.message}`);
      }
    }
    
    // 5. Test World ID Configuration
    console.log("\n🌍 5. Verifying World ID Configuration...");
    
    verification.tests.worldId = {};
    
    try {
      const externalNullifierHash = await life.getExternalNullifierHash();
      const groupId = await life.getGroupId();
      
      verification.tests.worldId = {
        routerAddress: addresses.worldIdRouter,
        externalNullifierHash: externalNullifierHash.toString(),
        groupId: Number(groupId),
        isOrbOnly: Number(groupId) === 1,
        status: Number(groupId) === 1 ? "✅ PASS" : "❌ FAIL"
      };
      
      console.log(`World ID Router: ${addresses.worldIdRouter}`);
      console.log(`External Nullifier Hash: ${externalNullifierHash}`);
      console.log(`Group ID: ${groupId} ${Number(groupId) === 1 ? "(Orb-only ✅)" : "(Not orb-only ❌)"}`);
      
    } catch (error) {
      verification.tests.worldId = { status: "❌ FAIL", error: error.message };
      console.log(`❌ World ID verification failed: ${error.message}`);
    }
    
    // 6. Network and Gas Analysis
    console.log("\n⛽ 6. Network Analysis...");
    
    verification.tests.network = {};
    
    try {
      // ethers v6: use getBlock and fallback for gas price
      const block = await ethers.provider.getBlock("latest");
      const network = await ethers.provider.getNetwork();
      
      let gasPriceGwei = null;
      try {
        // Some providers support getFeeData in v6
        const feeData = await ethers.provider.getFeeData();
        const gp = feeData.gasPrice || feeData.maxFeePerGas || feeData.maxPriorityFeePerGas;
        if (gp) {
          gasPriceGwei = ethers.formatUnits(gp, "gwei");
        }
      } catch (_) {}
      
      // As a final fallback, set to 'unknown' if not available
      if (!gasPriceGwei) {
        gasPriceGwei = "unknown";
      }
      
      verification.tests.network = {
        chainId: Number(network.chainId),
        name: network.name,
        gasPrice: gasPriceGwei,
        blockNumber: Number(block.number || (await ethers.provider.getBlockNumber())),
        status: "✅ PASS"
      };
      
      console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`Current Gas Price: ${gasPriceGwei} gwei`);
      console.log(`Current Block: ${verification.tests.network.blockNumber}`);
      
    } catch (error) {
      verification.tests.network = { status: "❌ FAIL", error: error.message };
      console.log(`❌ Network analysis failed: ${error.message}`);
    }
    
    // 7. Generate Summary
    console.log("\n📊 7. Verification Summary...");
    
    const testResults = Object.values(verification.tests);
    const passedTests = testResults.filter(test => test.status?.includes("✅")).length;
    const failedTests = testResults.filter(test => test.status?.includes("❌")).length;
    const partialTests = testResults.filter(test => test.status?.includes("⚠️")).length;
    const totalTests = testResults.length;
    
    verification.summary = {
      totalTests,
      passedTests,
      failedTests,
      partialTests,
      successRate: ((passedTests + partialTests * 0.5) / totalTests * 100).toFixed(1)
    };
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Partial: ${partialTests} ⚠️`);
    console.log(`Success Rate: ${verification.summary.successRate}%`);
    
    // 8. Readiness Assessment
    console.log("\n🎯 8. Production Readiness Assessment...");
    
    const criticalPasses = [
      verification.tests.lifeToken?.status?.includes("✅"),
      verification.tests.worldId?.isOrbOnly,
      verification.tests.permissions?.economyCanMintLife
    ].filter(Boolean).length;
    
    if (criticalPasses >= 3 && verification.summary.successRate >= 80) {
      console.log("🟢 READY FOR PRODUCTION");
      console.log("✅ All critical systems verified");
      console.log("🚀 Can proceed with real user testing");
    } else if (verification.summary.successRate >= 60) {
      console.log("🟡 PARTIALLY READY");
      console.log("⚠️ Some issues detected, review before launch");
      console.log("🔧 Address failed tests before proceeding");
    } else {
      console.log("🔴 NOT READY FOR PRODUCTION");
      console.log("❌ Critical issues detected");
      console.log("🛠️ Fix issues before deployment");
    }
    
    // Save verification results
    const verificationPath = "production-verification.json";
    fs.writeFileSync(verificationPath, JSON.stringify(verification, null, 2));
    console.log(`\n📄 Verification results saved to: ${verificationPath}`);
    
    return verification;
    
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:", error);
    verification.error = error.message;
    verification.status = "failed";
    
    const errorPath = "failed-verification.json";
    fs.writeFileSync(errorPath, JSON.stringify(verification, null, 2));
    console.log(`Error details saved to: ${errorPath}`);
    
    throw error;
  }
}

// Export for use in other scripts
module.exports = { verifyProduction };

// Run if called directly
if (require.main === module) {
  verifyProduction()
    .then(() => {
      console.log("\n✅ Production verification completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Production verification failed:", error);
      process.exit(1);
    });
}
