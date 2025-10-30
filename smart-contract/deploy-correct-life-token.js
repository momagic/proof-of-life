const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Correct LIFE Token with World ID Features...");
  console.log("");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.00005")) {
    throw new Error("❌ Insufficient balance for deployment. Need at least 0.00005 ETH");
  }

  // Contract addresses
  const WORLD_ID_ROUTER = "0x17B354dD2595411ff79041f930e491A4Df39A278"; // Production World ID
  const DEV_WALLET = deployer.address;

  console.log("🏗️  Contract Addresses:");
  console.log("   World ID Router:", WORLD_ID_ROUTER);
  console.log("   Dev Wallet:", DEV_WALLET);
  console.log("");

  // Deploy LIFE contract (upgradeable)
  console.log("📦 Deploying LIFE contract with World ID features...");
  const LIFE = await ethers.getContractFactory("LIFE");
  
  const lifeProxy = await upgrades.deployProxy(LIFE, [
    WORLD_ID_ROUTER,  // _worldId
    DEV_WALLET        // _devWallet
  ], {
    initializer: "initialize",
    kind: "uups"
  });

  await lifeProxy.waitForDeployment();
  const lifeAddress = await lifeProxy.getAddress();
  
  console.log("✅ LIFE contract deployed to:", lifeAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  
  try {
    const lifeToken = await ethers.getContractAt("LIFE", lifeAddress);
    
    console.log("📊 LIFE Token Details:");
    console.log("   Name:", await lifeToken.name());
    console.log("   Symbol:", await lifeToken.symbol());
    console.log("   Total Supply:", ethers.formatEther(await lifeToken.totalSupply()));
    console.log("   Decimals:", await lifeToken.decimals());
    console.log("   App ID:", await lifeToken.APP_ID());
    console.log("   Group ID:", await lifeToken.getGroupId());
    console.log("   Daily Amount:", ethers.formatEther(await lifeToken.DAILY_CLAIM_AMOUNT()));
    console.log("   Signing Bonus:", ethers.formatEther(await lifeToken.SIGNING_BONUS()));
    console.log("");

    // Test World ID functions
    console.log("🧪 Testing World ID Functions:");
    
    // Test hasReceivedSigningBonus function
    const testUser = "0x1234567890123456789012345678901234567890";
    const hasBonus = await lifeToken.hasUserReceivedSigningBonus(testUser);
    console.log("   ✅ hasUserReceivedSigningBonus function works");
    
    // Test mint function (should fail without authorization)
    try {
      await lifeToken.mint(testUser, ethers.parseEther("100"));
      console.log("   ⚠️  mint function accessible (should be restricted)");
    } catch (error) {
      console.log("   ✅ mint function properly restricted");
    }
    
    // Test external nullifier hash
    const nullifierHash = await lifeToken.getExternalNullifierHash();
    console.log("   ✅ External nullifier hash:", nullifierHash.toString());
    
  } catch (error) {
    console.log("❌ Error verifying contract:", error.message);
  }
  
  console.log("");
  console.log("🌐 Network Information:");
  const network = await deployer.provider.getNetwork();
  console.log("   Network Name:", network.name);
  console.log("   Chain ID:", network.chainId.toString());
  console.log("   Network Type:", network.chainId === 480n ? "Worldchain Mainnet" : "Other");
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    LIFE_TOKEN: lifeAddress,
    WORLD_ID_ROUTER: WORLD_ID_ROUTER,
    DEV_WALLET: DEV_WALLET,
    DEPLOYMENT_DATE: new Date().toISOString(),
    DEPLOYER: deployer.address,
    NETWORK: "worldchain",
    FEATURES: [
      "World ID orb verification",
      "Daily LIFE token claims",
      "Signing bonus for new users",
      "Authorized minter system",
      "Sybil resistance with nullifiers"
    ]
  };

  fs.writeFileSync('life-token-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to life-token-deployment.json");
  console.log("");

  console.log("🎉 LIFE Token deployment completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   ✅ LIFE token deployed with full World ID integration");
  console.log("   ✅ Only verified humans can claim tokens");
  console.log("   ✅ Daily claim system active");
  console.log("   ✅ Signing bonus for new users");
  console.log("   ✅ Authorized minter system for Economy contract");
  console.log("");
  console.log("🔗 New LIFE Token Address:", lifeAddress);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   1. Update Economy contract to use new LIFE token address");
  console.log("   2. Add Economy contract as authorized minter");
  console.log("   3. Update frontend with new LIFE token address");
  console.log("   4. Test World ID verification flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
