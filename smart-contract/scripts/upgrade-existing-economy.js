const { ethers, upgrades } = require("hardhat");

/**
 * Upgrade Existing Economy Contract
 * 
 * This script will attempt to upgrade your existing Economy contract at
 * 0xE4D62e62013EaF065Fa3F0316384F88559C80889 to the simplified version
 * while preserving the same address for your users.
 */

async function upgradeExistingEconomy() {
    console.log("🔄 Attempting to upgrade existing Economy contract...\n");
    
    const EXISTING_ECONOMY_ADDRESS = "0xE4D62e62013EaF065Fa3F0316384F88559C80889";
    
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Upgrade Configuration:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Network: ${network.name} (${network.chainId})`);
    console.log(`Target Contract: ${EXISTING_ECONOMY_ADDRESS}`);
    
    try {
        // First, let's check if the contract exists and what it looks like
        console.log("\n🔍 Analyzing existing contract...");
        
        const code = await ethers.provider.getCode(EXISTING_ECONOMY_ADDRESS);
        if (code === "0x") {
            throw new Error("No contract found at the specified address");
        }
        console.log("✅ Contract exists at target address");
        
        // Try to connect to it as an Economy contract
        console.log("🔌 Attempting to connect to existing contract...");
        const Economy = await ethers.getContractFactory("Economy");
        
        try {
            // Try to upgrade using OpenZeppelin upgrades
            console.log("⬆️ Attempting UUPS upgrade...");
            
            const upgradedEconomy = await upgrades.upgradeProxy(EXISTING_ECONOMY_ADDRESS, Economy);
            await upgradedEconomy.waitForDeployment();
            
            console.log("🎉 UPGRADE SUCCESSFUL!");
            console.log(`✅ Economy contract upgraded at: ${EXISTING_ECONOMY_ADDRESS}`);
            console.log("✅ Same address preserved - no user impact!");
            
            // Verify the upgrade worked
            console.log("\n🧪 Testing upgraded contract...");
            
            const housePrice = await upgradedEconomy.getPropertyPrice("house");
            console.log(`✅ House price: ${ethers.formatEther(housePrice.lifePrice)} LIFE`);
            
            const wldToLife = await upgradedEconomy.convertWldToLife(ethers.parseEther("1"));
            console.log(`✅ Exchange rate: 1 WLD = ${ethers.formatEther(wldToLife)} LIFE`);
            
            console.log("\n📋 Upgrade completed successfully!");
            console.log("🔧 Your users can continue using the same contract address");
            console.log("✅ All new features are now available");
            
            return {
                success: true,
                address: EXISTING_ECONOMY_ADDRESS,
                method: "upgrade"
            };
            
        } catch (upgradeError) {
            console.log("⚠️ UUPS upgrade failed:", upgradeError.message);
            
            // If upgrade fails, the contract might not be upgradeable
            console.log("\n🔍 Checking if contract is upgradeable...");
            
            try {
                // Try to call admin/owner functions to see what's available
                const existingContract = new ethers.Contract(
                    EXISTING_ECONOMY_ADDRESS, 
                    [
                        "function owner() view returns (address)",
                        "function getPropertyPrice(string memory) view returns (tuple(uint256 lifePrice, uint256 wldPrice, bool isActive))",
                        "function purchaseProperty(string memory, string memory, string memory, uint256, bool, string memory) external",
                        "function implementation() view returns (address)"
                    ], 
                    deployer
                );
                
                const owner = await existingContract.owner();
                console.log(`Contract owner: ${owner}`);
                
                if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
                    throw new Error(`You're not the owner of this contract. Owner: ${owner}, You: ${deployer.address}`);
                }
                
                // Try to get implementation address (if it's a proxy)
                try {
                    const impl = await existingContract.implementation();
                    console.log(`Current implementation: ${impl}`);
                    console.log("✅ Contract appears to be a proxy but upgrade failed");
                } catch {
                    console.log("⚠️ Contract does not appear to be an upgradeable proxy");
                }
                
                // Test basic functionality
                const housePrice = await existingContract.getPropertyPrice("house");
                console.log(`Current house price: ${ethers.formatEther(housePrice.lifePrice)} LIFE`);
                
                console.log("\n❌ Cannot upgrade this contract");
                console.log("💡 Options:");
                console.log("1. Deploy new contract and migrate users");
                console.log("2. Use the newly deployed contract at 0xe2fd8b534B9A3C8ba2353a2309A9a3d6f7dF9636");
                console.log("3. Check if the current contract already has the features you need");
                
                return {
                    success: false,
                    reason: "not_upgradeable",
                    currentOwner: owner,
                    address: EXISTING_ECONOMY_ADDRESS,
                    alternatives: [
                        "0xe2fd8b534B9A3C8ba2353a2309A9a3d6f7dF9636"
                    ]
                };
                
            } catch (contractError) {
                console.log("❌ Error analyzing contract:", contractError.message);
                
                return {
                    success: false,
                    reason: "analysis_failed",
                    error: contractError.message,
                    address: EXISTING_ECONOMY_ADDRESS
                };
            }
        }
        
    } catch (error) {
        console.error("❌ Upgrade process failed:", error);
        throw error;
    }
}

// Export for testing
module.exports = { upgradeExistingEconomy };

// Run if called directly
if (require.main === module) {
    upgradeExistingEconomy()
        .then((result) => {
            if (result.success) {
                console.log("\n✅ Contract upgrade completed successfully!");
            } else {
                console.log("\n⚠️ Upgrade not possible with current setup");
                console.log("📋 See options above for next steps");
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Upgrade failed:", error);
            process.exit(1);
        });
}
