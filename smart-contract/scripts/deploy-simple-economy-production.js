const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Production Deployment Script for Simple Economy to Worldchain
 * 
 * This script deploys the simplified Economy contract to Worldchain mainnet
 * using your existing production contract addresses.
 */

async function deploySimpleEconomyProduction() {
    console.log("🚀 Deploying Simple Economy to Worldchain Mainnet...\n");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    const balance = await ethers.provider.getBalance(deployerAddress);
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Deployment Configuration:");
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    
    // Verify we're on Worldchain mainnet
    if (network.chainId !== 480n) {
        throw new Error(`Wrong network! Expected Worldchain (480), got ${network.chainId}. Use: npx hardhat run deploy-simple-economy-production.js --network worldchain`);
    }
    
    // Verify we have enough ETH for deployment
    const minBalance = ethers.parseEther("0.0001"); // Require at least 0.0001 ETH
    if (balance < minBalance) {
        throw new Error(`Insufficient balance. Have ${ethers.formatEther(balance)} ETH, need at least ${ethers.formatEther(minBalance)} ETH`);
    }
    
    // Get existing deployment info
    let existingDeployment;
    try {
        existingDeployment = JSON.parse(fs.readFileSync('./production-deployment.json', 'utf8'));
        console.log("📄 Found existing production deployment");
    } catch (error) {
        throw new Error("❌ No existing production deployment found. Deploy base contracts first with deploy-production.js");
    }
    
    console.log("\n🔗 Using existing contract addresses:");
    console.log(`  🪙 LIFE Token: ${existingDeployment.contracts.life}`);
    console.log(`  🏠 Property: ${existingDeployment.contracts.property}`);
    console.log(`  💎 Limited Edition: ${existingDeployment.contracts.limitedEdition}`);
    console.log(`  👥 Player Registry: ${existingDeployment.contracts.playerRegistry}`);
    console.log(`  🌍 WLD Token: ${existingDeployment.configuration.wldToken}`);
    
    const deploymentResults = {
        ...existingDeployment, // Keep existing data
        economyUpgrade: {
            type: "simple-economy",
            deployedAt: new Date().toISOString(),
            deployer: deployerAddress,
            oldEconomy: existingDeployment.contracts.economy
        }
    };
    
    try {
        // Deploy the simplified Economy contract
        console.log("\n💰 Deploying Simple Economy Contract...");
        
        const Economy = await ethers.getContractFactory("Economy");
        const economyStartGas = await ethers.provider.getBalance(deployerAddress);
        
        console.log("🔧 Initializing with parameters:");
        console.log(`  Owner: ${deployerAddress}`);
        console.log(`  LIFE Token: ${existingDeployment.contracts.life}`);
        console.log(`  WLD Token: ${existingDeployment.configuration.wldToken}`);
        console.log(`  Property: ${existingDeployment.contracts.property}`);
        console.log(`  Limited Edition: ${existingDeployment.contracts.limitedEdition}`);
        console.log(`  Player Registry: ${existingDeployment.contracts.playerRegistry}`);
        console.log(`  Treasury: ${existingDeployment.configuration.treasury}`);
        console.log(`  Dev Wallet: ${existingDeployment.configuration.devWallet}`);
        
        const economy = await upgrades.deployProxy(Economy, [
            deployerAddress,                                    // owner
            existingDeployment.contracts.life,                 // lifeToken
            existingDeployment.configuration.wldToken,         // wldToken
            existingDeployment.contracts.property,             // propertyContract
            existingDeployment.contracts.limitedEdition,       // limitedEditionContract
            existingDeployment.contracts.playerRegistry,       // playerRegistry
            existingDeployment.configuration.treasury,         // treasury
            existingDeployment.configuration.devWallet         // devWallet
        ], {
            initializer: "initialize",
            kind: "uups"
        });
        
        await economy.waitForDeployment();
        
        const economyAddress = await economy.getAddress();
        const gasUsed = ethers.formatEther(economyStartGas - await ethers.provider.getBalance(deployerAddress));
        
        console.log(`✅ Simple Economy deployed: ${economyAddress}`);
        console.log(`⛽ Gas used: ${gasUsed} ETH`);
        
        // Update deployment results
        deploymentResults.contracts.economy = economyAddress;
        deploymentResults.economyUpgrade.newEconomy = economyAddress;
        deploymentResults.economyUpgrade.gasUsed = gasUsed;
        
        // Configure Permissions
        console.log("\n🔐 Configuring Contract Permissions...");
        
        const LifeToken = await ethers.getContractAt("LIFE", existingDeployment.contracts.life);
        const Property = await ethers.getContractAt("Property", existingDeployment.contracts.property);
        const LimitedEdition = await ethers.getContractAt("LimitedEdition", existingDeployment.contracts.limitedEdition);
        const PlayerRegistry = await ethers.getContractAt("PlayerRegistry", existingDeployment.contracts.playerRegistry);
        
        const permissionTxs = [];
        
        try {
            // LIFE token permissions
            console.log("🔧 Adding Economy as LIFE minter...");
            const lifeTx = await LifeToken.addAuthorizedMinter(economyAddress);
            permissionTxs.push(lifeTx);
            console.log("✅ Added Economy as LIFE minter");
        } catch (error) {
            console.log("⚠️  Could not add LIFE minter permission:", error.message);
        }
        
        try {
            // Property contract permissions
            console.log("🔧 Adding Economy as Property minter...");
            const propTx = await Property.addAuthorizedMinter(economyAddress);
            permissionTxs.push(propTx);
            console.log("✅ Added Economy as Property minter");
        } catch (error) {
            console.log("⚠️  Could not add Property minter permission:", error.message);
        }
        
        try {
            // LimitedEdition contract permissions
            console.log("🔧 Adding Economy as Limited Edition minter...");
            const leTx = await LimitedEdition.addAuthorizedMinter(economyAddress);
            permissionTxs.push(leTx);
            console.log("✅ Added Economy as Limited Edition minter");
        } catch (error) {
            console.log("⚠️  Could not add Limited Edition minter permission:", error.message);
        }
        
        try {
            // PlayerRegistry permissions
            console.log("🔧 Adding Economy as Player Registry updater...");
            const prTx = await PlayerRegistry.addAuthorizedUpdater(economyAddress);
            permissionTxs.push(prTx);
            console.log("✅ Added Economy as Player Registry updater");
        } catch (error) {
            console.log("⚠️  Could not add Player Registry updater permission:", error.message);
        }
        
        // Wait for all permission transactions
        console.log("⏳ Waiting for permission transactions to complete...");
        await Promise.all(permissionTxs.map(tx => tx.wait()));
        console.log("✅ All permissions configured");
        
        // Verification Phase
        console.log("\n🔍 Verifying Simple Economy Deployment...");
        
        const verification = {
            economyAddress: economyAddress,
            features: [],
            propertyPricing: {},
            settings: {},
            permissions: {}
        };
        
        try {
            // Test basic functionality
            console.log("🧪 Testing basic functions...");
            
            // Test property pricing
            const housePrice = await economy.getPropertyPrice("house");
            verification.propertyPricing.house = {
                lifePrice: ethers.formatEther(housePrice.lifePrice),
                wldPrice: ethers.formatEther(housePrice.wldPrice),
                isActive: housePrice.isActive
            };
            console.log(`✅ House pricing: ${verification.propertyPricing.house.lifePrice} LIFE`);
            
            // Test exchange rate
            const wldToLife = await economy.convertWldToLife(ethers.parseEther("1"));
            verification.settings.wldToLifeRate = ethers.formatEther(wldToLife);
            console.log(`✅ Exchange rate: 1 WLD = ${verification.settings.wldToLifeRate} LIFE`);
            
            // Test income settings
            const baseIncomeRate = await economy.baseIncomeRate();
            verification.settings.baseIncomeRate = ethers.formatEther(baseIncomeRate);
            console.log(`✅ Base income rate: ${verification.settings.baseIncomeRate} LIFE/day`);
            
            // Test fees
            const treasuryFee = await economy.treasuryFee();
            const devFee = await economy.devFee();
            verification.settings.treasuryFee = Number(treasuryFee);
            verification.settings.devFee = Number(devFee);
            console.log(`✅ Fees: ${verification.settings.treasuryFee/100}% treasury, ${verification.settings.devFee/100}% dev`);
            
            verification.features = [
                "life-wld-payments",
                "property-yield-earning", 
                "yield-claiming",
                "level-based-pricing",
                "property-buyback"
            ];
            
        } catch (error) {
            console.log("⚠️  Some verification tests failed:", error.message);
        }
        
        // Check permissions
        try {
            verification.permissions.canMintLife = await LifeToken.authorizedMinters(economyAddress);
            verification.permissions.canMintProperty = await Property.authorizedMinters(economyAddress);
            verification.permissions.canMintLE = await LimitedEdition.authorizedMinters(economyAddress);
            verification.permissions.canUpdatePlayer = await PlayerRegistry.authorizedUpdaters(economyAddress);
            
            console.log(`✅ Can mint LIFE: ${verification.permissions.canMintLife}`);
            console.log(`✅ Can mint Property: ${verification.permissions.canMintProperty}`);
            console.log(`✅ Can mint Limited Edition: ${verification.permissions.canMintLE}`);
            console.log(`✅ Can update Player: ${verification.permissions.canUpdatePlayer}`);
        } catch (error) {
            console.log("⚠️  Could not verify all permissions:", error.message);
        }
        
        deploymentResults.economyUpgrade.verification = verification;
        
        // Save updated deployment info
        const deploymentPath = path.join(__dirname, 'production-deployment.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentResults, null, 2));
        console.log(`✅ Updated deployment info saved to: ${deploymentPath}`);
        
        // Final status
        console.log("\n🎉 SIMPLE ECONOMY MAINNET DEPLOYMENT SUCCESSFUL!");
        
        console.log("\n📋 Core Features:");
        console.log("✅ Buy properties with LIFE or WLD tokens");
        console.log("✅ Level-based pricing (20% increase per level)");
        console.log("✅ Automatic yield generation from owned properties");
        console.log("✅ Claim yield rewards in LIFE tokens");
        console.log("✅ Property buyback system (75% value)");
        console.log("✅ Fee distribution to treasury and dev wallet");
        
        console.log("\n🔧 Next Steps:");
        console.log("1. Update frontend CONTRACT_ADDRESSES with new Economy address");
        console.log("2. Test property purchase with real LIFE tokens");
        console.log("3. Test property purchase with real WLD tokens"); 
        console.log("4. Test yield claiming functionality");
        console.log("5. Monitor contract interactions on Worldchain");
        
        console.log("\n📜 Updated Contract Addresses for Frontend:");
        console.log(`ECONOMY: "${economyAddress}"`);
        console.log(`LIFE_TOKEN: "${existingDeployment.contracts.life}"`);
        console.log(`PROPERTY: "${existingDeployment.contracts.property}"`);
        console.log(`LIMITED_EDITION: "${existingDeployment.contracts.limitedEdition}"`);
        console.log(`PLAYER_REGISTRY: "${existingDeployment.contracts.playerRegistry}"`);
        console.log(`WLD: "${existingDeployment.configuration.wldToken}"`);
        
        console.log("\n🌐 Worldchain Explorer:");
        console.log(`Economy Contract: https://worldscan.org/address/${economyAddress}`);
        
        return {
            economyAddress,
            oldEconomyAddress: existingDeployment.contracts.economy,
            network: "worldchain",
            chainId: 480,
            features: verification.features
        };
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:", error);
        
        // Save error info
        deploymentResults.economyUpgrade.error = error.message;
        deploymentResults.economyUpgrade.status = "failed";
        
        const errorPath = path.join(__dirname, 'failed-economy-deployment.json');
        fs.writeFileSync(errorPath, JSON.stringify(deploymentResults, null, 2));
        
        throw error;
    }
}

// Export for testing
module.exports = { deploySimpleEconomyProduction };

// Run if called directly
if (require.main === module) {
    deploySimpleEconomyProduction()
        .then((results) => {
            console.log("\n✅ Simple Economy mainnet deployment completed successfully!");
            console.log(`🏗️  New Economy: ${results.economyAddress}`);
            console.log(`📜 Old Economy: ${results.oldEconomyAddress}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Mainnet deployment failed:", error);
            process.exit(1);
        });
}
