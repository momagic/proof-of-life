const { ethers } = require("hardhat");

/**
 * Analyze the current contract to understand what it is and what features it has
 */

async function analyzeCurrentContract() {
    console.log("🔍 Analyzing your current contract...\n");
    
    const CURRENT_CONTRACT_ADDRESS = "0xE4D62e62013EaF065Fa3F0316384F88559C80889";
    
    const [deployer] = await ethers.getSigners();
    
    console.log(`📍 Analyzing contract at: ${CURRENT_CONTRACT_ADDRESS}`);
    
    try {
        // Try different contract interfaces to see what it actually is
        console.log("\n🧪 Testing contract interface...");
        
        // Test if it's a LIFE token
        try {
            const lifeABI = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function balanceOf(address) view returns (uint256)",
                "function totalSupply() view returns (uint256)",
                "function owner() view returns (address)",
                "function APP_ID() view returns (string)",
                "function DAILY_CLAIM_AMOUNT() view returns (uint256)",
                "function hasReceivedSigningBonus(address) view returns (bool)"
            ];
            
            const lifeContract = new ethers.Contract(CURRENT_CONTRACT_ADDRESS, lifeABI, deployer);
            
            const name = await lifeContract.name();
            const symbol = await lifeContract.symbol();
            const totalSupply = await lifeContract.totalSupply();
            const owner = await lifeContract.owner();
            
            console.log("✅ This appears to be a LIFE token contract!");
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Total Supply: ${ethers.formatEther(totalSupply)}`);
            console.log(`   Owner: ${owner}`);
            
            try {
                const appId = await lifeContract.APP_ID();
                const dailyAmount = await lifeContract.DAILY_CLAIM_AMOUNT();
                console.log(`   App ID: ${appId}`);
                console.log(`   Daily Claim: ${ethers.formatEther(dailyAmount)} LIFE`);
            } catch {
                console.log("   (Some LIFE-specific functions not available)");
            }
            
            return {
                type: "LIFE_TOKEN",
                name,
                symbol,
                totalSupply: ethers.formatEther(totalSupply),
                owner,
                isYourEntryPoint: true
            };
            
        } catch (lifeError) {
            console.log("❌ Not a LIFE token:", lifeError.message);
        }
        
        // Test if it's an Economy contract
        try {
            const economyABI = [
                "function getPropertyPrice(string memory) view returns (tuple(uint256 lifePrice, uint256 wldPrice, bool isActive))",
                "function purchaseProperty(string memory, string memory, string memory, uint256, bool, string memory) external",
                "function owner() view returns (address)",
                "function treasuryFee() view returns (uint256)",
                "function devFee() view returns (uint256)"
            ];
            
            const economyContract = new ethers.Contract(CURRENT_CONTRACT_ADDRESS, economyABI, deployer);
            
            const owner = await economyContract.owner();
            const housePrice = await economyContract.getPropertyPrice("house");
            
            console.log("✅ This appears to be an Economy contract!");
            console.log(`   Owner: ${owner}`);
            console.log(`   House Price: ${ethers.formatEther(housePrice.lifePrice)} LIFE`);
            
            return {
                type: "ECONOMY",
                owner,
                housePrice: ethers.formatEther(housePrice.lifePrice),
                isYourEntryPoint: true
            };
            
        } catch (economyError) {
            console.log("❌ Not an Economy contract:", economyError.message);
        }
        
        // Try generic contract analysis
        console.log("\n🔍 Performing generic contract analysis...");
        
        const genericABI = [
            "function owner() view returns (address)",
            "function implementation() view returns (address)"
        ];
        
        const genericContract = new ethers.Contract(CURRENT_CONTRACT_ADDRESS, genericABI, deployer);
        
        try {
            const owner = await genericContract.owner();
            console.log(`Owner: ${owner}`);
            
            if (owner.toLowerCase() === deployer.address.toLowerCase()) {
                console.log("✅ You are the owner of this contract");
            } else {
                console.log("⚠️ You are NOT the owner of this contract");
            }
        } catch {
            console.log("No owner() function found");
        }
        
        try {
            const impl = await genericContract.implementation();
            console.log(`Implementation: ${impl}`);
            console.log("✅ This is a proxy contract");
        } catch {
            console.log("❌ This is not a proxy contract");
        }
        
        return {
            type: "UNKNOWN",
            isYourEntryPoint: true,
            address: CURRENT_CONTRACT_ADDRESS
        };
        
    } catch (error) {
        console.error("❌ Analysis failed:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    analyzeCurrentContract()
        .then((result) => {
            console.log("\n📋 Analysis Result:");
            console.log(JSON.stringify(result, null, 2));
            
            if (result.type === "LIFE_TOKEN") {
                console.log("\n💡 CONCLUSION:");
                console.log("Your entry point is a LIFE token contract, not an Economy contract.");
                console.log("This means your users are probably using it to:");
                console.log("• Claim daily LIFE tokens");
                console.log("• Receive World ID verification bonuses");
                console.log("• Hold and transfer LIFE tokens");
                console.log("\nTo add property purchase functionality, you have two options:");
                console.log("1. Keep the LIFE token at this address and point to the new Economy contract");
                console.log("2. Update your frontend to use both contracts (LIFE + Economy)");
            } else if (result.type === "ECONOMY") {
                console.log("\n💡 CONCLUSION:");
                console.log("Your entry point is already an Economy contract.");
                console.log("You may already have property purchase functionality!");
            }
            
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Analysis failed:", error);
            process.exit(1);
        });
}
