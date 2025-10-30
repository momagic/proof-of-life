
// Webhook for Real-time Event Monitoring
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://worldchain-mainnet.g.alchemy.com/public');

// Monitor key events in real-time
async function startEventMonitoring() {
  console.log('🔍 Starting real-time event monitoring...');
  
  // LIFE Token Events
  const lifeContract = new ethers.Contract(
    '0xCb60B6C6f44138Eef5d8e0ABECcA4Ad34Db16B68',
    ['event DailyRewardClaimed(address indexed user, uint256 amount, string region)'],
    provider
  );
  
  lifeContract.on('DailyRewardClaimed', (user, amount, region, event) => {
    console.log('💰 LIFE Claimed:', {
      user: user,
      amount: ethers.formatEther(amount),
      region: region,
      tx: event.transactionHash
    });
    // Send to analytics service
  });
  
  // Add more event listeners for other contracts...
}

startEventMonitoring().catch(console.error);
