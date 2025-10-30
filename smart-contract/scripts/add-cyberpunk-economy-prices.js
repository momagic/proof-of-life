const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Cyberpunk property prices aligned with frontend
const CYBERPUNK_PROPERTY_PRICES = {
  "neural_pod": {
    lifePrice: ethers.parseEther("500"), // 500 LIFE
    wldPrice: ethers.parseEther("5"), // 5 WLD
    isActive: true
  },
  "data_fortress": {
    lifePrice: ethers.parseEther("750"), // 750 LIFE
    wldPrice: ethers.parseEther("7.5"), // 7.5 WLD
    isActive: true
  },
  "cyber_tower": {
    lifePrice: ethers.parseEther("1000"), // 1000 LIFE
    wldPrice: ethers.parseEther("10"), // 10 WLD
    isActive: true
  },
  "neon_palace": {
    lifePrice: ethers.parseEther("2000"), // 2000 LIFE
    wldPrice: ethers.parseEther("20"), // 20 WLD
    isActive: true
  },
  "quantum_spire": {
    lifePrice: ethers.parseEther("5000"), // 5000 LIFE
    wldPrice: ethers.parseEther("50"), // 50 WLD
    isActive: true
  }
};

async function addCyberpunkEconomyPrices() {
  console.log("🚀 Adding Cyberpunk Property Prices to Economy Contract...");
  
  try {
    // Load deployment info
    const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    const economyAddress = deploymentInfo.contracts.economy;
    console.log(`📍 Economy Contract Address: ${economyAddress}`);
    
    // Get the deployed Economy contract
    const Economy = await ethers.getContractFactory("Economy");
    const economy = Economy.attach(economyAddress);
    
    // Get signer (contract owner)
    const [owner] = await ethers.getSigners();
    console.log(`👤 Owner Address: ${owner.address}`);
    
    // Add each cyberpunk property price
    for (const [propertyType, pricing] of Object.entries(CYBERPUNK_PROPERTY_PRICES)) {
      console.log(`\n💰 Adding ${propertyType} pricing...`);
      console.log(`   LIFE Price: ${ethers.formatEther(pricing.lifePrice)} LIFE`);
      console.log(`   WLD Price: ${ethers.formatEther(pricing.wldPrice)} WLD`);
      
      try {
        const tx = await economy.setPropertyPrice(
          propertyType,
          pricing.lifePrice,
          pricing.wldPrice,
          pricing.isActive
        );
        
        console.log(`   Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ ${propertyType} pricing added successfully!`);
        
      } catch (error) {
        console.error(`   ❌ Failed to add ${propertyType} pricing:`, error.message);
      }
    }
    
    console.log("\n🎉 Cyberpunk property prices added successfully!");
    console.log("\n📋 Summary of added property prices:");
    Object.entries(CYBERPUNK_PROPERTY_PRICES).forEach(([type, pricing]) => {
      console.log(`   • ${type}: ${ethers.formatEther(pricing.lifePrice)} LIFE / ${ethers.formatEther(pricing.wldPrice)} WLD`);
    });
    
  } catch (error) {
    console.error("❌ Error adding cyberpunk property prices:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  addCyberpunkEconomyPrices()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { addCyberpunkEconomyPrices, CYBERPUNK_PROPERTY_PRICES };