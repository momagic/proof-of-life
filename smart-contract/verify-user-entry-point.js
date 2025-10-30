const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying User Entry Point Contract...");
  console.log("");

  const USER_ENTRY_POINT = "0xE4D62e62013EaF065Fa3F0316384F88559C80889";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Checking with account:", deployer.address);
  console.log("🎯 Target address:", USER_ENTRY_POINT);
  console.log("");

  try {
    // Check if the address has code (is a contract)
    const code = await deployer.provider.getCode(USER_ENTRY_POINT);
    console.log("📋 Contract Code Length:", code.length);
    
    if (code === "0x") {
      console.log("❌ ERROR: No contract code found at this address!");
      console.log("   This address either:");
      console.log("   - Has no contract deployed");
      console.log("   - Is an EOA (Externally Owned Account)");
      console.log("   - Is on a different network");
      return;
    }
    
    console.log("✅ Contract code found at address");
    console.log("");

    // Try to interact with it as a LIFE token
    console.log("🧪 Testing as LIFE Token...");
    try {
      const lifeToken = await ethers.getContractAt("LIFE", USER_ENTRY_POINT);
      
      const name = await lifeToken.name();
      const symbol = await lifeToken.symbol();
      const totalSupply = await lifeToken.totalSupply();
      const decimals = await lifeToken.decimals();
      
      console.log("✅ LIFE Token Details:");
      console.log("   Name:", name);
      console.log("   Symbol:", symbol);
      console.log("   Total Supply:", ethers.formatEther(totalSupply));
      console.log("   Decimals:", decimals);
      console.log("");
      
      // Check if it has the expected functions
      try {
        const appId = await lifeToken.appId();
        console.log("   App ID:", appId);
      } catch (e) {
        console.log("   ⚠️  No appId function found");
      }
      
      try {
        const dailyAmount = await lifeToken.dailyAmount();
        console.log("   Daily Amount:", ethers.formatEther(dailyAmount));
      } catch (e) {
        console.log("   ⚠️  No dailyAmount function found");
      }
      
      try {
        const signingBonus = await lifeToken.signingBonus();
        console.log("   Signing Bonus:", ethers.formatEther(signingBonus));
      } catch (e) {
        console.log("   ⚠️  No signingBonus function found");
      }
      
    } catch (error) {
      console.log("❌ Failed to interact as LIFE token:", error.message);
      console.log("");
      
      // Try as a generic ERC20
      console.log("🧪 Testing as Generic ERC20...");
      try {
        const erc20 = await ethers.getContractAt("IERC20", USER_ENTRY_POINT);
        
        const name = await erc20.name();
        const symbol = await erc20.symbol();
        const totalSupply = await erc20.totalSupply();
        const decimals = await erc20.decimals();
        
        console.log("✅ ERC20 Token Details:");
        console.log("   Name:", name);
        console.log("   Symbol:", symbol);
        console.log("   Total Supply:", ethers.formatEther(totalSupply));
        console.log("   Decimals:", decimals);
        
      } catch (error2) {
        console.log("❌ Failed to interact as ERC20:", error2.message);
        console.log("");
        console.log("🔍 This might be a different type of contract or not a token at all.");
      }
    }
    
    console.log("");
    console.log("🌐 Network Information:");
    const network = await deployer.provider.getNetwork();
    console.log("   Network Name:", network.name);
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Network Type:", network.chainId === 480n ? "Worldchain Mainnet" : "Other");
    
  } catch (error) {
    console.log("❌ Error checking contract:", error.message);
  }
  
  console.log("");
  console.log("📝 Recommendations:");
  console.log("   1. Verify you're on the correct network (Worldchain Mainnet)");
  console.log("   2. Check if the contract address is correct");
  console.log("   3. Ensure the contract was deployed successfully");
  console.log("   4. If this is not a LIFE token, we may need to deploy a new one");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
