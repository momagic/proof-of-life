/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000, // Increased for gas efficiency on World Chain
      },
      viaIR: true, // Enable IR-based code generation for better optimization
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // World Chain Mainnet (OP Stack Optimistic Rollup)
    worldchain: {
      url: process.env.WORLDCHAIN_RPC_URL || "https://worldchain-mainnet.g.alchemy.com/public",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 480,
      timeout: 60000,
      httpHeaders: {
        "User-Agent": "hardhat"
      },
      // No custom gasPrice - let World Chain's rollup optimize automatically
    },
  },
  etherscan: {
    apiKey: {
      worldchain: process.env.WORLDCHAIN_API_KEY || "", // Get this from the Worldchain block explorer
    },
    customChains: [
      {
        network: "worldchain",
        chainId: 480,
        urls: {
          apiURL: "https://explorer.worldcoin.org/api",
          browserURL: "https://explorer.worldcoin.org",
        },
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};
