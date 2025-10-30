 /**
 * Production Contract Configuration - LIVE ON WORLDCHAIN
 * Updated: December 10, 2024
 * 
 * These are the live production contract addresses deployed to Worldchain mainnet
 * with real World ID integration and human-verified token economy.
 */

// Production Contract Addresses (LIVE)
export const PRODUCTION_CONTRACTS = {
  // Core Token & Economy
  LIFE_TOKEN: "0xE4D62e62013EaF065Fa3F0316384F88559C80889" as const, // Your user entry point
  ECONOMY: "0xd58fCd9b3185aD4421F4b154341147C13e8dE2C5" as const, // Updated with direct transfer functions
  
  // NFT Contracts
  PROPERTY: "0xaECD39A7aFE6C34Fbd76446d95EbB2D97eA6B070" as const,
  LIMITED_EDITION: "0xd31AeDF0d364e17363BaBB5164DBC64e42d9A34e" as const,
  
  // Registry & Management
  PLAYER_REGISTRY: "0x292B0D28b54F241ad230eba9Cdc235c6B7A6FF57" as const,
  
  // External Integrations
  WORLD_ID_ROUTER: "0x17B354dD2595411ff79041f930e491A4Df39A278" as const, // Production World ID
  WLD_TOKEN: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" as const, // Worldchain WLD
} as const;

// Updated Contract Addresses - Use these in your .env files or directly replace
export const CONTRACT_ADDRESSES = {
  LIFE_TOKEN: PRODUCTION_CONTRACTS.LIFE_TOKEN,
  PROPERTY: PRODUCTION_CONTRACTS.PROPERTY,
  LIMITED_EDITION: PRODUCTION_CONTRACTS.LIMITED_EDITION,
  PLAYER_REGISTRY: PRODUCTION_CONTRACTS.PLAYER_REGISTRY,
  ECONOMY: PRODUCTION_CONTRACTS.ECONOMY,
  WORLD_ID_ROUTER: PRODUCTION_CONTRACTS.WORLD_ID_ROUTER,
  WLD_TOKEN: PRODUCTION_CONTRACTS.WLD_TOKEN,
  
  // Legacy naming for backward compatibility
  WORLD_ID_ADDRESS_BOOK: PRODUCTION_CONTRACTS.WORLD_ID_ROUTER, // Deprecated: use WORLD_ID_ROUTER
  WLD: PRODUCTION_CONTRACTS.WLD_TOKEN,
} as const;

// Worldchain Configuration
export const WORLDCHAIN_CONFIG = {
  chainId: 480,
  name: "Worldchain Mainnet",
  rpcUrls: {
    default: {
      http: [
        "https://worldchain-mainnet.g.alchemy.com/public",
        "https://worldchain.drpc.org",
        "https://worldchain-mainnet.gateway.tenderly.co"
      ],
    },
    public: {
      http: [
        "https://worldchain-mainnet.g.alchemy.com/public",
        "https://worldchain.drpc.org",
        "https://worldchain-mainnet.gateway.tenderly.co"
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "WorldcoinExplorer",
      url: "https://explorer.worldcoin.org",
    },
  },
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
} as const;

// World ID Configuration for Production
export const WORLD_ID_CONFIG = {
  appId: "app_960683747d9e6074f64601c654c8775f" as const,
  action: "proof-of-life" as const,
  // Note: Use VerificationLevel.Orb when importing from @worldcoin/idkit
  verification_level: "orb" as const, // Orb verification REQUIRED
  signal_type: "address" as const, // User's wallet address as signal
} as const;

// Environment Variables for .env file
export const ENV_TEMPLATE = `
# Production Contract Addresses - Worldchain Mainnet  
NEXT_PUBLIC_LIFE_TOKEN_ADDRESS=${PRODUCTION_CONTRACTS.LIFE_TOKEN}  # User entry point (LIFE token)
NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS=${PRODUCTION_CONTRACTS.ECONOMY}  # Updated with direct transfer functions
NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS=${PRODUCTION_CONTRACTS.PROPERTY}
NEXT_PUBLIC_LIMITED_EDITION_ADDRESS=${PRODUCTION_CONTRACTS.LIMITED_EDITION}
NEXT_PUBLIC_PLAYER_REGISTRY_ADDRESS=${PRODUCTION_CONTRACTS.PLAYER_REGISTRY}
NEXT_PUBLIC_WORLD_ID_ROUTER_ADDRESS=${PRODUCTION_CONTRACTS.WORLD_ID_ROUTER}
NEXT_PUBLIC_WLD_CONTRACT_ADDRESS=${PRODUCTION_CONTRACTS.WLD_TOKEN}

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=480
NEXT_PUBLIC_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public

# World ID Configuration
NEXT_PUBLIC_WORLD_ID_APP_ID=${WORLD_ID_CONFIG.appId}
NEXT_PUBLIC_WORLD_ID_ACTION=${WORLD_ID_CONFIG.action}
`;

// Contract Explorer Links
export const EXPLORER_LINKS = {
  LIFE_TOKEN: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.LIFE_TOKEN}`,
  ECONOMY: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.ECONOMY}`,
  PROPERTY: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.PROPERTY}`,
  LIMITED_EDITION: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.LIMITED_EDITION}`,
  PLAYER_REGISTRY: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.PLAYER_REGISTRY}`,
  WLD_TOKEN: `https://explorer.worldcoin.org/address/${PRODUCTION_CONTRACTS.WLD_TOKEN}`,
} as const;

// Production Status Verification
export const PRODUCTION_STATUS = {
  isLive: true,
  deployedAt: "2024-12-10",
  chainId: 480,
  network: "worldchain",
  worldIdIntegration: "live",
  humanVerified: true,
  status: "production-ready",
} as const;

// Helper function to get transaction link
export function getTransactionLink(txHash: string): string {
  return `https://explorer.worldcoin.org/tx/${txHash}`;
}

// Helper function to get address link
export function getAddressLink(address: string): string {
  return `https://explorer.worldcoin.org/address/${address}`;
}

// Production deployment info
export const DEPLOYMENT_INFO = {
  deployer: "0xA13A18ccD767B83543212B0424426A374f565Fb8",
  deployedAt: "2024-12-10T21:04:00.000Z",
  network: "worldchain",
  chainId: 480,
  gasUsed: "~0.0003 ETH",
  verificationStatus: "✅ All systems verified",
  readyForUsers: true,
} as const;
