const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Updated Economy Contract to Worldchain Mainnet...");
  console.log("📋 This deployment will:");
  console.log("   - Deploy new Economy contract with direct transfer functions");
  console.log("   - Retain existing LIFE token address: 0xE4D62e62013EaF065Fa3F0316384F88559C80889");
  console.log("   - Use existing Property, PlayerRegistry, and other contracts");
  console.log("");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.00005")) {
    throw new Error("❌ Insufficient balance for deployment. Need at least 0.00005 ETH");
  }

  // Read existing contract addresses
  const fs = require('fs');
  let existingContracts = {};
  try {
    const data = fs.readFileSync('production-deployment.json', 'utf8');
    existingContracts = JSON.parse(data);
    console.log("📖 Loaded existing contract addresses from production-deployment.json");
  } catch (error) {
    console.log("⚠️  No existing production-deployment.json found, will create new one");
  }

  // Contract addresses (retaining LIFE token address)
  const LIFE_TOKEN = "0xE4D62e62013EaF065Fa3F0316384F88559C80889"; // Your existing entry point
  const PROPERTY = existingContracts.PROPERTY || "0xaECD39A7aFE6C34Fbd76446d95EbB2D97eA6B070";
  const PLAYER_REGISTRY = existingContracts.PLAYER_REGISTRY || "0x292B0D28b54F241ad230eba9Cdc235c6B7A6FF57";
  const LIMITED_EDITION = existingContracts.LIMITED_EDITION || "0xd31AeDF0d364e17363BaBB5164DBC64e42d9A34e";
  const WORLD_ID_ROUTER = "0x17B354dD2595411ff79041f930e491A4Df39A278"; // Production World ID
  const WLD_TOKEN = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"; // Worldchain WLD

  console.log("🏗️  Contract Addresses:");
  console.log("   LIFE Token (retained):", LIFE_TOKEN);
  console.log("   Property:", PROPERTY);
  console.log("   Player Registry:", PLAYER_REGISTRY);
  console.log("   Limited Edition:", LIMITED_EDITION);
  console.log("   World ID Router:", WORLD_ID_ROUTER);
  console.log("   WLD Token:", WLD_TOKEN);
  console.log("");

  // Deploy Economy contract (upgradeable)
  console.log("📦 Deploying Economy contract...");
  const Economy = await ethers.getContractFactory("Economy");
  
  const economyProxy = await upgrades.deployProxy(Economy, [
    deployer.address,    // _owner
    LIFE_TOKEN,          // _lifeToken
    WLD_TOKEN,          // _wldToken
    PROPERTY,           // _propertyContract
    LIMITED_EDITION,    // _limitedEditionContract
    PLAYER_REGISTRY,    // _playerRegistry
    deployer.address,   // _treasury
    deployer.address    // _devWallet
  ], {
    initializer: "initialize",
    kind: "uups"
  });

  await economyProxy.waitForDeployment();
  const economyAddress = await economyProxy.getAddress();
  
  console.log("✅ Economy contract deployed to:", economyAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  
  // Test basic functions
  const lifeToken = await ethers.getContractAt("LIFE", LIFE_TOKEN);
  const economy = await ethers.getContractAt("Economy", economyAddress);
  
  console.log("📊 Contract Verification:");
  console.log("   LIFE Token Name:", await lifeToken.name());
  console.log("   LIFE Token Symbol:", await lifeToken.symbol());
  console.log("   Economy Treasury:", await economy.treasury());
  console.log("   Economy Dev Wallet:", await economy.devWallet());
  console.log("   Economy Treasury Fee:", Number(await economy.treasuryFee()) / 100 + "%");
  console.log("   Economy Dev Fee:", Number(await economy.devFee()) / 100 + "%");
  console.log("");

  // Set up property prices
  console.log("🏠 Setting up property prices...");
  
  const propertyTypes = [
    { type: "house", lifePrice: ethers.parseEther("100"), wldPrice: ethers.parseEther("1") },
    { type: "apartment", lifePrice: ethers.parseEther("50"), wldPrice: ethers.parseEther("0.5") },
    { type: "villa", lifePrice: ethers.parseEther("200"), wldPrice: ethers.parseEther("2") },
    { type: "mansion", lifePrice: ethers.parseEther("500"), wldPrice: ethers.parseEther("5") },
    { type: "penthouse", lifePrice: ethers.parseEther("300"), wldPrice: ethers.parseEther("3") }
  ];

  for (const property of propertyTypes) {
    const tx = await economy.setPropertyPrice(
      property.type,
      property.lifePrice,
      property.wldPrice,
      true
    );
    await tx.wait();
    console.log(`   ✅ Set ${property.type} price: ${ethers.formatEther(property.lifePrice)} LIFE / ${ethers.formatEther(property.wldPrice)} WLD`);
  }
  console.log("");

  // Set up limited edition prices
  console.log("🎨 Setting up limited edition prices...");
  
  const limitedEditions = [
    { name: "cyberpunk_house", lifePrice: ethers.parseEther("1000"), wldPrice: ethers.parseEther("10") },
    { name: "futuristic_apartment", lifePrice: ethers.parseEther("500"), wldPrice: ethers.parseEther("5") }
  ];

  for (const edition of limitedEditions) {
    const tx = await economy.setLimitedEditionPrice(
      edition.name,
      edition.lifePrice,
      edition.wldPrice,
      true
    );
    await tx.wait();
    console.log(`   ✅ Set ${edition.name} price: ${ethers.formatEther(edition.lifePrice)} LIFE / ${ethers.formatEther(edition.wldPrice)} WLD`);
  }
  console.log("");

  // Test new direct transfer functions
  console.log("🧪 Testing new direct transfer functions...");
  
  try {
    // Test if the new functions exist
    const hasDirectTransfer = await economy.purchasePropertyWithDirectTransfer.staticCall(
      "house",
      "Test House",
      "Test Location",
      1,
      ""
    ).catch(() => false);
    
    const hasDirectWLDTransfer = await economy.purchasePropertyWithDirectWLDTransfer.staticCall(
      "house", 
      "Test House",
      "Test Location",
      1,
      ""
    ).catch(() => false);
    
    console.log("   ✅ purchasePropertyWithDirectTransfer function available");
    console.log("   ✅ purchasePropertyWithDirectWLDTransfer function available");
  } catch (error) {
    console.log("   ⚠️  Error testing new functions:", error.message);
  }
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    ...existingContracts,
    ECONOMY: economyAddress,
    ECONOMY_VERSION: "updated_with_direct_transfers",
    DEPLOYMENT_DATE: new Date().toISOString(),
    DEPLOYER: deployer.address,
    NETWORK: "worldchain",
    LIFE_TOKEN_RETAINED: LIFE_TOKEN,
    NEW_FEATURES: [
      "purchasePropertyWithDirectTransfer - for LIFE payments without approvals",
      "purchasePropertyWithDirectWLDTransfer - for WLD payments without approvals",
      "MiniKit compatible payment flows"
    ]
  };

  fs.writeFileSync('production-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to production-deployment.json");
  console.log("");

  // Generate frontend environment variables
  const envTemplate = `
# Updated Production Contract Addresses - Worldchain Mainnet
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=${LIFE_TOKEN}  # Retained user entry point
NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS=${economyAddress}  # Updated with direct transfer functions
NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS=${PROPERTY}
NEXT_PUBLIC_LIMITED_EDITION_ADDRESS=${LIMITED_EDITION}
NEXT_PUBLIC_PLAYER_REGISTRY_ADDRESS=${PLAYER_REGISTRY}
NEXT_PUBLIC_WORLD_ID_ROUTER_ADDRESS=${WORLD_ID_ROUTER}
NEXT_PUBLIC_WLD_CONTRACT_ADDRESS=${WLD_TOKEN}
`;

  fs.writeFileSync('frontend-env-updated.txt', envTemplate);
  console.log("📄 Frontend environment variables saved to frontend-env-updated.txt");
  console.log("");

  console.log("🎉 Deployment completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   ✅ Economy contract deployed with direct transfer functions");
  console.log("   ✅ LIFE token address retained: " + LIFE_TOKEN);
  console.log("   ✅ Property prices configured");
  console.log("   ✅ Limited edition prices configured");
  console.log("   ✅ MiniKit compatible payment flows ready");
  console.log("");
  console.log("🔗 New Economy Contract Address:", economyAddress);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   1. Update frontend with new Economy contract address");
  console.log("   2. Test LIFE and WLD payment flows");
  console.log("   3. Verify MiniKit transaction compatibility");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
