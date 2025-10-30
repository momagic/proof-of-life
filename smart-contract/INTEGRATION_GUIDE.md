# Proof of Life - Contract Integration Guide

## Overview

This guide explains how the new EconomyV2 and PropertyV2 contracts integrate with the existing LIFE token and World App's minikit.pay() system for seamless property purchases using both LIFE tokens and WLD.

## Architecture Overview

### Contract Structure
- **LIFE.sol** - Existing token contract (unchanged)
- **EconomyV2.sol** - New economy contract with improved payment handling
- **PropertyV2.sol** - New property NFT contract with gas optimization

### Key Improvements
1. **Dual Payment Support**: Native support for both LIFE tokens and WLD payments
2. **World App Integration**: Optimized for minikit.pay() workflow
3. **Gas Optimization**: Batch operations and efficient storage patterns
4. **Enhanced Security**: Reentrancy protection and proper access controls

## Payment Flow Integration

### 1. LIFE Token Payments (Traditional ERC-20)

```solidity
// Direct LIFE token purchase
function purchasePropertyWithLife(
    string memory propertyType,
    string memory name,
    string memory location,
    uint256 level,
    string memory tokenURI
) external
```

**Frontend Integration:**
```javascript
// Approve LIFE tokens first
await lifeContract.approve(economyV2Address, purchaseAmount);

// Purchase property
await economyV2Contract.purchasePropertyWithLife(
    "house",
    "My Dream House",
    "New York",
    3,
    "ipfs://metadata-uri"
);
```

### 2. World App minikit.pay() Integration

The new system supports World App's payment flow through a two-step process:

#### Step 1: Initiate Payment
```solidity
function initiatePayment(
    string memory propertyType,
    string memory name,
    string memory location,
    uint256 level,
    bool useWLD,
    string memory tokenURI
) external returns (bytes32 paymentId)
```

#### Step 2: Complete Payment (After World App Confirmation)
```solidity
function completePayment(bytes32 paymentId) external
```

**Frontend Integration with World App:**
```javascript
import { MiniKit } from '@worldcoin/minikit-js';

// 1. Initiate payment on-chain
const tx = await economyV2Contract.initiatePayment(
    "house",
    "My Dream House", 
    "New York",
    3,
    true, // useWLD
    "ipfs://metadata-uri"
);

const receipt = await tx.wait();
const paymentId = receipt.events.find(e => e.event === 'PaymentInitiated').args.paymentId;

// 2. Use World App minikit.pay()
const payload = {
    reference: paymentId,
    to: economyV2Address,
    tokens: [{
        symbol: "WLD",
        token_amount: purchaseAmount.toString()
    }],
    description: `Purchase ${propertyType} - ${name}`
};

const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

// 3. Complete payment on-chain (called by backend after verification)
if (finalPayload.status === 'success') {
    await economyV2Contract.completePayment(paymentId);
}
```

## Contract Interactions

### EconomyV2 Key Functions

#### Property Purchase
```solidity
// Get property pricing
function getPropertyPrice(string memory propertyType) external view returns (PropertyPrice memory);
function calculatePropertyPrice(string memory propertyType, uint256 level) external view returns (uint256 lifePrice, uint256 wldPrice);

// Purchase methods
function purchasePropertyWithLife(...) external; // Direct LIFE payment
function initiatePayment(...) external returns (bytes32); // World App payment
function completePayment(bytes32 paymentId) external; // Complete World App payment
```

#### Income System
```solidity
// Claim property income
function claimPropertyIncome(uint256 tokenId) external;
function getIncomeAvailable(uint256 tokenId) external view returns (uint256);

// Property buyback
function sellPropertyToContract(uint256 tokenId) external;
```

### PropertyV2 Key Functions

#### Property Management
```solidity
// View functions
function getProperty(uint256 tokenId) external view returns (...);
function getPropertyExtended(uint256 tokenId) external view returns (...);
function getPropertiesByOwner(address owner) external view returns (uint256[] memory);

// Batch operations
function getPropertiesByOwnerPaginated(address owner, uint256 offset, uint256 limit) external view returns (uint256[] memory, uint256);
function getTotalStatusPoints(address owner) external view returns (uint256);
```

## World App Integration Details

### Payment Verification Flow

1. **Frontend initiates payment** → `initiatePayment()` creates pending payment
2. **World App processes payment** → User confirms in World App
3. **Backend verifies payment** → Calls `completePayment()` after verification
4. **Property is minted** → NFT created and transferred to user

### Security Considerations

- **Payment Expiration**: Payments expire after 1 hour if not completed
- **Unique Payment IDs**: Each payment has a unique identifier to prevent replay attacks
- **Reentrancy Protection**: All external calls are protected against reentrancy
- **Access Controls**: Only authorized addresses can complete payments

## Frontend Integration Examples

### React Component for Property Purchase

```jsx
import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

function PropertyPurchase({ propertyType, level }) {
    const [paymentMethod, setPaymentMethod] = useState('LIFE');
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        
        try {
            if (paymentMethod === 'LIFE') {
                // Direct LIFE token purchase
                const price = await economyV2Contract.calculatePropertyPrice(propertyType, level);
                await lifeContract.approve(economyV2Address, price.lifePrice);
                await economyV2Contract.purchasePropertyWithLife(
                    propertyType,
                    "Property Name",
                    "Location",
                    level,
                    "metadata-uri"
                );
            } else {
                // World App WLD purchase
                const tx = await economyV2Contract.initiatePayment(
                    propertyType,
                    "Property Name",
                    "Location", 
                    level,
                    true,
                    "metadata-uri"
                );
                
                const receipt = await tx.wait();
                const paymentId = receipt.events.find(e => e.event === 'PaymentInitiated').args.paymentId;
                
                const payload = {
                    reference: paymentId,
                    to: economyV2Address,
                    tokens: [{
                        symbol: "WLD",
                        token_amount: price.wldPrice.toString()
                    }]
                };
                
                await MiniKit.commandsAsync.pay(payload);
            }
        } catch (error) {
            console.error('Purchase failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="LIFE">Pay with LIFE</option>
                <option value="WLD">Pay with WLD</option>
            </select>
            <button onClick={handlePurchase} disabled={loading}>
                {loading ? 'Processing...' : 'Purchase Property'}
            </button>
        </div>
    );
}
```

### Backend Payment Verification

```javascript
// Express.js endpoint for payment verification
app.post('/verify-payment', async (req, res) => {
    const { paymentId, worldAppTxHash } = req.body;
    
    try {
        // Verify payment with World App API
        const isValid = await verifyWorldAppPayment(worldAppTxHash);
        
        if (isValid) {
            // Complete the payment on-chain
            const tx = await economyV2Contract.completePayment(paymentId);
            await tx.wait();
            
            res.json({ success: true, txHash: tx.hash });
        } else {
            res.status(400).json({ error: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

## Gas Optimization Features

### PropertyV2 Optimizations

1. **Batch Operations**: Mint multiple properties in a single transaction
2. **Efficient Enumeration**: O(1) token lookup by owner
3. **Packed Structs**: Optimized storage layout
4. **Pagination Support**: Handle large property collections efficiently

### EconomyV2 Optimizations

1. **Minimal Storage**: Reduced storage operations
2. **Batch Fee Distribution**: Efficient fee handling
3. **Event Optimization**: Indexed events for better querying

## Error Handling

### Common Error Messages

- `"Property type not available"` - Property type is disabled or doesn't exist
- `"World ID verification required"` - Property requires World ID verification
- `"Payment not found"` - Invalid payment ID
- `"Payment expired"` - Payment took too long to complete
- `"Insufficient LIFE tokens sent to contract"` - Not enough tokens for purchase

### Frontend Error Handling

```javascript
try {
    await economyV2Contract.purchasePropertyWithLife(...);
} catch (error) {
    if (error.message.includes('World ID verification required')) {
        // Prompt user to complete World ID verification
        showWorldIDPrompt();
    } else if (error.message.includes('Property type not available')) {
        // Show property unavailable message
        showUnavailableMessage();
    } else {
        // Generic error handling
        showGenericError(error.message);
    }
}
```

## Testing Integration

### Unit Tests Example

```javascript
describe('EconomyV2 Integration', () => {
    it('should handle LIFE token purchases', async () => {
        await lifeToken.approve(economyV2.address, ethers.utils.parseEther('1000'));
        
        const tx = await economyV2.purchasePropertyWithLife(
            'house',
            'Test House',
            'Test Location',
            1,
            'test-uri'
        );
        
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'PropertyPurchased');
        
        expect(event.args.buyer).to.equal(buyer.address);
        expect(event.args.propertyType).to.equal('house');
    });
    
    it('should handle World App payment flow', async () => {
        const tx = await economyV2.initiatePayment(
            'house',
            'Test House',
            'Test Location',
            1,
            true,
            'test-uri'
        );
        
        const receipt = await tx.wait();
        const paymentId = receipt.events.find(e => e.event === 'PaymentInitiated').args.paymentId;
        
        // Simulate World App payment completion
        await economyV2.completePayment(paymentId);
        
        const payment = await economyV2.getPendingPayment(paymentId);
        expect(payment.completed).to.be.true;
    });
});
```

This integration guide provides a comprehensive overview of how to integrate the new contracts with both traditional ERC-20 payments and World App's minikit.pay() system.