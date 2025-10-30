const { ethers } = require("hardhat");
const deploymentInfo = require("../deployment-info.json");

async function main() {
  const [owner] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "worldchain" : network.name;
  
  console.log("💰 Withdrawing Tokens from Economy Contract");
  console.log("===========================================");
  console.log(`Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`Owner: ${owner.address}`);
  
  // Get contract addresses from deployment info
  const economyAddress = deploymentInfo.contracts.economy;
  const lifeTokenAddress = deploymentInfo.contracts.lifeToken;
  const wldTokenAddress = deploymentInfo.contracts.wldToken;
  
  console.log("\nContract addresses:");
  console.log(`Economy: ${economyAddress}`);
  console.log(`LIFE Token: ${lifeTokenAddress}`);
  console.log(`WLD Token: ${wldTokenAddress}`);
  
  // Get contract instances
  const economy = await ethers.getContractAt("Economy", economyAddress);
  const lifeToken = await ethers.getContractAt("IERC20", lifeTokenAddress);
  const wldToken = await ethers.getContractAt("IERC20", wldTokenAddress);
  
  // Check contract balances
  const lifeBalance = await lifeToken.balanceOf(economyAddress);
  const wldBalance = await wldToken.balanceOf(economyAddress);
  const lifeBalanceFormatted = ethers.formatEther(lifeBalance);
  const wldBalanceFormatted = ethers.formatEther(wldBalance);
  
  console.log(`\n📊 Contract Token Balances:`);
  console.log(`   LIFE: ${lifeBalanceFormatted} LIFE`);
  console.log(`   WLD: ${wldBalanceFormatted} WLD`);
  
  if (lifeBalance === 0n && wldBalance === 0n) {
    console.log("🔍 No tokens to withdraw yet.");
    console.log("💡 Contract needs to accumulate tokens first!");
    return;
  }
  
  // Check ownership
  const contractOwner = await economy.owner();
  if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
    console.log(`❌ Error: You are not the contract owner!`);
    console.log(`   Contract owner: ${contractOwner}`);
    console.log(`   Your address: ${owner.address}`);
    return;
  }
  
  console.log(`\n✅ Ownership verified. Proceeding with withdrawal...`);
  
  try {
    let withdrawalSuccess = false;
    
    // Withdraw LIFE tokens if available (Note: This function has a bug in the contract)
    if (lifeBalance > 0n) {
      console.log(`\n💸 Attempting to withdraw ${lifeBalanceFormatted} LIFE tokens...`);
      try {
        const lifeTx = await economy.emergencyWithdrawLife(lifeBalance);
        console.log(`🔗 LIFE Transaction sent: ${lifeTx.hash}`);
        
        console.log("⏳ Waiting for LIFE withdrawal confirmation...");
        const lifeReceipt = await lifeTx.wait();
        console.log(`✅ LIFE withdrawal successful!`);
        console.log(`⛽ Gas used: ${lifeReceipt.gasUsed.toString()}`);
        withdrawalSuccess = true;
      } catch (lifeError) {
        console.log(`⚠️  LIFE withdrawal failed: ${lifeError.message}`);
        console.log(`💡 Note: The LIFE withdrawal function in the contract has a bug (uses transferFrom instead of transfer)`);
        console.log(`💡 LIFE tokens remain in the contract and need to be withdrawn manually or with a contract upgrade`);
      }
    }
    
    // Withdraw WLD tokens if available
    if (wldBalance > 0n) {
      console.log(`\n💸 Withdrawing ${wldBalanceFormatted} WLD tokens...`);
      try {
        const wldTx = await economy.emergencyWithdrawWld(wldBalance);
        console.log(`🔗 WLD Transaction sent: ${wldTx.hash}`);
        
        console.log("⏳ Waiting for WLD withdrawal confirmation...");
        const wldReceipt = await wldTx.wait();
        console.log(`✅ WLD withdrawal successful!`);
        console.log(`⛽ Gas used: ${wldReceipt.gasUsed.toString()}`);
        withdrawalSuccess = true;
      } catch (wldError) {
        console.log(`❌ WLD withdrawal failed: ${wldError.message}`);
      }
    }
    
    // Verify new balances
    const newLifeBalance = await lifeToken.balanceOf(economyAddress);
    const newWldBalance = await wldToken.balanceOf(economyAddress);
    const ownerLifeBalance = await lifeToken.balanceOf(owner.address);
    const ownerWldBalance = await wldToken.balanceOf(owner.address);
    
    console.log(`\n📊 Updated Balances:`);
    console.log(`   Contract LIFE: ${ethers.formatEther(newLifeBalance)} LIFE`);
    console.log(`   Contract WLD: ${ethers.formatEther(newWldBalance)} WLD`);
    console.log(`   Your LIFE: ${ethers.formatEther(ownerLifeBalance)} LIFE`);
    console.log(`   Your WLD: ${ethers.formatEther(ownerWldBalance)} WLD`);
    
    if (withdrawalSuccess) {
      console.log(`\n🎉 Withdrawal process completed!`);
    } else {
      console.log(`\n⚠️  No successful withdrawals occurred.`);
    }
    
  } catch (error) {
    console.error("❌ Withdrawal script failed:", error.message);
    
    if (error.message.includes("No tokens to withdraw")) {
      console.log("💡 No tokens available for withdrawal yet.");
    } else if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Only the contract owner can withdraw tokens.");
    }
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });