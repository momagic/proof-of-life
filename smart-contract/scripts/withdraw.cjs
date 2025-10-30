const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "worldchain" : network.name;
  
  console.log("💰 Withdrawing WLD Earnings from Game Contract");
  console.log("==============================================");
  console.log(`Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`Owner: ${owner.address}`);
  
  // Contract addresses (V2)
  const gameContractAddress = "0x20B5fED73305260b82A3bD027D791C9769E22a9A";
  const wldTokenAddress = "0x2cfc85d8e48f8eab294be644d9e25c3030863003";
  
  // Get contract instances
  const gameContract = await ethers.getContractAt("RedLightGreenLightGameV2", gameContractAddress);
  const wldToken = await ethers.getContractAt("IERC20", wldTokenAddress);
  
  // Check contract WLD balance
  const contractWldBalance = await wldToken.balanceOf(gameContractAddress);
  const balanceInWld = ethers.formatEther(contractWldBalance);
  
  console.log(`\n📊 Contract WLD Balance: ${balanceInWld} WLD`);
  
  if (contractWldBalance === 0n) {
    console.log("🔍 No WLD earnings to withdraw yet.");
    console.log("💡 Players need to purchase additional turns first!");
    return;
  }
  
  // Check ownership
  const contractOwner = await gameContract.owner();
  if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
    console.log(`❌ Error: You are not the contract owner!`);
    console.log(`   Contract owner: ${contractOwner}`);
    console.log(`   Your address: ${owner.address}`);
    return;
  }
  
  console.log(`\n💸 Withdrawing ${balanceInWld} WLD to your wallet...`);
  
  try {
    // Execute withdrawal
    const tx = await gameContract.withdrawFees(owner.address);
    console.log(`🔗 Transaction sent: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`✅ Withdrawal successful!`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Verify new balances
    const newContractBalance = await wldToken.balanceOf(gameContractAddress);
    const ownerBalance = await wldToken.balanceOf(owner.address);
    
    console.log(`\n📊 Updated Balances:`);
    console.log(`   Contract: ${ethers.formatEther(newContractBalance)} WLD`);
    console.log(`   Your wallet: ${ethers.formatEther(ownerBalance)} WLD`);
    
    console.log(`\n🎉 Successfully withdrew ${balanceInWld} WLD!`);
    
  } catch (error) {
    console.error("❌ Withdrawal failed:", error.message);
    
    if (error.message.includes("No fees to withdraw")) {
      console.log("💡 No earnings available for withdrawal yet.");
    } else if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Only the contract owner can withdraw earnings.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Withdrawal script failed:", error);
    process.exit(1);
  });