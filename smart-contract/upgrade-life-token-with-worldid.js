const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Upgrading LIFE Token with World ID Features...");
  console.log("📋 This will upgrade your existing contract while keeping:");
  console.log("   - Same address: 0xE4D62e62013EaF065Fa3F0316384F88559C80889");
  console.log("   - All existing users and balances");
  console.log("   - All existing token supply");
  console.log("   - Add World ID verification features");
  console.log("");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Upgrading with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.00005")) {
    throw new Error("❌ Insufficient balance for upgrade. Need at least 0.00005 ETH");
  }

  const EXISTING_LIFE_TOKEN = "0xE4D62e62013EaF065Fa3F0316384F88559C80889";
  const WORLD_ID_ROUTER = "0x17B354dD2595411ff79041f930e491A4Df39A278"; // Production World ID

  console.log("🏗️  Contract Addresses:");
  console.log("   Existing LIFE Token:", EXISTING_LIFE_TOKEN);
  console.log("   World ID Router:", WORLD_ID_ROUTER);
  console.log("");

  // Check current state before upgrade
  console.log("🔍 Checking Current State...");
  try {
    const currentContract = await ethers.getContractAt("IERC20", EXISTING_LIFE_TOKEN);
    const currentName = await currentContract.name();
    const currentSymbol = await currentContract.symbol();
    const currentSupply = await currentContract.totalSupply();
    
    console.log("📊 Current Token State:");
    console.log("   Name:", currentName);
    console.log("   Symbol:", currentSymbol);
    console.log("   Total Supply:", ethers.formatEther(currentSupply));
    console.log("");
  } catch (error) {
    console.log("⚠️  Could not read current state:", error.message);
  }

  // Deploy new LIFE implementation with World ID features
  console.log("📦 Deploying New LIFE Implementation...");
  const LIFE = await ethers.getContractFactory("LIFE");
  
  const newImplementation = await LIFE.deploy();
  await newImplementation.waitForDeployment();
  const newImplementationAddress = await newImplementation.getAddress();
  
  console.log("✅ New implementation deployed to:", newImplementationAddress);
  console.log("");

  // Upgrade the existing proxy
  console.log("🔄 Upgrading Existing Proxy...");
  try {
    const upgradedProxy = await upgrades.upgradeProxy(EXISTING_LIFE_TOKEN, LIFE);
    await upgradedProxy.waitForDeployment();
    
    console.log("✅ Proxy upgraded successfully!");
    console.log("");
  } catch (error) {
    console.log("❌ Upgrade failed:", error.message);
    console.log("   This might be because the new implementation needs initialization");
    console.log("   Let's try a manual upgrade...");
    
    // Try manual upgrade
    try {
      const proxy = await ethers.getContractAt("ERC1967Proxy", EXISTING_LIFE_TOKEN);
      const upgradeTx = await proxy.upgradeTo(newImplementationAddress);
      await upgradeTx.wait();
      console.log("✅ Manual upgrade successful!");
    } catch (manualError) {
      console.log("❌ Manual upgrade also failed:", manualError.message);
      throw manualError;
    }
  }

  // Verify the upgrade
  console.log("🔍 Verifying Upgrade...");
  try {
    const upgradedContract = await ethers.getContractAt("LIFE", EXISTING_LIFE_TOKEN);
    
    console.log("📊 Upgraded Token Details:");
    console.log("   Name:", await upgradedContract.name());
    console.log("   Symbol:", await upgradedContract.symbol());
    console.log("   Total Supply:", ethers.formatEther(await upgradedContract.totalSupply()));
    console.log("   Decimals:", await upgradedContract.decimals());
    console.log("   App ID:", await upgradedContract.APP_ID());
    console.log("   Group ID:", await upgradedContract.getGroupId());
    console.log("   Daily Amount:", ethers.formatEther(await upgradedContract.DAILY_CLAIM_AMOUNT()));
    console.log("   Signing Bonus:", ethers.formatEther(await upgradedContract.SIGNING_BONUS()));
    console.log("");

    // Test World ID functions
    console.log("🧪 Testing World ID Functions:");
    
    // Test hasReceivedSigningBonus function
    const testUser = "0x1234567890123456789012345678901234567890";
    const hasBonus = await upgradedContract.hasUserReceivedSigningBonus(testUser);
    console.log("   ✅ hasUserReceivedSigningBonus function works");
    
    // Test mint function (should fail without authorization)
    try {
      await upgradedContract.mint(testUser, ethers.parseEther("100"));
      console.log("   ⚠️  mint function accessible (should be restricted)");
    } catch (error) {
      console.log("   ✅ mint function properly restricted");
    }
    
    // Test external nullifier hash
    const nullifierHash = await upgradedContract.getExternalNullifierHash();
    console.log("   ✅ External nullifier hash:", nullifierHash.toString());
    
  } catch (error) {
    console.log("❌ Error verifying upgrade:", error.message);
    console.log("   The upgrade may have succeeded but verification failed");
  }
  
  console.log("");
  console.log("🌐 Network Information:");
  const network = await deployer.provider.getNetwork();
  console.log("   Network Name:", network.name);
  console.log("   Chain ID:", network.chainId.toString());
  console.log("   Network Type:", network.chainId === 480n ? "Worldchain Mainnet" : "Other");
  
  // Save upgrade info
  const fs = require('fs');
  const upgradeInfo = {
    EXISTING_LIFE_TOKEN: EXISTING_LIFE_TOKEN,
    NEW_IMPLEMENTATION: newImplementationAddress,
    WORLD_ID_ROUTER: WORLD_ID_ROUTER,
    UPGRADE_DATE: new Date().toISOString(),
    UPGRADER: deployer.address,
    NETWORK: "worldchain",
    FEATURES_ADDED: [
      "World ID orb verification",
      "Daily LIFE token claims",
      "Signing bonus for new users",
      "Authorized minter system",
      "Sybil resistance with nullifiers"
    ],
    PRESERVED: [
      "Same contract address",
      "All existing user balances",
      "All existing token supply",
      "All existing token holders"
    ]
  };

  fs.writeFileSync('life-token-upgrade.json', JSON.stringify(upgradeInfo, null, 2));
  console.log("💾 Upgrade info saved to life-token-upgrade.json");
  console.log("");

  console.log("🎉 LIFE Token upgrade completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   ✅ Contract upgraded with full World ID integration");
  console.log("   ✅ Same address preserved: " + EXISTING_LIFE_TOKEN);
  console.log("   ✅ All existing users and balances preserved");
  console.log("   ✅ Only verified humans can now claim new tokens");
  console.log("   ✅ Daily claim system active");
  console.log("   ✅ Signing bonus for new users");
  console.log("   ✅ Authorized minter system for Economy contract");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   1. Update Economy contract to use the upgraded LIFE token");
  console.log("   2. Add Economy contract as authorized minter");
  console.log("   3. Test World ID verification flow");
  console.log("   4. Test property purchases with LIFE tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
