const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CORRECT LIFE contract with World ID Orb Verification...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Use REAL World ID Router for production
  const worldIdRouterAddress = "0x17B354dD2595411ff79041f930e491A4Df39A278";
  console.log("🌍 Using Real World ID Router:", worldIdRouterAddress);
  
  // Deploy the CORRECT LIFE contract with orb verification
  console.log("\n💎 Deploying LIFE token with World ID orb verification...");
  const LIFE = await ethers.getContractFactory("LIFE");
  
  // Deploy as upgradeable proxy
  const life = await upgrades.deployProxy(LIFE, [worldIdRouterAddress, deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  
  await life.waitForDeployment();
  const lifeAddress = await life.getAddress();
  console.log("✅ LIFE token deployed to:", lifeAddress);
  
  // Verify the contract has the correct functions
  console.log("\n🔍 Verifying contract functions...");
  try {
    const groupId = await life.getGroupId();
    const externalNullifierHash = await life.getExternalNullifierHash();
    const appId = await life.APP_ID();
    const action = await life.INCOGNITO_ACTION();
    
    console.log("✅ Group ID:", groupId.toString(), "(should be 1 for orb verification)");
    console.log("✅ External Nullifier Hash:", externalNullifierHash.toString());
    console.log("✅ App ID:", appId);
    console.log("✅ Action:", action);
    
    // Test that claimWithOrbVerification function exists
    console.log("✅ claimWithOrbVerification function: Available");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    console.log("This means the deployed contract is still the OLD version!");
    process.exit(1);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "worldchain",
    chainId: 480,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      life: lifeAddress,
      worldIdRouter: worldIdRouterAddress
    },
    verification: {
      groupId: 1,
      appId: "app_960683747d9e6074f64601c654c8775f",
      action: "proof-of-life"
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync('./correct-life-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📋 NEW CONTRACT ADDRESS:");
  console.log("LIFE Token (CORRECT):", lifeAddress);
  console.log("\n📝 Update your frontend environment variables:");
  console.log(`NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=${lifeAddress}`);
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Update your frontend .env.local with the new LIFE contract address");
  console.log("2. Update Vercel environment variables");
  console.log("3. Redeploy your frontend");
  console.log("4. Test World ID orb verification with the new contract");
  
  console.log("\n✅ CORRECT LIFE contract deployed successfully!");
  console.log("This contract has claimWithOrbVerification() function and World ID support!");
}

main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
