const { ethers, upgrades } = require("hardhat");

async function deployNewEnhancedEconomy() {
    console.log("\n🚀 Deploying New Enhanced Economy Contract...\n");

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

    // Check required contracts
    const requiredContracts = ['life', 'property', 'limitedEdition', 'playerRegistry'];
    for (const contract of requiredContracts) {
        if (!deploymentInfo.contracts || !deploymentInfo.contracts[contract]) {
            console.error(`❌ Missing ${contract} address in deployment info`);
            process.exit(1);
        }
    }

    console.log("🔗 Using existing contract addresses:");
    console.log("  🪙 LIFE Token:", deploymentInfo.contracts.life);
    console.log("  🏠 Property:", deploymentInfo.contracts.property);
    console.log("  💎 Limited Edition:", deploymentInfo.contracts.limitedEdition);
    console.log("  👥 Player Registry:", deploymentInfo.contracts.playerRegistry);

    try {
        // Get the Economy contract factory
        const Economy = await ethers.getContractFactory("Economy");
        
        console.log("\n🆕 Deploying new Enhanced Economy contract as upgradeable proxy...");
        
        // Deploy the new Economy contract as an upgradeable proxy
        const economyProxy = await upgrades.deployProxy(
            Economy,
            [
                deployer.address, // owner
                deploymentInfo.contracts.life, // LIFE token
                deploymentInfo.configuration.wldToken, // WLD token
                deploymentInfo.contracts.property, // Property contract
                deploymentInfo.contracts.limitedEdition, // Limited Edition contract
                deploymentInfo.contracts.playerRegistry, // Player Registry
                deploymentInfo.configuration.treasury, // Treasury
                deploymentInfo.configuration.devWallet // Dev wallet
            ],
            {
                kind: 'uups',
                initializer: 'initialize'
            }
        );

        await economyProxy.waitForDeployment();
        const economyAddress = await economyProxy.getAddress();
        
        console.log("✅ Enhanced Economy contract deployed successfully!");
        console.log("📍 New Economy proxy address:", economyAddress);
        
        // Set up the new Economy contract permissions
        console.log("\n🔧 Setting up contract permissions...");
        
        const LifeToken = await ethers.getContractAt("LIFE", deploymentInfo.contracts.life);
        const Property = await ethers.getContractAt("Property", deploymentInfo.contracts.property);
        const LimitedEdition = await ethers.getContractAt("LimitedEdition", deploymentInfo.contracts.limitedEdition);
        
        try {
            // Add Economy as authorized minter for LIFE tokens
            const lifeTx = await LifeToken.addAuthorizedMinter(economyAddress);
            await lifeTx.wait();
            console.log("✅ Economy authorized as LIFE token minter");
        } catch (error) {
            console.log("⚠️  Could not authorize LIFE minting:", error.message);
        }
        
        try {
            // Add Economy as authorized minter for Property NFTs
            const propTx = await Property.addAuthorizedMinter(economyAddress);
            await propTx.wait();
            console.log("✅ Economy authorized as Property minter");
        } catch (error) {
            console.log("⚠️  Could not authorize Property minting:", error.message);
        }
        
        try {
            // Add Economy as authorized minter for Limited Edition NFTs
            const leTx = await LimitedEdition.addAuthorizedMinter(economyAddress);
            await leTx.wait();
            console.log("✅ Economy authorized as Limited Edition minter");
        } catch (error) {
            console.log("⚠️  Could not authorize Limited Edition minting:", error.message);
        }

        // Verify the enhanced features work
        console.log("\n🔍 Verifying enhanced features...");
        
        try {
            // Test new discount settings (should have defaults)
            const newUserDiscount = await economyProxy.newUserDiscount();
            const loyaltyDiscountThreshold = await economyProxy.loyaltyDiscountThreshold();
            const loyaltyDiscountRate = await economyProxy.loyaltyDiscountRate();
            
            console.log("✅ Discount settings verified:");
            console.log(`   • New user discount: ${newUserDiscount.toString()}bps (${(Number(newUserDiscount) / 100).toFixed(1)}%)`);
            console.log(`   • Loyalty threshold: ${loyaltyDiscountThreshold.toString()} check-ins`);
            console.log(`   • Loyalty discount: ${loyaltyDiscountRate.toString()}bps (${(Number(loyaltyDiscountRate) / 100).toFixed(1)}%)`);
            
            // Test World ID only properties
            const isMansionWorldIDOnly = await economyProxy.isWorldIDOnlyProperty("mansion");
            console.log(`✅ Mansion World ID restriction: ${isMansionWorldIDOnly}`);
            
            // Test discount calculation for deployer
            const sampleDiscountInfo = await economyProxy.getUserDiscountInfo(deployer.address);
            console.log("✅ Discount info function working");
            console.log(`   • Has World ID: ${sampleDiscountInfo.hasWorldID}`);
            console.log(`   • Check-ins: ${sampleDiscountInfo.checkIns.toString()}`);
            console.log(`   • Eligible for loyalty: ${sampleDiscountInfo.eligibleForLoyalty}`);
            console.log(`   • Eligible for new user: ${sampleDiscountInfo.eligibleForNewUser}`);
            console.log(`   • Applicable discount: ${sampleDiscountInfo.applicableDiscount.toString()}bps`);
            
            const samplePricing = await economyProxy.calculateDiscountedPropertyPrice(
                "house", 
                1, 
                false, 
                deployer.address
            );
            console.log("✅ Discounted pricing calculation working");
            console.log(`   • Original price: ${ethers.formatEther(samplePricing.originalPrice)} LIFE`);
            console.log(`   • Discounted price: ${ethers.formatEther(samplePricing.discountedPrice)} LIFE`);
            console.log(`   • Discount rate: ${samplePricing.discountRate.toString()}bps`);
            
        } catch (error) {
            console.error("❌ Error verifying enhanced features:", error.message);
            throw error;
        }

        // Update deployment info
        deploymentInfo.contracts.economyOld = deploymentInfo.contracts.economy; // Backup old address
        deploymentInfo.contracts.economy = economyAddress; // Update to new address
        deploymentInfo.contracts.economyEnhanced = {
            address: economyAddress,
            deployedAt: new Date().toISOString(),
            version: "enhanced",
            features: [
                "world-id-verification",
                "dynamic-pricing",
                "loyalty-discounts",
                "new-user-discounts",
                "exclusive-properties"
            ]
        };

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
        console.log("✅ Loyalty discounts for frequent users (10%)");
        console.log("✅ New user bonuses for first-time purchasers (15%)");
        console.log("✅ Exclusive properties gated by World ID verification");
        
        console.log("\n🔧 Next Steps:");
        console.log("1. Update frontend CONTRACT_ADDRESSES to use new Economy address");
        console.log("2. Test the enhanced payment flow");
        console.log("3. Configure additional exclusive properties if needed");
        console.log("4. Enable loyalty discounts for eligible users");
        
        console.log("\n📄 Updated deployment info saved to production-deployment.json");
        console.log(`\n🏗️  NEW ECONOMY ADDRESS: ${economyAddress}`);
        console.log("⚠️  IMPORTANT: Update your frontend to use this new address!");

        return {
            economy: economyAddress,
            oldEconomy: deploymentInfo.contracts.economyOld,
            features: deploymentInfo.contracts.economyEnhanced.features
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Run the deployment
if (require.main === module) {
    deployNewEnhancedEconomy()
        .then((result) => {
            console.log("\n✅ Deployment successful!");
            console.log("🏗️  Enhanced Economy:", result.economy);
            console.log("📜 Old Economy (backup):", result.oldEconomy);
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { deployNewEnhancedEconomy };
