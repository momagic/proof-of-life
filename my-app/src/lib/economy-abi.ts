export const ECONOMY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "propertyType", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "uint256", "name": "level", "type": "uint256" },
      { "internalType": "bool", "name": "useWLD", "type": "bool" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "purchaseProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "propertyType", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "uint256", "name": "level", "type": "uint256" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "purchasePropertyWithDirectTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "propertyType", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "uint256", "name": "level", "type": "uint256" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "purchasePropertyWithDirectWLDTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "templateName", "type": "string" },
      { "internalType": "bool", "name": "useWLD", "type": "bool" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "purchaseLimitedEdition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "propertyType", "type": "string" }
    ],
    "name": "getPropertyPrice",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "lifePrice", "type": "uint256" },
          { "internalType": "uint256", "name": "wldPrice", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct Economy.PropertyPrice",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "templateName", "type": "string" }
    ],
    "name": "getLimitedEditionPrice",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "lifePrice", "type": "uint256" },
          { "internalType": "uint256", "name": "wldPrice", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct Economy.PropertyPrice",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getPurchaseStats",
    "outputs": [
      { "internalType": "uint256", "name": "purchases", "type": "uint256" },
      { "internalType": "uint256", "name": "lifeSpent", "type": "uint256" },
      { "internalType": "uint256", "name": "wldSpent", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "wldAmount", "type": "uint256" }
    ],
    "name": "convertWldToLife",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "lifeAmount", "type": "uint256" }
    ],
    "name": "convertLifeToWld",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "claimPropertyIncome",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }
    ],
    "name": "claimAllPropertyIncome",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "sellPropertyToContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "calculateBuybackPrice",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "propertyType", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lifePrice", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "wldPrice", "type": "uint256" }
    ],
    "name": "PropertyPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "templateName", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lifePrice", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "wldPrice", "type": "uint256" }
    ],
    "name": "LimitedEditionPurchased",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "propertyType", "type": "string" }
    ],
    "name": "isWorldIDOnlyProperty",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "propertyType", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "isExclusive", "type": "bool" }
    ],
    "name": "WorldIDOnlyPropertySet",
    "type": "event"
  }
] as const;