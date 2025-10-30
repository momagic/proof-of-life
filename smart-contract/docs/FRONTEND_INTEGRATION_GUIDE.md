# 🎯 Frontend Integration Guide - Production Ready

This guide ensures your frontend properly handles the **claim → purchase → yield** flow for production deployment.

## 🔄 **Required User Flow**

### **Step 1: World ID Orb Verification**
```typescript
// User must complete orb verification first
const verifyPayload: VerifyCommandInput = {
  action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || "proof-of-life",
  signal: userAddress, // User's wallet address
  verification_level: VerificationLevel.Orb, // ✅ Orb verification required
};

const { proof } = await fetch("/api/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(verifyPayload),
}).then(res => res.json());
```

### **Step 2: Claim LIFE Tokens (Sets Region)**
```typescript
// This MUST happen before any purchases
const claimLifeTokens = async (proof: any, region: string) => {
  try {
    const tx = await lifeContract.claimWithOrbVerification(
      userAddress,        // signal (must match sender)
      proof.merkle_root,  // root from World ID proof
      proof.nullifier_hash, // nullifier from World ID proof
      proof.proof,        // proof array from World ID
      region             // user's region (e.g., "United States")
    );
    
    await tx.wait();
    console.log("✅ LIFE tokens claimed and region set");
    return true;
  } catch (error) {
    console.error("❌ Claim failed:", error);
    return false;
  }
};
```

### **Step 3: Verify User Can Purchase**
```typescript
const checkUserReadyForPurchase = async (userAddress: string) => {
  try {
    // Check if user has LIFE tokens
    const lifeBalance = await lifeContract.balanceOf(userAddress);
    
    // Check if user has region set (from claiming)
    const userRegion = await lifeContract.getUserRegion(userAddress);
    
    const isReady = lifeBalance > 0 && userRegion.length > 0;
    
    return {
      ready: isReady,
      lifeBalance: ethers.formatEther(lifeBalance),
      region: userRegion,
      message: isReady 
        ? "Ready to purchase!" 
        : "Please claim LIFE tokens first"
    };
  } catch (error) {
    return { ready: false, message: "Error checking status" };
  }
};
```

### **Step 4: Property Purchase**
```typescript
const purchaseProperty = async (
  propertyType: string,
  name: string,
  location: string,
  level: number,
  useWLD: boolean,
  tokenURI: string
) => {
  try {
    // 1. Check user is ready
    const readyStatus = await checkUserReadyForPurchase(userAddress);
    if (!readyStatus.ready) {
      throw new Error(readyStatus.message);
    }
    
    // 2. Get property price
    const price = await economyContract.getPropertyPrice(propertyType);
    const finalPrice = price.lifePrice * BigInt(100 + (level - 1) * 20) / BigInt(100);
    
    // 3. Approve tokens if using LIFE
    if (!useWLD) {
      const approveTx = await lifeContract.approve(economyAddress, finalPrice);
      await approveTx.wait();
    }
    
    // 4. Purchase property
    const purchaseTx = await economyContract.purchaseProperty(
      propertyType,
      name,
      location,
      level,
      useWLD,
      tokenURI
    );
    
    const receipt = await purchaseTx.wait();
    console.log("✅ Property purchased successfully");
    return receipt;
    
  } catch (error) {
    console.error("❌ Purchase failed:", error);
    throw error;
  }
};
```

### **Step 5: Income Claiming**
```typescript
const claimPropertyIncome = async (tokenId: number) => {
  try {
    // Check claimable income
    const [income, days] = await economyContract.calculatePropertyIncome(tokenId);
    
    if (income === 0n) {
      throw new Error("No income to claim yet");
    }
    
    // Claim income
    const claimTx = await economyContract.claimPropertyIncome(tokenId);
    await claimTx.wait();
    
    console.log(`✅ Claimed ${ethers.formatEther(income)} LIFE`);
    return { income, days };
    
  } catch (error) {
    console.error("❌ Income claim failed:", error);
    throw error;
  }
};
```

## 🔧 **Contract Configuration**

### **Production Contract Addresses**
```typescript
const CONTRACTS = {
  // Update these with your production deployment addresses
  LIFE_TOKEN: "0x[YOUR_PRODUCTION_LIFE_ADDRESS]",
  ECONOMY: "0x[YOUR_PRODUCTION_ECONOMY_ADDRESS]",
  PROPERTY: "0x[YOUR_PRODUCTION_PROPERTY_ADDRESS]",
  WORLD_ID_ROUTER: "0x17B354dD2595411ff79041f930e491A4Df39A278", // Real Router
};

const WORLDCHAIN_CONFIG = {
  chainId: 480,
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  blockExplorer: "https://explorer.worldcoin.org"
};
```

### **ABI Imports**
```typescript
import { abi as LifeABI } from "./abis/LIFE.json";
import { abi as EconomyABI } from "./abis/Economy.json";
import { abi as PropertyABI } from "./abis/Property.json";
```

## 🎨 **UI/UX Flow Implementation**

### **1. Initial User State Check**
```typescript
const UserStatusCard = () => {
  const [userStatus, setUserStatus] = useState(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkUserReadyForPurchase(userAddress);
      setUserStatus(status);
    };
    
    if (userAddress) checkStatus();
  }, [userAddress]);
  
  if (!userStatus?.ready) {
    return (
      <Card>
        <h3>🔐 Get Started</h3>
        <p>Complete World ID verification to claim LIFE tokens</p>
        <Button onClick={handleWorldIDVerification}>
          Verify with World ID Orb
        </Button>
      </Card>
    );
  }
  
  return (
    <Card>
      <h3>✅ Ready to Play!</h3>
      <p>Balance: {userStatus.lifeBalance} LIFE</p>
      <p>Region: {userStatus.region}</p>
    </Card>
  );
};
```

### **2. Property Purchase Interface**
```typescript
const PropertyPurchaseCard = ({ propertyType }: { propertyType: string }) => {
  const [purchasing, setPurchasing] = useState(false);
  const [userReady, setUserReady] = useState(false);
  
  useEffect(() => {
    checkUserReadyForPurchase(userAddress).then(status => {
      setUserReady(status.ready);
    });
  }, []);
  
  const handlePurchase = async () => {
    if (!userReady) {
      toast.error("Please claim LIFE tokens first!");
      return;
    }
    
    setPurchasing(true);
    try {
      await purchaseProperty(propertyType, name, location, level, false, tokenURI);
      toast.success("Property purchased successfully! 🏠");
    } catch (error) {
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };
  
  return (
    <Card>
      <h3>{propertyType}</h3>
      <Button 
        onClick={handlePurchase} 
        disabled={!userReady || purchasing}
      >
        {!userReady ? "Claim LIFE First" : "Purchase"}
      </Button>
    </Card>
  );
};
```

### **3. Income Dashboard**
```typescript
const IncomeDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [totalIncome, setTotalIncome] = useState("0");
  
  const loadUserProperties = async () => {
    const propertyIds = await propertyContract.getPropertiesByOwner(userAddress);
    const propertiesData = await Promise.all(
      propertyIds.map(async (id) => {
        const [income, days] = await economyContract.calculatePropertyIncome(id);
        const propertyInfo = await propertyContract.getProperty(id);
        
        return {
          id: id.toString(),
          name: propertyInfo[0],
          type: propertyInfo[1],
          level: propertyInfo[3].toString(),
          claimableIncome: ethers.formatEther(income),
          daysSinceLastClaim: days.toString()
        };
      })
    );
    
    setProperties(propertiesData);
    
    const total = propertiesData.reduce((sum, prop) => 
      sum + parseFloat(prop.claimableIncome), 0
    );
    setTotalIncome(total.toFixed(4));
  };
  
  const claimAllIncome = async () => {
    try {
      const claimableIds = properties
        .filter(p => parseFloat(p.claimableIncome) > 0)
        .map(p => p.id);
      
      if (claimableIds.length === 0) {
        toast.info("No income to claim yet");
        return;
      }
      
      const tx = await economyContract.claimAllPropertyIncome(claimableIds);
      await tx.wait();
      
      toast.success(`Claimed ${totalIncome} LIFE! 💰`);
      loadUserProperties(); // Refresh
      
    } catch (error) {
      toast.error(`Claim failed: ${error.message}`);
    }
  };
  
  return (
    <div>
      <h2>💰 Income Dashboard</h2>
      <p>Total Claimable: {totalIncome} LIFE</p>
      <Button onClick={claimAllIncome}>Claim All Income</Button>
      
      {properties.map(property => (
        <PropertyIncomeCard key={property.id} property={property} />
      ))}
    </div>
  );
};
```

## 🚨 **Error Handling**

### **Common Errors & Solutions**
```typescript
const handleContractError = (error: any) => {
  const message = error.message || error.toString();
  
  if (message.includes("Player not registered")) {
    return "Please claim LIFE tokens first to set your region";
  }
  
  if (message.includes("Nullifier already used")) {
    return "You've already claimed your daily LIFE tokens";
  }
  
  if (message.includes("Daily reward not available yet")) {
    return "Please wait 24 hours between LIFE token claims";
  }
  
  if (message.includes("Insufficient contract LIFE balance")) {
    return "Property buyback temporarily unavailable";
  }
  
  if (message.includes("Must wait at least 1 day")) {
    return "Property income available after 24 hours";
  }
  
  return `Transaction failed: ${message}`;
};
```

## 📱 **Mobile Optimization**

### **World ID Mobile Integration**
```typescript
// Ensure World ID works on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const verifyWithWorldID = async () => {
  if (isMobile) {
    // Use World ID mobile app flow
    window.location.href = `worldcoin://verify?action=${actionId}&signal=${userAddress}`;
  } else {
    // Use desktop QR code flow
    // Standard World ID verification
  }
};
```

## 🔐 **Security Best Practices**

### **Input Validation**
```typescript
const validatePurchaseInputs = (name: string, location: string, level: number) => {
  if (!name || name.length === 0) throw new Error("Property name required");
  if (!location || location.length === 0) throw new Error("Location required");
  if (level < 1 || level > 10) throw new Error("Level must be 1-10");
  if (name.length > 50) throw new Error("Name too long");
  if (location.length > 50) throw new Error("Location too long");
};
```

### **Transaction Safety**
```typescript
const safeContractCall = async (contractCall: () => Promise<any>) => {
  try {
    const tx = await contractCall();
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      throw new Error("Transaction failed");
    }
    
    return receipt;
  } catch (error) {
    console.error("Contract call failed:", error);
    throw new Error(handleContractError(error));
  }
};
```

## 🎯 **Production Checklist**

### **Before Going Live:**
- [ ] **Update contract addresses** to production deployments
- [ ] **Test complete flow** with real orb-verified users
- [ ] **Verify World ID configuration** (App ID, Action, Router address)
- [ ] **Test error handling** for all edge cases
- [ ] **Optimize gas estimates** for better UX
- [ ] **Add transaction monitoring** and analytics
- [ ] **Test mobile compatibility** thoroughly
- [ ] **Set up customer support** for user issues

### **Launch Day:**
- [ ] **Monitor contract interactions** closely
- [ ] **Watch for failed transactions** and user issues
- [ ] **Have support team ready** for World ID questions
- [ ] **Track key metrics** (claims, purchases, income claims)

---

**🚀 Your frontend is now ready for production with proper World ID integration!**
