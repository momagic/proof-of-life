const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment of EconomyV2 and PropertyV2 contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Contract addresses from environment
  const LIFE_TOKEN_ADDRESS = process.env.LIFE_TOKEN_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const DEV_FEE_ADDRESS = process.env.DEV_FEE_ADDRESS;
  const WORLD_ID_CONTRACT = process.env.WORLD_ID_ROUTER_ADDRESS;

  if (!LIFE_TOKEN_ADDRESS || !TREASURY_ADDRESS || !DEV_FEE_ADDRESS || !WORLD_ID_CONTRACT) {
    throw new Error("Missing required environment variables. Please check your .env file.");
  }

  console.log("🔧 Configuration:");
  console.log("   LIFE Token:", LIFE_TOKEN_ADDRESS);
  console.log("   Treasury:", TREASURY_ADDRESS);
  console.log("   Dev Fee:", DEV_FEE_ADDRESS);
  console.log("   World ID Router:", WORLD_ID_CONTRACT);
  console.log("   Network:", network.name);
  console.log("");

  let deploymentResults = {
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
    gasUsed: {},
    configuration: {
      lifeToken: LIFE_TOKEN_ADDRESS,
      treasury: TREASURY_ADDRESS,
      devFee: DEV_FEE_ADDRESS,
      worldId: WORLD_ID_CONTRACT
    }
  };

  try {
    // Deploy PropertyV2 first
    console.log("🏠 Deploying PropertyV2...");
    const PropertyV2 = await ethers.getContractFactory("PropertyV2");
    
    const propertyV2StartGas = await deployer.provider.getBalance(deployer.address);
    
    const propertyV2 = await upgrades.deployProxy(
      PropertyV2,
      [
        deployer.address // owner
      ],
      { 
        initializer: "initialize",
        kind: "uups"
      }
    );
    
    await propertyV2.waitForDeployment();
    const propertyV2Address = await propertyV2.getAddress();
    
    deploymentResults.contracts.propertyV2 = propertyV2Address;
    deploymentResults.gasUsed.propertyV2 = ethers.formatEther(
      propertyV2StartGas - await deployer.provider.getBalance(deployer.address)
    );
    
    console.log("✅ PropertyV2 deployed to:", propertyV2Address);
    console.log("⛽ Gas used:", deploymentResults.gasUsed.propertyV2, "ETH\n");

    // Deploy EconomyV2
    console.log("💰 Deploying EconomyV2...");
    const EconomyV2 = await ethers.getContractFactory("EconomyV2");
    
    const economyV2StartGas = await deployer.provider.getBalance(deployer.address);
    
    const economyV2 = await upgrades.deployProxy(
      EconomyV2,
      [
        deployer.address,
        LIFE_TOKEN_ADDRESS,
        process.env.WLD_TOKEN_ADDRESS,
        propertyV2Address,
        TREASURY_ADDRESS,
        DEV_FEE_ADDRESS
      ],
      {
        initializer: "initialize",
        kind: "uups"
      }
    );
    
    await economyV2.waitForDeployment();
    const economyV2Address = await economyV2.getAddress();
    
    deploymentResults.contracts.economyV2 = economyV2Address;
    deploymentResults.gasUsed.economyV2 = ethers.formatEther(
      economyV2StartGas - await deployer.provider.getBalance(deployer.address)
    );
    
    console.log("✅ EconomyV2 deployed to:", economyV2Address);
    console.log("⛽ Gas used:", deploymentResults.gasUsed.economyV2, "ETH\n");

    // Configure contracts
    console.log("⚙️  Configuring contracts...");
    
    // Set EconomyV2 as minter in PropertyV2
    console.log("   Setting EconomyV2 as minter in PropertyV2...");
    const setMinterTx = await propertyV2.setAuthorizedMinter(economyV2Address, true);
    await setMinterTx.wait();
    console.log("   ✅ EconomyV2 set as minter");

    // Configure property types in EconomyV2
    console.log("   Configuring property types...");
    const propertyTypes = [
      {
        name: "house",
        baseLifePrice: ethers.parseEther("1000"),
        baseWldPrice: ethers.parseEther("10"),
        available: true,
        requiresWorldId: false
      },
      {
        name: "apartment", 
        baseLifePrice: ethers.parseEther("500"),
        baseWldPrice: ethers.parseEther("5"),
        available: true,
        requiresWorldId: false
      },
      {
        name: "office",
        baseLifePrice: ethers.parseEther("2000"),
        baseWldPrice: ethers.parseEther("20"),
        available: true,
        requiresWorldId: true
      },
      {
        name: "land",
        baseLifePrice: ethers.parseEther("800"),
        baseWldPrice: ethers.parseEther("8"),
        available: true,
        requiresWorldId: false
      },
      {
        name: "mansion",
        baseLifePrice: ethers.parseEther("5000"),
        baseWldPrice: ethers.parseEther("50"),
        available: true,
        requiresWorldId: true
      }
    ];

    for (const propertyType of propertyTypes) {
      const setPropertyTx = await economyV2.setPropertyPrice(
        propertyType.name,
        propertyType.baseLifePrice,
        propertyType.baseWldPrice,
        propertyType.available,
        propertyType.requiresWorldId
      );
      await setPropertyTx.wait();
      console.log(`   ✅ Configured property type: ${propertyType.name}`);
    }

    // Verify contract permissions
    console.log("\n🔍 Verifying contract setup...");
    
    const isMinter = await propertyV2.isAuthorizedMinter(economyV2Address);
    console.log("   PropertyV2 minter status:", isMinter ? "✅ Authorized" : "❌ Not authorized");
    
    const housePrice = await economyV2.getPropertyPrice("house");
    console.log("   House price configured:", housePrice.available ? "✅ Available" : "❌ Not available");
    
    const economyOwner = await economyV2.owner();
    console.log("   EconomyV2 owner:", economyOwner === deployer.address ? "✅ Correct" : "❌ Incorrect");

    // Calculate total gas used
    const totalGasUsed = parseFloat(deploymentResults.gasUsed.propertyV2) + parseFloat(deploymentResults.gasUsed.economyV2);
    deploymentResults.gasUsed.total = totalGasUsed.toString();

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📊 Summary:");
    console.log("   PropertyV2:", propertyV2Address);
    console.log("   EconomyV2:", economyV2Address);
    console.log("   Total Gas Used:", totalGasUsed.toFixed(6), "ETH");
    console.log("   Network:", network.name);
    console.log("   Deployer:", deployer.address);

    // Save deployment info
    const filename = `deployment-v2-${network.name}-${Date.now()}.json`;
    require("fs").writeFileSync(filename, JSON.stringify(deploymentResults, null, 2));
    console.log(`\n💾 Deployment info saved to: ${filename}`);

    // Output frontend configuration
    console.log("\n🔧 Frontend Configuration:");
    console.log("Add these to your frontend .env.local:");
    console.log(`NEXT_PUBLIC_ECONOMY_V2_ADDRESS=${economyV2Address}`);
    console.log(`NEXT_PUBLIC_PROPERTY_V2_ADDRESS=${propertyV2Address}`);
    console.log(`NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=${LIFE_TOKEN_ADDRESS}`);
    console.log(`NEXT_PUBLIC_WLD_TOKEN_ADDRESS=${process.env.WLD_TOKEN_ADDRESS}`);

    // Output verification commands
    console.log("\n🔍 Contract Verification:");
    console.log("Run these commands to verify contracts on Worldchain explorer:");
    console.log(`npx hardhat verify --network ${network.name} ${propertyV2Address}`);
    console.log(`npx hardhat verify --network ${network.name} ${economyV2Address}`);

    // Output next steps
    console.log("\n📋 Next Steps:");
    console.log("1. Verify contracts on Worldchain explorer (commands above)");
    console.log("2. Update your frontend with the new contract addresses");
    console.log("3. Configure World Dev Portal with the new contract addresses");
    console.log("4. Test the integration with both LIFE and WLD payments");
    console.log("5. Update your existing LIFE token to authorize the new EconomyV2 as a minter (if needed)");

    return deploymentResults;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;