const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { config } = require('dotenv');
const { join } = require('path');

// Load environment variables from smart-contract directory
config({ path: join(process.cwd(), '../smart-contract/.env') });

// Worldchain configuration
const worldchain = {
  id: 480,
  name: 'World Chain (Mainnet)',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
};

// Contract addresses
const PROPERTY_CONTRACT_ADDRESS = '0xc31851a3f3A8fe340f0520222e46fA42cFB2ed58';
const ECONOMY_CONTRACT_ADDRESS = '0xC49e59216Ae053586F416fEde49b1A9d2B290a29';

// Property contract ABI for authorization
const PROPERTY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "minter", "type": "address"}],
    "name": "addAuthorizedMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorizedMinters",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function fixAuthorization() {
  console.log('=== Fix Property Contract Authorization ===');
  console.log('Property Contract:', PROPERTY_CONTRACT_ADDRESS);
  console.log('Economy Contract:', ECONOMY_CONTRACT_ADDRESS);
  console.log('');

  // Check if private key is provided
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ PRIVATE_KEY environment variable not set');
    console.log('   This script requires the private key of the Property contract owner.');
    console.log('   Usage: PRIVATE_KEY=0x... node fix-authorization.js');
    console.log('');
    console.log('   The Property contract owner is: 0xA13A18ccD767B83543212B0424426A374f565Fb8');
    console.log('   Make sure you have the private key for this address.');
    return;
  }

  // Add 0x prefix if not present
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  try {
    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    console.log('Using account:', account.address);

    // Create clients
    const publicClient = createPublicClient({
      chain: worldchain,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: worldchain,
      transport: http(),
    });

    // Verify the account is the owner
    console.log('\n1. Verifying account is Property contract owner...');
    const owner = await publicClient.readContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_ABI,
      functionName: 'owner',
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.log('❌ Account is not the Property contract owner');
      console.log('   Expected owner:', owner);
      console.log('   Your account:', account.address);
      return;
    }
    console.log('✅ Account verified as Property contract owner');

    // Check current authorization status
    console.log('\n2. Checking current authorization status...');
    const isCurrentlyAuthorized = await publicClient.readContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_ABI,
      functionName: 'authorizedMinters',
      args: [ECONOMY_CONTRACT_ADDRESS],
    });

    if (isCurrentlyAuthorized) {
      console.log('✅ Economy contract is already authorized');
      console.log('   No action needed - the issue may be elsewhere.');
      return;
    }
    console.log('❌ Economy contract is NOT authorized - proceeding with fix...');

    // Authorize the Economy contract
    console.log('\n3. Authorizing Economy contract as minter...');
    const { request } = await publicClient.simulateContract({
      account,
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_ABI,
      functionName: 'addAuthorizedMinter',
      args: [ECONOMY_CONTRACT_ADDRESS],
    });

    const hash = await walletClient.writeContract(request);
    console.log('✅ Transaction submitted:', hash);

    // Wait for confirmation
    console.log('\n4. Waiting for transaction confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log('✅ Transaction confirmed successfully!');
      console.log('   Block number:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed);
      
      // Verify the authorization was set
      console.log('\n5. Verifying authorization was set...');
      const isNowAuthorized = await publicClient.readContract({
        address: PROPERTY_CONTRACT_ADDRESS,
        abi: PROPERTY_ABI,
        functionName: 'authorizedMinters',
        args: [ECONOMY_CONTRACT_ADDRESS],
      });
      
      if (isNowAuthorized) {
        console.log('✅ SUCCESS: Economy contract is now authorized to mint properties!');
        console.log('   Users should now be able to purchase properties successfully.');
      } else {
        console.log('❌ FAILED: Authorization was not set properly');
      }
    } else {
      console.log('❌ Transaction failed');
    }

  } catch (error) {
    console.error('❌ Error fixing authorization:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('   Make sure the account has enough ETH for gas fees.');
    }
  }
}

fixAuthorization().catch(console.error);