const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Starting deployment to Worldchain...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy MockWorldIDAddressBook first (for testing)
  console.log("\nDeploying MockWorldIDAddressBook...");
  const MockWorldIDAddressBook = await ethers.getContractFactory("MockWorldIDAddressBook");
  const mockWorldIDAddressBook = await MockWorldIDAddressBook.deploy();
  await mockWorldIDAddressBook.waitForDeployment();
  const mockAddressBookAddress = await mockWorldIDAddressBook.getAddress();
  console.log("MockWorldIDAddressBook deployed to:", mockAddressBookAddress);
  
  // Deploy LIFE token contract (upgradeable)
  console.log("\nDeploying LIFE token contract (upgradeable)...");
  const LIFE = await ethers.getContractFactory("LIFE");
  const life = await upgrades.deployProxy(LIFE, [mockAddressBookAddress, deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await life.waitForDeployment();
  const lifeAddress = await life.getAddress();
  console.log("LIFE token deployed to:", lifeAddress);
  
  // Deploy Property contract (upgradeable)
  console.log("\nDeploying Property contract (upgradeable)...");
  const Property = await ethers.getContractFactory("Property");
  const property = await upgrades.deployProxy(Property, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await property.waitForDeployment();
  const propertyAddress = await property.getAddress();
  console.log("Property contract deployed to:", propertyAddress);
  
  // Deploy LimitedEdition contract (upgradeable)
  console.log("\nDeploying LimitedEdition contract (upgradeable)...");
  const LimitedEdition = await ethers.getContractFactory("LimitedEdition");
  const limitedEdition = await upgrades.deployProxy(LimitedEdition, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await limitedEdition.waitForDeployment();
  const limitedEditionAddress = await limitedEdition.getAddress();
  console.log("LimitedEdition contract deployed to:", limitedEditionAddress);
  
  // Deploy PlayerRegistry contract (upgradeable)
  console.log("\nDeploying PlayerRegistry contract (upgradeable)...");
  const PlayerRegistry = await ethers.getContractFactory("PlayerRegistry");
  const playerRegistry = await upgrades.deployProxy(PlayerRegistry, [deployer.address, lifeAddress, propertyAddress, limitedEditionAddress], {
    initializer: "initialize",
    kind: "uups"
  });
  await playerRegistry.waitForDeployment();
  const playerRegistryAddress = await playerRegistry.getAddress();
  console.log("PlayerRegistry contract deployed to:", playerRegistryAddress);
  
  // Deploy Economy contract (upgradeable)
  console.log("\nDeploying Economy contract (upgradeable)...");
  const Economy = await ethers.getContractFactory("Economy");
  const economy = await upgrades.deployProxy(Economy, [
    deployer.address, // owner
    lifeAddress, // lifeToken
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // wldToken (Worldchain WLD token)
    propertyAddress, // propertyContract
    limitedEditionAddress, // limitedEditionContract
    playerRegistryAddress, // playerRegistry
    deployer.address, // treasury
    deployer.address // devWallet
  ], {
    initializer: "initialize",
    kind: "uups"
  });
  await economy.waitForDeployment();
  const economyAddress = await economy.getAddress();
  console.log("Economy contract deployed to:", economyAddress);
  
  // Set up contract permissions
  console.log("\nSetting up contract permissions...");
  
  // Add Economy contract as authorized minter for LIFE tokens
  await life.addAuthorizedMinter(economyAddress);
  console.log("Added Economy as authorized minter for LIFE tokens");
  
  // Add Economy contract as authorized minter for Property NFTs
  await property.addAuthorizedMinter(economyAddress);
  console.log("Added Economy as authorized minter for Property NFTs");
  
  // Add Economy contract as authorized minter for LimitedEdition NFTs
  await limitedEdition.addAuthorizedMinter(economyAddress);
  console.log("Added Economy as authorized minter for LimitedEdition NFTs");
  
  // Add Economy contract as authorized updater for PlayerRegistry
  await playerRegistry.addAuthorizedUpdater(economyAddress);
  console.log("Added Economy as authorized updater for PlayerRegistry");
  
  // Verify deployment
  console.log("\nVerifying deployment...");
  const name = await life.name();
  const symbol = await life.symbol();
  const dailyAmount = await life.DAILY_CLAIM_AMOUNT();
  const devPremint = await life.DEV_PREMINT();
  
  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Daily Claim Amount:", ethers.formatEther(dailyAmount), "LIFE");
  console.log("Dev Premint Amount:", ethers.formatEther(devPremint), "LIFE");
  
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("MockWorldIDAddressBook:", mockAddressBookAddress);
  console.log("LIFE Token:", lifeAddress);
  console.log("Property Contract:", propertyAddress);
  console.log("LimitedEdition Contract:", limitedEditionAddress);
  console.log("PlayerRegistry Contract:", playerRegistryAddress);
  console.log("Economy Contract:", economyAddress);
  console.log("Deployer:", deployer.address);
  
  // Save deployment info
  const wldTokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"; // Worldchain WLD token
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contracts: {
      lifeToken: lifeAddress,
      mockWorldIDAddressBook: mockAddressBookAddress,
      property: propertyAddress,
      limitedEdition: limitedEditionAddress,
      playerRegistry: playerRegistryAddress,
      economy: economyAddress,
      wldToken: wldTokenAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  console.log("\nDeployment completed successfully!");
  console.log("Save this information for your frontend integration:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });