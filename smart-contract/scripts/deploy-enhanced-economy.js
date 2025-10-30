const { ethers, upgrades } = require("hardhat");

async function deployEnhancedEconomy() {
    console.log("\n🚀 Deploying Enhanced Economy Contract...\n");

    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    try {
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    } catch (error) {
        console.log("💰 Account balance: Unable to fetch (local dev environment)");
    }

    // Get existing deployment info
    let deploymentInfo;
    try {
        deploymentInfo = require('./production-deployment.json');
        console.log("📄 Found existing deployment info");
    } catch (error) {
        console.error("❌ No existing deployment found. Please deploy the base contracts first.");
        process.exit(1);
    }

    // Verify we have the required contract addresses
    const requiredContracts = ['economy', 'life', 'property', 'limitedEdition', 'playerRegistry'];
    for (const contract of requiredContracts) {
        if (!deploymentInfo.contracts || !deploymentInfo.contracts[contract]) {
            console.error(`❌ Missing ${contract} address in deployment info`);
            process.exit(1);
        }
    }

    console.log("🔗 Using existing contract addresses:");
    console.log("  🏗️  Economy:", deploymentInfo.contracts.economy);
    console.log("  🪙 LIFE Token:", deploymentInfo.contracts.life);
    console.log("  🏠 Property:", deploymentInfo.contracts.property);
    console.log("  💎 Limited Edition:", deploymentInfo.contracts.limitedEdition);
    console.log("  👥 Player Registry:", deploymentInfo.contracts.playerRegistry);

    try {
        // Get the Economy contract factory
        const Economy = await ethers.getContractFactory("Economy");
        
        console.log("\n⏫ Upgrading Economy contract...");
        
        // Upgrade the proxy to the new implementation
        const upgradedEconomy = await upgrades.upgradeProxy(
            deploymentInfo.contracts.economy,
            Economy,
            {
                kind: 'uups'
            }
        );

        await upgradedEconomy.deployed();
        
        console.log("✅ Economy contract upgraded successfully!");
        console.log("📍 Economy proxy address:", upgradedEconomy.address);
        
        // Verify the upgrade worked by checking new functions
        console.log("\n🔍 Verifying new features...");
        
        try {
            // Test new discount settings
            const newUserDiscount = await upgradedEconomy.newUserDiscount();
            const loyaltyDiscountThreshold = await upgradedEconomy.loyaltyDiscountThreshold();
            const loyaltyDiscountRate = await upgradedEconomy.loyaltyDiscountRate();
            
            console.log("✅ Discount settings verified:");
            console.log(`   • New user discount: ${newUserDiscount.toString()}bps (${(Number(newUserDiscount) / 100).toFixed(1)}%)`);
            console.log(`   • Loyalty threshold: ${loyaltyDiscountThreshold.toString()} check-ins`);
            console.log(`   • Loyalty discount: ${loyaltyDiscountRate.toString()}bps (${(Number(loyaltyDiscountRate) / 100).toFixed(1)}%)`);
            
            // Test World ID only properties
            const isMansionWorldIDOnly = await upgradedEconomy.isWorldIDOnlyProperty("mansion");
            console.log(`✅ Mansion World ID restriction: ${isMansionWorldIDOnly}`);
            
            // Test discount calculation for a sample user
            const sampleDiscountInfo = await upgradedEconomy.getUserDiscountInfo(deployer.address);
            console.log("✅ Discount info function working");
            
            const samplePricing = await upgradedEconomy.calculateDiscountedPropertyPrice(
                "house", 
                1, 
                false, 
                deployer.address
            );
            console.log("✅ Discounted pricing calculation working");
            
        } catch (error) {
            console.error("❌ Error verifying new features:", error.message);
            throw error;
        }

        // Update deployment info with upgrade timestamp
        if (!deploymentInfo.contracts.economyUpgrades) {
            deploymentInfo.contracts.economyUpgrades = {};
        }
        deploymentInfo.contracts.economyUpgrades.lastUpgrade = new Date().toISOString();
        deploymentInfo.contracts.economyUpgrades.version = "enhanced";
        deploymentInfo.contracts.economyUpgrades.features = [
            "world-id-verification",
            "dynamic-pricing",
            "loyalty-discounts",
            "new-user-discounts",
            "exclusive-properties"
        ];

        // Save updated deployment info
        const fs = require('fs');
        fs.writeFileSync(
            './production-deployment.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n🎉 Enhanced Economy Deployment Complete!");
        console.log("\n📋 New Features Added:");
        console.log("✅ World ID verification requirements for premium properties");
        console.log("✅ Dynamic pricing based on user status and check-ins");
        console.log("✅ Loyalty discounts for frequent users");
        console.log("✅ New user bonuses for first-time purchasers");
        console.log("✅ Exclusive properties gated by World ID verification");
        
        console.log("\n🔧 Next Steps:");
        console.log("1. Update frontend ABI to include new functions");
        console.log("2. Test the enhanced payment flow");
        console.log("3. Configure additional exclusive properties if needed");
        console.log("4. Enable loyalty discounts for eligible users");
        
        console.log("\n📄 Updated deployment info saved to production-deployment.json");

        return {
            economy: upgradedEconomy.address,
            newFeatures: deploymentInfo.contracts.economyUpgrades.features
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Run the deployment
if (require.main === module) {
    deployEnhancedEconomy()
        .then((result) => {
            console.log("\n✅ Deployment successful!");
            console.log("🏗️  Enhanced Economy:", result.economy);
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { deployEnhancedEconomy };
