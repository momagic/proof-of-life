const { ethers } = require("hardhat");

/**
 * Setup LIFE Token Permissions for New Economy Contract
 * 
 * This script adds the new Economy contract as an authorized minter
 * for the user's LIFE token entry point.
 */

async function setupLifePermissions() {
    console.log("🔧 Setting up LIFE Token Permissions...\n");
    
    const USER_LIFE_TOKEN = "0xE4D62e62013EaF065Fa3F0316384F88559C80889"; // User's entry point
    const NEW_ECONOMY = "0xe2fd8b534B9A3C8ba2353a2309A9a3d6f7dF9636";      // New Economy contract
    
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Permission Setup:");
    console.log(`Network: ${network.name} (${network.chainId})`);
    console.log(`Admin: ${deployer.address}`);
    console.log(`LIFE Token: ${USER_LIFE_TOKEN}`);
    console.log(`Economy Contract: ${NEW_ECONOMY}`);
    
    try {
        const LifeToken = await ethers.getContractAt("LIFE", USER_LIFE_TOKEN);
        
        // Check current owner
        const owner = await LifeToken.owner();
        console.log(`\n👤 LIFE Token Owner: ${owner}`);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            throw new Error(`You are not the owner of the LIFE token. Owner: ${owner}, You: ${deployer.address}`);
        }
        
        // Check current minter status
        const currentlyAuthorized = await LifeToken.authorizedMinters(NEW_ECONOMY);
        console.log(`🔍 Economy currently authorized: ${currentlyAuthorized}`);
        
        if (currentlyAuthorized) {
            console.log("✅ Economy contract is already authorized to mint LIFE!");
            return { alreadyAuthorized: true };
        }
        
        // Add Economy as authorized minter
        console.log("\n🔧 Adding Economy as authorized LIFE minter...");
        const tx = await LifeToken.addAuthorizedMinter(NEW_ECONOMY);
        console.log(`Transaction hash: ${tx.hash}`);
        
        // Wait for transaction confirmation
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        
        // Verify the permission was added
        const isNowAuthorized = await LifeToken.authorizedMinters(NEW_ECONOMY);
        
        if (isNowAuthorized) {
            console.log("✅ Successfully added Economy as LIFE minter!");
            console.log("🎉 Economy can now mint LIFE tokens for yield rewards");
        } else {
            throw new Error("Failed to add minter permission");
        }
        
        console.log("\n📋 Final Status:");
        console.log("✅ Economy can mint LIFE tokens (for yield rewards)");
        console.log("✅ Users keep their original LIFE token entry point");
        console.log("✅ Property purchases will work with LIFE payments");
        console.log("✅ Yield claiming will mint new LIFE tokens to users");
        
        return {
            success: true,
            transactionHash: tx.hash,
            economyAuthorized: true
        };
        
    } catch (error) {
        console.error("❌ Permission setup failed:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    setupLifePermissions()
        .then((result) => {
            if (result.alreadyAuthorized) {
                console.log("\n✅ Permissions already configured correctly!");
            } else {
                console.log("\n✅ LIFE token permissions configured successfully!");
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Permission setup failed:", error);
            process.exit(1);
        });
}
