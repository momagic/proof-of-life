// Worldchain details as a fallback in case viem/chains doesn't have it
export const worldchain = {
  id: 480,
  name: "Worldchain",
  network: "worldchain",
  nativeCurrency: {
    decimals: 18,
    name: "Worldchain Ether",
    symbol: "ETH",
  },
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
};
