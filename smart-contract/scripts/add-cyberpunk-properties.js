const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Cyberpunk property types with dystopian theme
const CYBERPUNK_PROPERTIES = {
  "neural_pod": {
    baseStatusPoints: 15,
    baseYieldRate: 75, // 75 LIFE/day
    description: "Neural Interface Pod - Basic cybernetic housing"
  },
  "data_fortress": {
    baseStatusPoints: 35,
    baseYieldRate: 150, // 150 LIFE/day
    description: "Data Fortress - Secure digital stronghold"
  },
  "cyber_tower": {
    baseStatusPoints: 75,
    baseYieldRate: 250, // 250 LIFE/day
    description: "Cyber Tower - High-tech residential complex"
  },
  "neon_palace": {
    baseStatusPoints: 150,
    baseYieldRate: 600, // 600 LIFE/day
    description: "Neon Palace - Luxurious cyberpunk mansion"
  },
  "quantum_spire": {
    baseStatusPoints: 300,
    baseYieldRate: 2000, // 2000 LIFE/day
    description: "Quantum Spire - Ultimate cybernetic skyscraper"
  }
};

async function addCyberpunkProperties() {
  console.log("🚀 Adding Cyberpunk Property Types...");
  
  try {
    // Load deployment info
    const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    const propertyAddress = deploymentInfo.contracts.property;
    console.log(`📍 Property Contract Address: ${propertyAddress}`);
    
    // Get the deployed Property contract
    const Property = await ethers.getContractFactory("Property");
    const property = Property.attach(propertyAddress);
    
    // Get signer (contract owner)
    const [owner] = await ethers.getSigners();
    console.log(`👤 Owner Address: ${owner.address}`);
    
    // Add each cyberpunk property type
    for (const [propertyType, stats] of Object.entries(CYBERPUNK_PROPERTIES)) {
      console.log(`\n🏢 Adding ${propertyType}...`);
      console.log(`   Status Points: ${stats.baseStatusPoints}`);
      console.log(`   Yield Rate: ${stats.baseYieldRate / 100}%`);
      
      try {
        const tx = await property.updateBaseStats(
          propertyType,
          stats.baseStatusPoints,
          stats.baseYieldRate
        );
        
        console.log(`   Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ ${propertyType} added successfully!`);
        
      } catch (error) {
        console.error(`   ❌ Failed to add ${propertyType}:`, error.message);
      }
    }
    
    console.log("\n🎉 Cyberpunk properties added successfully!");
    console.log("\n📋 Summary of added properties:");
    Object.entries(CYBERPUNK_PROPERTIES).forEach(([type, stats]) => {
      console.log(`   • ${type}: ${stats.baseStatusPoints} points, ${stats.baseYieldRate/100}% yield`);
    });
    
  } catch (error) {
    console.error("❌ Error adding cyberpunk properties:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  addCyberpunkProperties()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { addCyberpunkProperties, CYBERPUNK_PROPERTIES };