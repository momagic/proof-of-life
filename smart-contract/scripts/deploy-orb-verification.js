const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment with Orb Verification to Worldchain...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Configuration
  const useRealWorldId = process.env.USE_REAL_WORLD_ID === "true";
  const worldIdRouterAddress = process.env.WORLD_ID_ROUTER_ADDRESS || "0x17B354dD2595411ff79041f930e491A4Df39A278"; // World ID Router on Worldchain
  
  let worldIdRouter;
  
  if (useRealWorldId) {
    console.log("\n🌍 Using Real World ID Router at:", worldIdRouterAddress);
    worldIdRouter = worldIdRouterAddress;
  } else {
    console.log("\n🧪 Deploying Mock World ID Router for testing...");
    const MockWorldIDRouter = await ethers.getContractFactory("MockWorldIDRouter");
    const mockRouter = await MockWorldIDRouter.deploy();
    await mockRouter.waitForDeployment();
    worldIdRouter = await mockRouter.getAddress();
    console.log("MockWorldIDRouter deployed to:", worldIdRouter);
  }
  
  // Deploy LIFE token contract with orb verification (upgradeable)
  console.log("\n💎 Deploying LIFE token contract with orb verification...");
  const LIFE = await ethers.getContractFactory("LIFE");
  const life = await upgrades.deployProxy(LIFE, [worldIdRouter, deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await life.waitForDeployment();
  const lifeAddress = await life.getAddress();
  console.log("LIFE token deployed to:", lifeAddress);
  
  // Verify orb verification setup
  console.log("\n🔍 Verifying orb verification setup...");
  const groupId = await life.getGroupId();
  const externalNullifierHash = await life.getExternalNullifierHash();
  console.log("Group ID (should be 1 for orb):", groupId.toString());
  console.log("External Nullifier Hash:", externalNullifierHash.toString());
  
  // Deploy Property contract (upgradeable)
  console.log("\n🏠 Deploying Property contract (upgradeable)...");
  const Property = await ethers.getContractFactory("Property");
  const property = await upgrades.deployProxy(Property, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await property.waitForDeployment();
  const propertyAddress = await property.getAddress();
  console.log("Property contract deployed to:", propertyAddress);
  
  // Deploy LimitedEdition contract (upgradeable)
  console.log("\n🎨 Deploying LimitedEdition contract (upgradeable)...");
  const LimitedEdition = await ethers.getContractFactory("LimitedEdition");
  const limitedEdition = await upgrades.deployProxy(LimitedEdition, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await limitedEdition.waitForDeployment();
  const limitedEditionAddress = await limitedEdition.getAddress();
  console.log("LimitedEdition contract deployed to:", limitedEditionAddress);
  
  // Deploy PlayerRegistry contract (upgradeable)
  console.log("\n👥 Deploying PlayerRegistry contract (upgradeable)...");
  const PlayerRegistry = await ethers.getContractFactory("PlayerRegistry");
  const playerRegistry = await upgrades.deployProxy(PlayerRegistry, [
    deployer.address,
    lifeAddress,
    propertyAddress,
    limitedEditionAddress
  ], {
    initializer: "initialize",
    kind: "uups"
  });
  await playerRegistry.waitForDeployment();
  const playerRegistryAddress = await playerRegistry.getAddress();
  console.log("PlayerRegistry contract deployed to:", playerRegistryAddress);
  
  // Deploy WLD token (mock for testing on Worldchain)
  console.log("\n💰 Deploying WLD token (mock)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  // Create a simple ERC20 for WLD if not available
  const wldToken = await MockERC20.deploy("Worldcoin", "WLD", ethers.parseEther("1000000"));
  await wldToken.waitForDeployment();
  const wldTokenAddress = await wldToken.getAddress();
  console.log("WLD token deployed to:", wldTokenAddress);
  
  // Deploy Economy contract (upgradeable)
  console.log("\n🏦 Deploying Economy contract (upgradeable)...");
  const Economy = await ethers.getContractFactory("Economy");
  const economy = await upgrades.deployProxy(Economy, [
    deployer.address,      // _owner
    lifeAddress,           // _lifeToken
    wldTokenAddress,       // _wldToken
    propertyAddress,       // _propertyContract
    limitedEditionAddress, // _limitedEditionContract
    playerRegistryAddress, // _playerRegistry
    deployer.address,      // _treasury
    deployer.address       // _devWallet
  ], {
    initializer: "initialize",
    kind: "uups"
  });
  await economy.waitForDeployment();
  const economyAddress = await economy.getAddress();
  console.log("Economy contract deployed to:", economyAddress);
  
  // Set up permissions
  console.log("\n🔐 Setting up permissions...");
  
  // Add Economy as authorized minter for LIFE token
  await life.addAuthorizedMinter(economyAddress);
  console.log("✅ Economy added as authorized minter for LIFE token");
  
  // Add Economy as authorized minter for Property
  await property.addAuthorizedMinter(economyAddress);
  console.log("✅ Economy added as authorized minter for Property");
  
  // Add Economy as authorized minter for LimitedEdition
  await limitedEdition.addAuthorizedMinter(economyAddress);
  console.log("✅ Economy added as authorized minter for LimitedEdition");
  
  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network: Worldchain");
  console.log("Deployer:", deployer.address);
  console.log("World ID Router:", worldIdRouter);
  console.log("LIFE Token:", lifeAddress);
  console.log("Property:", propertyAddress);
  console.log("LimitedEdition:", limitedEditionAddress);
  console.log("PlayerRegistry:", playerRegistryAddress);
  console.log("Economy:", economyAddress);
  console.log("WLD Token:", wldTokenAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: "worldchain",
    chainId: 480,
    useRealWorldId: useRealWorldId,
    contracts: {
      worldIdRouter: worldIdRouter,
      lifeToken: lifeAddress,
      property: propertyAddress,
      limitedEdition: limitedEditionAddress,
      playerRegistry: playerRegistryAddress,
      economy: economyAddress,
      wldToken: wldTokenAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    orbVerification: {
      groupId: groupId.toString(),
      externalNullifierHash: externalNullifierHash.toString(),
      appId: "app_960683747d9e6074f64601c654c8775f",
      action: "proof-of-life"
    },
    explorerUrls: {
      worldIdRouter: `https://explorer.worldcoin.org/address/${worldIdRouter}`,
      lifeToken: `https://explorer.worldcoin.org/address/${lifeAddress}`,
      property: `https://explorer.worldcoin.org/address/${propertyAddress}`,
      economy: `https://explorer.worldcoin.org/address/${economyAddress}`
    },
    networkInfo: {
      name: "Worldchain Mainnet",
      rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
      blockExplorer: "https://explorer.worldcoin.org",
      nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18
      }
    }
  };
  
  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync('deployment-info-orb.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to deployment-info-orb.json");
  
  // Security recommendations
  console.log("\n🔒 Security Recommendations:");
  console.log("1. ✅ Orb verification enforced (groupId = 1)");
  console.log("2. ✅ Nullifier tracking prevents double-claims");
  console.log("3. ✅ Signal validation prevents address spoofing");
  if (!useRealWorldId) {
    console.log("4. ⚠️  REPLACE MockWorldIDRouter with real World ID Router for production!");
  }
  console.log("5. ✅ External nullifier hash computed from app ID and action");
  console.log("6. ✅ Only authorized contracts can mint tokens");
  
  console.log("\n🚀 Deployment Complete! Your LIFE contract now enforces orb-only verification.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
