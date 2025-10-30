const { ethers, upgrades } = require("hardhat");

async function deploySimpleEconomy() {
    console.log("\n🚀 Deploying Simple Economy Contract...\n");

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

    console.log("🔗 Using existing contract addresses:");
    console.log("  🪙 LIFE Token:", deploymentInfo.contracts.life);
    console.log("  🏠 Property:", deploymentInfo.contracts.property);
    console.log("  💎 Limited Edition:", deploymentInfo.contracts.limitedEdition);
    console.log("  👥 Player Registry:", deploymentInfo.contracts.playerRegistry);

    try {
        // Get the Economy contract factory
        const Economy = await ethers.getContractFactory("Economy");
        
        console.log("\n🆕 Deploying new Simple Economy contract as upgradeable proxy...");
        
        // Deploy the Economy contract as an upgradeable proxy
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
        
        console.log("✅ Simple Economy contract deployed successfully!");
        console.log("📍 Economy proxy address:", economyAddress);
        
        // Set up the Economy contract permissions
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

        // Test basic functionality
        console.log("\n🔍 Testing basic features...");
        
        try {
            // Test property pricing
            const housePrice = await economyProxy.getPropertyPrice("house");
            console.log("✅ Property pricing working");
            console.log(`   • House: ${ethers.formatEther(housePrice.lifePrice)} LIFE / ${ethers.formatEther(housePrice.wldPrice)} WLD`);
            
            // Test exchange rate
            const wldToLife = await economyProxy.convertWldToLife(ethers.parseEther("1"));
            console.log(`   • Exchange: 1 WLD = ${ethers.formatEther(wldToLife)} LIFE`);
            
            // Test income settings
            const baseIncomeRate = await economyProxy.baseIncomeRate();
            console.log(`   • Base income rate: ${ethers.formatEther(baseIncomeRate)} LIFE/day`);
            
        } catch (error) {
            console.error("❌ Error testing basic features:", error.message);
            throw error;
        }

        // Update deployment info
        deploymentInfo.contracts.economyOld = deploymentInfo.contracts.economy; // Backup old address
        deploymentInfo.contracts.economy = economyAddress; // Update to new address
        deploymentInfo.contracts.economySimple = {
            address: economyAddress,
            deployedAt: new Date().toISOString(),
            version: "simple",
            features: [
                "life-wld-payments",
                "property-yield-earning",
                "yield-claiming",
                "level-based-pricing",
                "property-buyback"
            ]
        };

        // Save updated deployment info
        const fs = require('fs');
        fs.writeFileSync(
            './production-deployment.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n🎉 Simple Economy Deployment Complete!");
        console.log("\n📋 Core Features:");
        console.log("✅ Buy properties with LIFE or WLD tokens");
        console.log("✅ Level-based pricing (20% increase per level)");
        console.log("✅ Automatic yield generation from owned properties");
        console.log("✅ Claim yield rewards in LIFE tokens");
        console.log("✅ Property buyback system (75% value)");
        console.log("✅ Fee distribution to treasury and dev wallet");
        
        console.log("\n🔧 Next Steps:");
        console.log("1. Update frontend CONTRACT_ADDRESSES to use new Economy address");
        console.log("2. Test property purchase with LIFE tokens");
        console.log("3. Test property purchase with WLD tokens");
        console.log("4. Test yield claiming functionality");
        
        console.log("\n📄 Updated deployment info saved to production-deployment.json");
        console.log(`\n🏗️  NEW ECONOMY ADDRESS: ${economyAddress}`);
        console.log("⚠️  IMPORTANT: Update your frontend to use this new address!");

        return {
            economy: economyAddress,
            oldEconomy: deploymentInfo.contracts.economyOld,
            features: deploymentInfo.contracts.economySimple.features
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Run the deployment
if (require.main === module) {
    deploySimpleEconomy()
        .then((result) => {
            console.log("\n✅ Deployment successful!");
            console.log("🏗️  Simple Economy:", result.economy);
            console.log("📜 Old Economy (backup):", result.oldEconomy);
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { deploySimpleEconomy };
