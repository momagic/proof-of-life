const { ethers, upgrades } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "worldchain" : network.name;
  
  console.log("🔄 Upgrading Economy Contract");
  console.log("=============================");
  console.log(`Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`Owner: ${owner.address}`);
  
  // Contract addresses
  const economyProxyAddress = "0xC49e59216Ae053586F416fEde49b1A9d2B290a29";
  const wldTokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  
  console.log(`\n📋 Contract Details:`);
  console.log(`   Economy Proxy: ${economyProxyAddress}`);
  console.log(`   WLD Token: ${wldTokenAddress}`);
  
  try {
    // Get the Economy contract factory
    const EconomyV2 = await ethers.getContractFactory("Economy");
    
    console.log("\n🔄 Upgrading contract implementation...");
    
    // Upgrade the contract
    const upgraded = await upgrades.upgradeProxy(economyProxyAddress, EconomyV2);
    await upgraded.waitForDeployment();
    
    console.log(`✅ Contract upgraded successfully!`);
    console.log(`📍 Proxy address: ${await upgraded.getAddress()}`);
    
    // Now set the correct WLD token address
    console.log("\n🔧 Setting WLD token address...");
    
    const tx = await upgraded.updateWldToken(wldTokenAddress);
    console.log(`🔗 Transaction sent: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`✅ WLD token address updated successfully!`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Verify the update
    console.log("\n🔍 Verifying update...");
    const currentWldToken = await upgraded.wldToken();
    console.log(`Current WLD token address: ${currentWldToken}`);
    console.log(`Expected WLD token address: ${wldTokenAddress}`);
    console.log(`✅ Addresses match: ${currentWldToken.toLowerCase() === wldTokenAddress.toLowerCase()}`);
    
    // Check contract balance
    const wldToken = await ethers.getContractAt("IERC20", wldTokenAddress);
    const contractBalance = await wldToken.balanceOf(economyProxyAddress);
    console.log(`\n💰 Contract WLD Balance: ${ethers.formatEther(contractBalance)} WLD`);
    
    console.log("\n🎉 Upgrade completed successfully!");
    console.log("💡 You can now use the withdrawal functions.");
    
  } catch (error) {
    console.error("❌ Upgrade failed:", error.message);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Only the contract owner can perform upgrades.");
    } else if (error.message.includes("proxy admin")) {
      console.log("💡 Check if you have the correct proxy admin permissions.");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade script failed:", error);
    process.exit(1);
  });