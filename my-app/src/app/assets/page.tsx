"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { MiniKit } from '@worldcoin/minikit-js';
import { Building, Gem, Plus, Star, TrendingUp, Sparkles, Coins, Send, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createPublicClient, http, encodeFunctionData } from "viem";
import { worldchain } from "@/lib/chains";
import { CONTRACT_ADDRESSES, EconomyContract, WLDContract, LifeTokenContract, PropertyContract, ContractUtils, PROPERTY_TYPES, CYBERPUNK_PROPERTIES } from "@/lib/contract-utils";
import { rpcManager } from "@/utils/rpcManager";
import { CyberpunkIcons, CyberpunkIconType } from "@/components/cyberpunk-icons";
import { LIFE_ABI } from "@/lib/life-abi";
import { ECONOMYV2_ABI } from "@/lib/economyv2-abi";
import { PROPERTY_ABI } from "@/lib/property-abi";
import { WLD_ABI } from "@/lib/wld-abi";


interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  level: number;
  statusPoints: number;
  image?: string;
}

interface LimitedEdition {
  id: string;
  name: string;
  rarity: string;
  statusPoints: number;
  image?: string;
  description?: string;
}

// Convert PROPERTY_TYPES to array format for UI
const propertyTypes = Object.entries(PROPERTY_TYPES).map(([key, value]) => ({
  name: (value as any).name || key.charAt(0).toUpperCase() + key.slice(1),
  basePrice: value.basePrice,
  basePoints: value.basePoints,
  baseYield: (value as any).baseYield || 100,
  icon: value.icon,
  key: key,
  description: (value as any).description || '',
}));

// Cyberpunk properties for highlighting
const cyberpunkPropertyKeys = Object.keys(CYBERPUNK_PROPERTIES);

const rarityTypes = [
  { name: "Common", price: 500, points: 50, color: "bg-gray-500", icon: "⚪" },
  { name: "Rare", price: 1000, points: 150, color: "bg-blue-500", icon: "🔵" },
  { name: "Epic", price: 2500, points: 400, color: "bg-purple-500", icon: "🟣" },
  { name: "Legendary", price: 5000, points: 1000, color: "bg-yellow-500", icon: "🟡" },
  { name: "Mythic", price: 10000, points: 2500, color: "bg-red-500", icon: "🔴" },
];

const availableItems = [
  { name: "Golden Watch", rarity: "Legendary", description: "A timeless piece of luxury" },
  { name: "Diamond Ring", rarity: "Mythic", description: "Sparkling with eternal beauty" },
  { name: "Luxury Car", rarity: "Epic", description: "Speed meets elegance" },
  { name: "Private Jet", rarity: "Mythic", description: "Travel in ultimate style" },
  { name: "Art Collection", rarity: "Rare", description: "Curated masterpieces" },
  { name: "Designer Suit", rarity: "Common", description: "Tailored to perfection" },
];

export default function AssetsPage() {
  const { user, isAuthenticated, connectDevAccount } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'limited' | 'tokens'>('tokens');
  const [isOrbVerified, setIsOrbVerified] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [ownedItems, setOwnedItems] = useState<LimitedEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");
  const [propertyName, setPropertyName] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [lifeBalance, setLifeBalance] = useState<string>("0");
  const [wldBalance, setWldBalance] = useState<string>("0");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<'LIFE' | 'WLD'>('LIFE');
  const [propertyPrices, setPropertyPrices] = useState<{[key: string]: {lifePrice: bigint, wldPrice: bigint, isActive: boolean}}>({});
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'approving' | 'purchasing' | 'confirming'>('idle');

  // Allowlist override for gated access (lowercase addresses)
  const allowlistedAddresses = new Set<string>([
    '0x1fce79ea8510ee137f2aa2cc870ae701e240d5da',
  ]);
  const isAllowlisted = !!user?.address && allowlistedAddresses.has(user.address.toLowerCase());

  // Initialize Viem client
  const client = createPublicClient({
    chain: worldchain,
    transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
  });

  // Gate by World ID orb verification
  useEffect(() => {
    try {
      const level = localStorage.getItem('worldid_verified_level');
      setIsOrbVerified(level === 'orb');
    } catch {}
  }, []);

  // Random property name generator
  const generateRandomPropertyName = (propertyType: string) => {
    const prefixes = {
      'apartment': ['Neo', 'Cyber', 'Digital', 'Neural', 'Quantum', 'Matrix', 'Neon', 'Chrome', 'Pulse', 'Flux'],
      'house': ['Nexus', 'Vertex', 'Apex', 'Prime', 'Core', 'Edge', 'Grid', 'Node', 'Hub', 'Base'],
      'office': ['Synth', 'Tech', 'Data', 'Code', 'Byte', 'Pixel', 'Logic', 'Binary', 'System', 'Network'],
      'warehouse': ['Mega', 'Ultra', 'Hyper', 'Super', 'Omni', 'Multi', 'Macro', 'Giga', 'Meta', 'Proto'],
      'factory': ['Auto', 'Robo', 'Mech', 'Droid', 'Cyborg', 'Android', 'Synth', 'Tech', 'Nano', 'Micro'],
      'mall': ['Plaza', 'Center', 'Complex', 'Hub', 'Zone', 'District', 'Sector', 'Terminal', 'Station', 'Port']
    };
    
    const suffixes = {
      'apartment': ['Tower', 'Heights', 'Residence', 'Complex', 'Plaza', 'Gardens', 'Court', 'Terrace', 'Vista', 'Point'],
      'house': ['Manor', 'Estate', 'Villa', 'Mansion', 'Lodge', 'Retreat', 'Haven', 'Sanctuary', 'Oasis', 'Palace'],
      'office': ['Tower', 'Center', 'Building', 'Plaza', 'Complex', 'Hub', 'Headquarters', 'Campus', 'Park', 'Square'],
      'warehouse': ['Depot', 'Storage', 'Facility', 'Center', 'Complex', 'Terminal', 'Hub', 'Station', 'Base', 'Vault'],
      'factory': ['Works', 'Plant', 'Facility', 'Complex', 'Industries', 'Manufacturing', 'Production', 'Assembly', 'Forge', 'Mill'],
      'mall': ['Mall', 'Center', 'Galleria', 'Marketplace', 'Bazaar', 'Emporium', 'Exchange', 'Arcade', 'Promenade', 'Boulevard']
    };
    
    const typeKey = propertyType.toLowerCase() as keyof typeof prefixes;
    const availablePrefixes = prefixes[typeKey] || prefixes['apartment'];
    const availableSuffixes = suffixes[typeKey] || suffixes['apartment'];
    
    const randomPrefix = availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
    const randomSuffix = availableSuffixes[Math.floor(Math.random() * availableSuffixes.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    
    return `${randomPrefix} ${randomSuffix} ${randomNumber}`;
  };

  // Function to get approximate location using IP geolocation (no permission required)
  const detectLocationByIP = async () => {
    try {
      // Use ipapi.co for IP-based geolocation (free, no API key required)
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to get IP location');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'IP geolocation failed');
      }

      // Extract region information
      const city = data.city;
      const country = data.country_name;
      
      let detectedRegion = "";
      if (city && country) {
        detectedRegion = `${city}, ${country}`;
      } else if (country) {
        detectedRegion = country;
      } else {
        throw new Error("Could not determine your region from IP");
      }

      return detectedRegion;
    } catch (error) {
      console.error('IP geolocation error:', error);
      throw error;
    }
  };



  // Main location detection function (IP-based only)
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    try {
      console.log('Attempting IP-based location detection...');
      const ipRegion = await detectLocationByIP();
      console.log('IP-based location detected:', ipRegion);
      return ipRegion;
    } catch (error) {
      console.error("IP location detection failed:", error);
      setLocationError("Could not detect your location automatically. Please check your internet connection.");
      throw error;
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Fetch user's properties
  const fetchProperties = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      setLoading(true);
      console.log('[Assets Page] Fetching properties for user:', user.address);
      
      // Fetch real properties from contract
      const userProperties = await PropertyContract.getUserProperties(user.address as `0x${string}`);
      console.log('[Assets Page] Fetched properties:', userProperties);
      
      // Convert to UI format
      const formattedProperties: Property[] = userProperties.map(prop => ({
        id: prop.id,
        name: prop.name,
        type: prop.type,
        location: prop.location,
        level: prop.level,
        statusPoints: prop.statusPoints,
        image: PROPERTY_TYPES[prop.type as keyof typeof PROPERTY_TYPES]?.icon || '🏠',
      }));
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback to empty array on error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user?.address]);

  // Fetch user's limited edition NFTs
  const fetchLimitedEditions = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      setLoading(true);
      // Mock data for limited editions
      const mockItems: LimitedEdition[] = [
        {
          id: "1",
          name: "Golden Watch",
          rarity: "Legendary",
          statusPoints: 1000,
          description: "A timeless piece of luxury",
        },
      ];
      setOwnedItems(mockItems);
    } catch (error) {
      console.error('Error fetching limited editions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.address]);

  // Fetch LIFE token balance
  const fetchLifeBalance = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      console.log('[Assets Page] Starting LIFE balance fetch for:', user.address);
      setTokenLoading(true);
      
      // Use the LifeTokenContract utility instead of direct publicClient call
      const balance = await LifeTokenContract.getBalance(user.address as `0x${string}`);
      
      const formattedBalance = ContractUtils.formatTokenAmount(balance);
      console.log('[Assets Page] LIFE balance fetched successfully:', formattedBalance);
      setLifeBalance(formattedBalance);
    } catch (error) {
      console.error('[Assets Page] LIFE balance fetch failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAddress: user.address,
        timestamp: new Date().toISOString()
      });
      setLifeBalance("0");
    } finally {
      setTokenLoading(false);
    }
  }, [user?.address]);

  // Fetch WLD token balance
  const fetchWldBalance = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      const balance = await WLDContract.getBalance(user.address as `0x${string}`);
      setWldBalance(ContractUtils.formatTokenAmount(balance));
    } catch (error) {
      console.error('Error fetching WLD balance:', error);
      setWldBalance("0");
    }
  }, [user?.address]);

  // Fetch property prices from Economy contract
  const fetchPropertyPrices = useCallback(async () => {
    try {
      console.log('[Assets Page] Fetching property prices...');
      const prices: {[key: string]: {lifePrice: bigint, wldPrice: bigint, isActive: boolean}} = {};
      
      for (const propertyType of propertyTypes) {
        try {
          console.log(`[Assets Page] Fetching price for property type: ${propertyType.key}`);
          const price = await EconomyContract.getPropertyPrice(propertyType.key);
          // If contract returns inactive or zero prices, fall back to base config
          const isZero = (price.lifePrice === BigInt(0) && price.wldPrice === BigInt(0));
          if (!price.isActive || isZero) {
            const basePrice = BigInt(propertyType.basePrice * 1e18);
            prices[propertyType.key] = {
              lifePrice: basePrice,
              wldPrice: basePrice / BigInt(100),
              isActive: true,
            };
            console.warn(`[Assets Page] Price for ${propertyType.key} inactive/zero on-chain. Using base fallback.`, price);
          } else {
          prices[propertyType.key] = price;
          }
          console.log(`[Assets Page] Price fetched for ${propertyType.key}:`, {
            lifePrice: price.lifePrice.toString(),
            wldPrice: price.wldPrice.toString(),
            isActive: price.isActive
          });
        } catch (priceError) {
          console.error(`[Assets Page] Failed to fetch price for ${propertyType.key}:`, priceError);
          // Fallback to base prices from property type definition
          const basePrice = BigInt(propertyType.basePrice * 1e18); // Convert to wei
          prices[propertyType.key] = {
            lifePrice: basePrice,
            wldPrice: basePrice / BigInt(100), // Assume 1 WLD = 100 LIFE for fallback
            isActive: true // Always set to true for fallback prices
          };
          console.log(`[Assets Page] Using fallback price for ${propertyType.key}:`, {
            lifePrice: prices[propertyType.key].lifePrice.toString(),
            wldPrice: prices[propertyType.key].wldPrice.toString(),
            isActive: prices[propertyType.key].isActive
          });
        }
      }
      
      console.log('[Assets Page] All property prices loaded:', prices);
      setPropertyPrices(prices);
    } catch (error) {
      console.error('[Assets Page] Error fetching property prices:', error);
      // Set fallback prices for all property types
      const fallbackPrices: {[key: string]: {lifePrice: bigint, wldPrice: bigint, isActive: boolean}} = {};
      for (const propertyType of propertyTypes) {
        const basePrice = BigInt(propertyType.basePrice * 1e18);
        fallbackPrices[propertyType.key] = {
          lifePrice: basePrice,
          wldPrice: basePrice / BigInt(100),
          isActive: true
        };
      }
      console.log('[Assets Page] Using fallback prices for all properties:', fallbackPrices);
      setPropertyPrices(fallbackPrices);
    }
  }, []);


  useEffect(() => {
    if (isAuthenticated && user?.address) {
      fetchProperties();
      fetchLimitedEditions();
      fetchLifeBalance();
      fetchWldBalance();
    }
    // Always fetch latest prices so verified users see them immediately
    fetchPropertyPrices();
  }, [isAuthenticated, user?.address, fetchProperties, fetchLimitedEditions, fetchLifeBalance, fetchWldBalance, fetchPropertyPrices]);

  // When the purchase modal opens, refresh prices immediately and every 60s while open
  useEffect(() => {
    if (!showPurchaseModal) return;
    fetchPropertyPrices();
    const interval = setInterval(() => fetchPropertyPrices(), 60000);
    return () => clearInterval(interval);
  }, [showPurchaseModal, fetchPropertyPrices]);

  // Handle income claiming for properties
  const handleClaimIncome = async (propertyId: string) => {
    if (!user?.address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      console.log('[Assets Page] Claiming income for property:', propertyId);
      
      // Call claimPropertyIncome function on Economy contract
      // Send transaction to claim income using MiniKit
      console.log('[Claim] Sending claim income transaction...');
      
      const { finalPayload: claimResponse } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: CONTRACT_ADDRESSES.ECONOMY,
            abi: ECONOMYV2_ABI,
            functionName: 'claimPropertyIncome',
            args: [BigInt(propertyId)],
        }],
      });

      if (claimResponse.status === 'error') {
        throw new Error(`Claim failed: ${claimResponse.error_code}`);
      }

      console.log('[Claim] Income claimed successfully!');
        alert('Income claimed successfully!');
        
        // Refresh balances and properties
        fetchProperties();
        fetchLifeBalance();
    } catch (error: any) {
      console.error('Error claiming income:', error);
      alert(`Error claiming income: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle selling property to contract
  const handleSellProperty = async (propertyId: string) => {
    if (!user?.address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // First, get the buyback price to show user
      const buybackPrice = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'calculateBuybackPrice',
        args: [BigInt(propertyId)],
      }) as bigint;

      const buybackPriceFormatted = (Number(buybackPrice) / 1e18).toFixed(2);
      
      const confirmed = confirm(`Are you sure you want to sell this property?\n\nYou will receive: ${buybackPriceFormatted} LIFE tokens\n(75% of original purchase price)`);
      
      if (!confirmed) {
        return;
      }

      console.log('[Assets Page] Selling property:', propertyId);
      
      // Call sellPropertyToContract function on Economy contract using MiniKit
      console.log('[Sell] Sending sell property transaction...');
      
      const { finalPayload: sellResponse } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: CONTRACT_ADDRESSES.ECONOMY,
            abi: ECONOMYV2_ABI,
            functionName: 'sellPropertyToContract',
            args: [BigInt(propertyId)],
        }],
      });

      if (sellResponse.status === 'error') {
        throw new Error(`Sell failed: ${sellResponse.error_code}`);
      }

      console.log('[Sell] Property sold successfully!');
        alert(`Property sold successfully!\nReceived: ${buybackPriceFormatted} LIFE tokens`);
        
        // Refresh balances and properties
        fetchProperties();
        fetchLifeBalance();
    } catch (error: any) {
      console.error('Error selling property:', error);
      alert(`Error selling property: ${error.message || 'Unknown error'}`);
    }
  };

  const handlePurchaseProperty = async () => {
    console.log('[Purchase] Starting purchase flow');
    console.log('[Purchase] selectedPropertyType:', selectedPropertyType);
    console.log('[Purchase] user?.address:', user?.address);

    if (!selectedPropertyType || !user?.address) {
      alert('Please select a property type and ensure your wallet is connected');
      return;
    }

    const autoGeneratedName = generateRandomPropertyName(selectedPropertyType);
    setPropertyName(autoGeneratedName);

    let finalLocation: string = '';
    try {
      finalLocation = await detectLocation();
    } catch {
      alert('Could not detect your location automatically. Please check your internet connection and try again.');
      return;
    }

    setPurchaseLoading(true);
    setPurchaseStep('approving');

    try {
      const propertyTypeKey = selectedPropertyType;
      const priceInfo = propertyPrices[propertyTypeKey];
      const selectedType = propertyTypes.find(t => t.key === propertyTypeKey);

      let useWLD = selectedPaymentToken === 'WLD';
      let requiredAmount = priceInfo
        ? (useWLD ? priceInfo.wldPrice : priceInfo.lifePrice)
        : BigInt((selectedType?.basePrice || 0) * 1e18) / (useWLD ? BigInt(100) : BigInt(1));

      const userBalance = useWLD
        ? ContractUtils.parseTokenAmount(wldBalance)
        : ContractUtils.parseTokenAmount(lifeBalance);

      const minPaymentWei = BigInt('100000000000000000');
      if (requiredAmount < minPaymentWei) throw new Error('Payment amount too small. Minimum $0.1 equivalent required.');
      if (userBalance < requiredAmount) throw new Error(`Insufficient ${selectedPaymentToken} balance`);

      console.log(`[Purchase] Processing ${selectedPaymentToken} payment...`);

      // Use MiniKit Pay for both WLD and LIFE payments
      // 1) Initiate payment on backend
      const initiateResponse = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType: propertyTypeKey,
          paymentToken: selectedPaymentToken,
          amount: requiredAmount.toString(),
          userAddress: user.address,
          propertyName: autoGeneratedName,
          location: finalLocation,
          level: 1
        })
      });

      if (!initiateResponse.ok) {
        throw new Error('Failed to initiate payment');
      }

      const { id: paymentId } = await initiateResponse.json();

      setPurchaseStep('purchasing');

      // 2) Handle payment based on token type
      let finalPayload;
      
      if (useWLD) {
        // Use MiniKit Pay for WLD (supported token)
        const { finalPayload: wldPayload } = await MiniKit.commandsAsync.pay({
          reference: paymentId,
          to: CONTRACT_ADDRESSES.ECONOMY,
          tokens: [
            {
              symbol: 'WLD' as any, // Type assertion since MiniKit only supports WLD and USDCE
              token_amount: requiredAmount.toString() // Convert BigInt to string as expected by MiniKit
            }
          ],
          description: `Purchase ${selectedType?.name || propertyTypeKey} property: ${autoGeneratedName}`
        });
        finalPayload = wldPayload;
      } else {
        // Use sendTransaction for LIFE token (not supported by MiniKit Pay)
        // First approve the Economy contract to spend LIFE tokens
        const approveData = encodeFunctionData({
          abi: LIFE_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.ECONOMY, requiredAmount]
        });

        const { finalPayload: approvePayload } = await MiniKit.commandsAsync.sendTransaction({
          transaction: [{
            address: CONTRACT_ADDRESSES.LIFE_TOKEN,
            abi: LIFE_ABI,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.ECONOMY, requiredAmount],
          }]
        });

        if (approvePayload.status === 'error') {
          throw new Error(`LIFE token approval failed: ${approvePayload.error_code || 'Unknown error'}`);
        }

        // Then call the purchase function directly
        const { finalPayload: purchasePayload } = await MiniKit.commandsAsync.sendTransaction({
          transaction: [{
            address: CONTRACT_ADDRESSES.ECONOMY,
            abi: ECONOMYV2_ABI,
            functionName: 'purchasePropertyWithLife',
            args: [
              propertyTypeKey,
              autoGeneratedName,
              finalLocation,
              BigInt(1) // level
            ],
          }]
        });
        
        finalPayload = purchasePayload;
      }

      if (finalPayload.status === 'error') {
        throw new Error(`Payment failed: ${finalPayload.error_code || 'Unknown error'}`);
      }

      setPurchaseStep('confirming');

      // 3) Confirm payment on backend
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: finalPayload })
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const confirmResult = await confirmResponse.json();
      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Payment verification failed');
      }

      setPurchaseStep('confirming');
      alert(`Property purchased successfully with ${selectedPaymentToken}!`);

      // Reset form and refresh data
      setSelectedPropertyType('');
      setPropertyName('');
      setPropertyLocation('');
      setShowPurchaseModal(false);
      fetchProperties();
      fetchLifeBalance();
      fetchWldBalance();
    } catch (error: any) {
      console.error('Error purchasing property:', error);
      alert(`Error purchasing property: ${error.message || 'Unknown error'}`);
    } finally {
      setPurchaseLoading(false);
      setPurchaseStep('idle');
    }
  };

  const handlePurchaseItem = async (item: any) => {
    try {
      console.log('Purchasing limited edition:', item);
      
      setShowPurchaseModal(false);
      setSelectedItem(null);
      
      fetchLimitedEditions();
    } catch (error) {
      console.error('Error purchasing limited edition:', error);
    }
  };

  const getPropertyTypeInfo = (type: string) => {
    return propertyTypes.find(pt => pt.name === type) || propertyTypes[0];
  };

  const getRarityInfo = (rarity: string) => {
    return rarityTypes.find(rt => rt.name === rarity) || rarityTypes[0];
  };

  if (!isAuthenticated || (!isOrbVerified && !isAllowlisted)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-8">
        <div className="w-16 h-16 text-gray-400 mb-4 flex items-center justify-center">
          {activeTab === 'properties' ? <Building className="w-16 h-16" /> : <Gem className="w-16 h-16" />}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 text-center mb-6">Connect wallet and complete World ID (Orb) verification to access assets.</p>
        
        {/* Dev Mode Button - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={connectDevAccount}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            🚀 Connect Dev Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Cyberpunk atmospheric background */}
      <div className="absolute inset-0 opacity-20">
        {/* Data stream lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-data-stream" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-data-stream" style={{animationDelay: '1s'}} />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-data-stream" style={{animationDelay: '2s'}} />
        
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%),
            linear-gradient(0deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Static interference */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-400/10 to-transparent animate-static-noise" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent animate-screen-flicker" />
      </div>

      {/* Neural assets header */}
      <div className="relative z-10 mb-8 neural-panel p-6 animate-float">
        <div className="text-center mb-3">
          <div className="text-cyan-400 font-mono text-xs">[ASSET MANAGEMENT SYSTEM]</div>
        </div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-3 font-mono">{'>'} DIGITAL_ASSETS.exe</h1>
        <p className="text-slate-300 font-mono">{'>'} Neural interface for property and collectible management</p>
      </div>

      {/* Neural tab navigation */}
      <div className="relative z-10 flex mb-8 neural-panel p-2">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 font-mono text-sm ${
            activeTab === 'tokens'
              ? 'bg-slate-800/50 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-400/20'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/30'
          }`}
        >
          <Coins className="w-5 h-5" />
          <span className="font-medium">{'>'} tokens</span>
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 font-mono text-sm ${
            activeTab === 'properties'
              ? 'bg-slate-800/50 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-400/20'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/30'
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="font-medium">{">"} properties</span>
        </button>
        <button
          onClick={() => setActiveTab('limited')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 font-mono text-sm relative ${
            activeTab === 'limited'
              ? 'bg-slate-800/50 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-400/20'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/30'
          }`}
        >
          <Gem className="w-5 h-5" />
          <span className="font-medium">{">"} limited_editions</span>
          {/* Coming Soon Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500/40 to-orange-500/40 border border-red-400/60 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        </button>
      </div>

      {/* Properties Tab Content */}
      {activeTab === 'properties' && (
        <div className="relative z-10">
          {/* Neural properties header */}
          <div className="flex items-center justify-between mb-8 neural-panel p-6">
            <div>
              <div className="text-cyan-400 font-mono text-xs mb-2">[PROPERTY MANAGEMENT INTERFACE]</div>
              <h2 className="text-2xl font-bold text-cyan-300 mb-2 font-mono">{">"} real_estate_portfolio</h2>
              <p className="text-slate-300 font-mono">{">"} Digital property acquisition and management</p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="group relative neural-panel px-6 py-3 font-mono text-sm border-green-400/30 text-green-400 hover:border-green-400/50 hover:text-green-300 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              {/* Data stream effect */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-1 h-6 bg-gradient-to-t from-transparent via-green-400 to-transparent animate-data-stream opacity-60" />
              </div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-medium">{">"} acquire_property</span>
            </button>
          </div>

          {/* Neural properties grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neural-panel p-6 animate-pulse">
                  <div className="h-32 bg-slate-700/30 rounded-xl mb-4 animate-neural-pulse"></div>
                  <div className="h-4 bg-slate-600/30 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600/30 rounded mb-1"></div>
                  <div className="h-3 bg-slate-600/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 neural-panel">
              <div className="text-cyan-400 font-mono text-xs mb-4">[NO PROPERTIES DETECTED]</div>
              <Building className="w-20 h-20 text-cyan-400 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-bold text-cyan-300 mb-3 font-mono">{">"} portfolio_empty</h3>
              <p className="text-slate-300 mb-6 font-mono">{">"} Initialize real estate acquisition protocol</p>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="group relative neural-panel px-8 py-4 font-mono text-sm border-green-400/30 text-green-400 hover:border-green-400/50 hover:text-green-300 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300 overflow-hidden"
              >
                {/* Scanning grid overlay */}
                <div className="absolute inset-0 opacity-20">
                  <div className="biometric-scanner" />
                </div>
                <span className="relative z-10 font-bold">{">"} acquire_first_property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const typeInfo = getPropertyTypeInfo(property.type);
                const isCyberpunk = cyberpunkPropertyKeys.includes(property.type.toLowerCase());
                return (
                  <div key={property.id} className={`group neural-panel overflow-hidden transition-all duration-500 animate-float ${
                    isCyberpunk 
                      ? 'border-purple-400/50 hover:shadow-purple-400/30 hover:border-purple-400/70 bg-gradient-to-br from-purple-900/20 to-pink-900/20' 
                      : 'hover:shadow-cyan-400/20 hover:border-cyan-400/30'
                  }`} style={{animationDelay: `${Math.random() * 2}s`}}>
                    <div className="h-36 bg-gradient-to-br from-energy-primary/20 via-holographic-primary/10 to-energy-secondary/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-energy-flow"></div>
                      {isCyberpunk && CyberpunkIcons[typeInfo.icon as CyberpunkIconType] ? (
                        React.createElement(CyberpunkIcons[typeInfo.icon as CyberpunkIconType], { 
                          className: "w-16 h-16 relative z-10 filter drop-shadow-lg" 
                        })
                      ) : (
                        <span className="text-5xl relative z-10 filter drop-shadow-lg">{typeInfo.icon}</span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white text-lg">{property.name}</h3>
                        {isCyberpunk && (
                          <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 text-purple-300 px-2 py-1 rounded text-xs font-mono animate-pulse">
                            CYBER
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white mb-3">{property.location}</p>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className={`font-medium ${
                          isCyberpunk ? 'text-purple-300' : 'text-holographic-secondary'
                        }`}>{typeInfo.name}</span>
                        <span className="text-white font-bold">Level {property.level}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-holographic-primary" />
                          <span className="text-sm font-bold text-white">{property.statusPoints}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleClaimIncome(property.id)}
                            className={`group/btn relative px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 overflow-hidden ${
                              isCyberpunk 
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 hover:shadow-purple-400/20' 
                                : 'bg-gradient-to-r from-energy-primary/20 to-energy-secondary/20 border border-energy-primary/30 text-white hover:shadow-energy'
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r animate-energy-flow group-hover/btn:animate-holographic-shift ${
                              isCyberpunk 
                                ? 'from-purple-400/0 via-purple-400/10 to-purple-400/0' 
                                : 'from-energy-primary/0 via-energy-primary/10 to-energy-primary/0'
                            }`}></div>
                            <Coins className="w-3 h-3 relative z-10" />
                            <span className="relative z-10">Claim</span>
                          </button>
                          <button 
                            onClick={() => handleSellProperty(property.id)}
                            className={`group/btn relative px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 overflow-hidden ${
                              isCyberpunk 
                                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 hover:shadow-red-400/20' 
                                : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 hover:shadow-red-400/20'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r animate-energy-flow group-hover/btn:animate-holographic-shift from-red-400/0 via-red-400/10 to-red-400/0"></div>
                            <ArrowDownRight className="w-3 h-3 relative z-10" />
                            <span className="relative z-10">Sell</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Limited Editions Tab Content */}
      {activeTab === 'limited' && (
        <div className="relative z-10">
          {/* Coming Soon Overlay */}
          <div className="relative min-h-[60vh] flex items-center justify-center">
            {/* Neural Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-green-500/10"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}></div>
            </div>

            {/* Main Coming Soon Panel */}
            <div className="relative z-10 neural-panel p-12 max-w-lg text-center animate-float">
              {/* Scanning Animation */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-horizontal"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-scan-vertical"></div>
              </div>

              {/* Icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-400/50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-cyan-400/20 animate-neural-pulse">
                  <Gem className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500/40 to-orange-500/40 border border-red-400/60 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4 animate-neural-pulse">
                [LIMITED_EDITIONS]
              </h1>

              {/* Status */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-orange-400/50 text-orange-400 px-4 py-2 rounded-lg text-sm font-mono">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>COLLECTIBLES_OFFLINE</span>
                </div>
              </div>

              {/* Terminal Messages */}
              <div className="text-left space-y-2 mb-8 font-mono text-sm">
                <p className="text-slate-300">{">"} compiling_collectible_database...</p>
                <p className="text-slate-300">{">"} initializing_rarity_algorithms...</p>
                <p className="text-slate-300">{">"} synchronizing_marketplace_data...</p>
                <p className="text-cyan-400 animate-pulse">{">"} status: COMING_SOON</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-slate-800/50 rounded-full h-2 border border-slate-600/30">
                  <div className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full animate-progress" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-2">collectible_system_optimization: 75%</p>
              </div>

              {/* Coming Soon Message */}
              <p className="text-slate-300 font-mono text-center mb-4">
                exclusive_collectibles_system under_development
              </p>
              <p className="text-xs text-slate-400 font-mono">
                return_to_tokens_or_properties for_active_modules
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tokens Tab Content */}
      {activeTab === 'tokens' && (
        <div className="relative z-10">
          {/* Token Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group neural-panel p-8 hover:shadow-cyan-400/20 transition-all duration-500 animate-float">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-energy-primary/10 to-energy-secondary/10 animate-energy-flow"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent mb-3">LIFE Balance</h2>
                  <div className="text-4xl font-bold text-white mb-4">
                    {tokenLoading ? (
                      <div className="animate-pulse bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-xl h-12 w-32"></div>
                    ) : (
                      `${lifeBalance} LIFE`
                    )}
                  </div>
                  <button
                    onClick={fetchLifeBalance}
                    className="text-sm text-holographic-primary hover:text-energy-primary transition-colors flex items-center gap-2 font-medium"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Refresh Balance
                  </button>
                </div>
                
                {/* Balance Information */}
                {selectedPropertyType && propertyPrices[selectedPropertyType] && (
                  <div className="mt-3 p-3 neural-panel border-slate-600/30 bg-slate-800/30">
                    <div className="text-slate-400 font-mono text-xs mb-2">[WALLET BALANCE]</div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <div className="flex items-center gap-4">
                        <span className="text-green-400">LIFE: {lifeBalance}</span>
                        <span className="text-blue-400">WLD: {wldBalance}</span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const priceInfo = propertyPrices[selectedPropertyType];
                          const requiredAmount = selectedPaymentToken === 'WLD' ? 
                            Number(priceInfo.wldPrice) / 1e18 : 
                            Number(priceInfo.lifePrice) / 1e18;
                          const userBalance = selectedPaymentToken === 'WLD' ? 
                            parseFloat(wldBalance) : 
                            parseFloat(lifeBalance);
                          const canAfford = userBalance >= requiredAmount;
                          
                          return (
                            <span className={`text-xs ${
                              canAfford ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {canAfford ? '✓ Sufficient funds' : '✗ Insufficient funds'}
                            </span>
                          );
                        })()} 
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="group neural-panel p-8 hover:shadow-green-400/20 transition-all duration-500 animate-float" style={{animationDelay: '0.2s'}}>
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-holographic-primary/10 to-holographic-secondary/10 animate-energy-flow"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent mb-3">WLD Balance</h2>
                  <div className="text-4xl font-bold text-white mb-4">
                    {tokenLoading ? (
                      <div className="animate-pulse bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-xl h-12 w-32"></div>
                    ) : (
                      `${wldBalance} WLD`
                    )}
                  </div>
                  <button
                    onClick={fetchWldBalance}
                    className="text-sm text-holographic-primary hover:text-holographic-secondary transition-colors flex items-center gap-2 font-medium"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Refresh Balance
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowTransferModal(true)}
              className="relative overflow-hidden bg-gradient-to-r from-energy-primary to-energy-secondary text-white px-6 py-3 rounded-xl font-bold hover:shadow-energy transition-all duration-300 flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-energy-flow"></div>
              <Send className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Send Tokens</span>
            </button>
            <button
              onClick={() => { fetchLifeBalance(); fetchWldBalance(); }}
              className="neural-panel text-white px-6 py-3 font-mono font-bold hover:shadow-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 flex items-center gap-3"
            >
              <ArrowDownRight className="w-5 h-5" />
              Refresh All
            </button>
          </div>

          {/* Token Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="neural-panel p-6 hover:shadow-cyan-400/20 transition-all duration-500">
              <h3 className="text-xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <Coins className="w-6 h-6 text-energy-primary animate-holographic-shift" />
                LIFE Token
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Token Name:</span>
                  <span className="font-bold text-white">LIFE Token</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Symbol:</span>
                  <span className="font-bold text-white">LIFE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Your Balance:</span>
                  <span className="font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent">{lifeBalance} LIFE</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-300 font-medium">Contract:</span>
                  <span className="font-mono text-xs text-holographic-primary break-all max-w-[60%] text-right">
                    {CONTRACT_ADDRESSES.LIFE_TOKEN}
                  </span>
                </div>
              </div>
            </div>

            <div className="neural-panel p-6 hover:shadow-green-400/20 transition-all duration-500">
              <h3 className="text-xl font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <Coins className="w-6 h-6 text-holographic-primary animate-holographic-shift" />
                WLD Token
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Token Name:</span>
                  <span className="font-bold text-white">Worldcoin</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Symbol:</span>
                  <span className="font-bold text-white">WLD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Your Balance:</span>
                  <span className="font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent">{wldBalance} WLD</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-300 font-medium">Contract:</span>
                  <span className="font-mono text-xs text-holographic-primary break-all max-w-[60%] text-right">
                    {CONTRACT_ADDRESSES.WLD}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Recent Transactions Placeholder */}
          <div className="neural-panel p-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <ArrowUpRight className="w-6 h-6 text-holographic-primary animate-holographic-shift" />
              Recent Transactions
            </h3>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <Coins className="w-10 h-10 text-holographic-primary" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">No Transactions Yet</h4>
              <p className="text-gray-300 mb-6">Your token transactions will appear here in the digital realm</p>
              <button
                onClick={() => setShowTransferModal(true)}
                className="relative overflow-hidden bg-gradient-to-r from-energy-primary to-energy-secondary text-white px-8 py-3 rounded-xl font-bold hover:shadow-energy transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-energy-flow"></div>
                <span className="relative z-10">Make Your First Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal for Properties */}
      {showPurchaseModal && activeTab === 'properties' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative neural-panel max-w-md w-full p-6 bg-gradient-to-br from-slate-900/95 to-black/95 border border-cyan-400/30 overflow-hidden">
            {/* Cyberpunk background effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="biometric-scanner" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-xl" />
            
            {/* Header */}
            <div className="relative z-10 mb-6">
              <div className="text-cyan-400 font-mono text-xs mb-2">[PROPERTY ACQUISITION PROTOCOL]</div>
              <h2 className="text-xl font-bold text-cyan-300 font-mono">{">"} acquire_cyber_property</h2>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent mt-3" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-400 font-mono mb-2">{">"} property_type</label>
                <div className="relative">
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full bg-slate-800/50 border border-cyan-400/30 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  >
                    <option value="" className="bg-slate-800 text-cyan-300">Select cyber property type</option>
                    {propertyTypes
                      .filter(type => cyberpunkPropertyKeys.includes(type.key))
                      .map((type) => (
                        <option key={type.name} value={type.key} className="bg-slate-800 text-cyan-300">
                          {type.name} - {type.basePrice} LIFE ({type.basePoints} pts)
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-1 h-4 bg-gradient-to-t from-transparent via-cyan-400 to-transparent animate-data-stream" />
                  </div>
                </div>
                
                {/* Property Information Panel */}
                {selectedPropertyType && (() => {
                  const selectedType = propertyTypes.find(type => type.key === selectedPropertyType);
                  const priceInfo = propertyPrices[selectedPropertyType];
                  if (!selectedType) return null;

                  const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                  const lifePriceFormatted = useOnChain
                    ? Number(priceInfo.lifePrice) / 1e18 
                    : selectedType.basePrice;
                  const wldPriceFormatted = useOnChain
                    ? Number(priceInfo.wldPrice) / 1e18 
                    : (selectedType.basePrice / 100);
                  const sellValue = lifePriceFormatted * 0.75;
                  
                  return (
                    <div className="mt-4 neural-panel p-4 border-purple-400/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                      <div className="text-purple-400 font-mono text-xs mb-3">[PROPERTY ANALYSIS]</div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-300 font-mono text-sm">{">"} acquisition_cost:</span>
                          <div className="text-right">
                            <div className="text-green-400 font-mono text-sm">{lifePriceFormatted.toFixed(0)} LIFE</div>
                            <div className="text-blue-400 font-mono text-xs">{wldPriceFormatted.toFixed(1)} WLD</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-300 font-mono text-sm">{">"} buyback_value:</span>
                          <div className="text-orange-400 font-mono text-sm">{sellValue.toFixed(0)} LIFE</div>
                        </div>
                          <div className="flex justify-between items-center">
                            <span className="text-cyan-300 font-mono text-sm">{">"} base_yield_rate:</span>
                            <div className="text-purple-400 font-mono text-sm">{selectedType.baseYield} LIFE/day</div>
                          </div>
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-300 font-mono text-sm">{">"} status_points:</span>
                          <div className="text-cyan-400 font-mono text-sm">{selectedType.basePoints} pts</div>
                        </div>
                        {selectedType.description && (
                          <div className="mt-2 pt-2 border-t border-purple-400/20">
                            <div className="text-slate-300 font-mono text-xs italic">
                              {">"} {selectedType.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-400 font-mono mb-2">{">"} property_name [AUTO-GENERATED]</label>
                <div className="w-full bg-slate-800/50 border border-green-400/30 rounded-lg px-3 py-2 text-green-300 font-mono">
                  {selectedPropertyType ? generateRandomPropertyName(selectedPropertyType) : 'Select property type first'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-400 font-mono mb-2">{">"} location_coords [AUTO-DETECTED]</label>
                <div className="w-full bg-slate-800/50 border border-green-400/30 rounded-lg px-3 py-2 text-green-300 font-mono">
                  {isDetectingLocation ? (
                    <span className="text-yellow-400 animate-pulse">Detecting location...</span>
                  ) : locationError ? (
                    <span className="text-red-400">{locationError}</span>
                  ) : (
                    'Location will be detected during purchase'
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-400 font-mono mb-2">{">"} payment_protocol</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentToken('LIFE')}
                    className={`relative overflow-hidden px-3 py-2 rounded-lg border font-mono text-sm transition-all duration-300 ${
                      selectedPaymentToken === 'LIFE'
                        ? 'bg-green-500/20 border-green-400/50 text-green-300 shadow-lg shadow-green-400/20'
                        : 'bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-green-400/30 hover:text-green-400'
                    }`}
                  >
                    {selectedPaymentToken === 'LIFE' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-energy-flow" />
                    )}
                    <span className="relative z-10">
                      {(() => {
                        if (!selectedPropertyType) return `LIFE (${lifeBalance} available)`;
                        const selectedType = propertyTypes.find(t => t.key === selectedPropertyType);
                        const priceInfo = propertyPrices[selectedPropertyType];
                        const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                        const value = useOnChain
                          ? (Number(priceInfo.lifePrice) / 1e18)
                          : (selectedType?.basePrice || 0);
                        const hasEnough = parseFloat(lifeBalance) >= value;
                        return (
                          <div className="flex flex-col items-center">
                            <div className="text-xs">{value.toFixed(0)} LIFE</div>
                            <div className={`text-[10px] ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                              {lifeBalance} available
                            </div>
                          </div>
                        );
                      })()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentToken('WLD')}
                    className={`relative overflow-hidden px-3 py-2 rounded-lg border font-mono text-sm transition-all duration-300 ${
                      selectedPaymentToken === 'WLD'
                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 shadow-lg shadow-blue-400/20'
                        : 'bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-blue-400/30 hover:text-blue-400'
                    }`}
                  >
                    {selectedPaymentToken === 'WLD' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-energy-flow" />
                    )}
                    <span className="relative z-10">
                      {(() => {
                        if (!selectedPropertyType) return `WLD (${wldBalance} available)`;
                        const selectedType = propertyTypes.find(t => t.key === selectedPropertyType);
                        const priceInfo = propertyPrices[selectedPropertyType];
                        const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                        const value = useOnChain
                          ? (Number(priceInfo.wldPrice) / 1e18)
                          : ((selectedType?.basePrice || 0) / 100);
                        const hasEnough = parseFloat(wldBalance) >= value;
                        return (
                          <div className="flex flex-col items-center">
                            <div className="text-xs">{value.toFixed(1)} WLD</div>
                            <div className={`text-[10px] ${hasEnough ? 'text-blue-400' : 'text-red-400'}`}>
                              {wldBalance} available
                            </div>
                          </div>
                        );
                      })()}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="relative z-10 flex gap-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 neural-panel px-4 py-2 font-mono text-sm border-red-400/30 text-red-400 hover:border-red-400/50 hover:text-red-300 hover:shadow-lg hover:shadow-red-400/20 transition-all duration-300"
              >
                {">"} abort_protocol
              </button>
              <button
                onClick={handlePurchaseProperty}
                disabled={purchaseLoading || !selectedPropertyType || (() => {
                  if (!selectedPropertyType) return true;
                  const selectedType = propertyTypes.find(t => t.key === selectedPropertyType);
                  const priceInfo = propertyPrices[selectedPropertyType];
                  const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                  const value = selectedPaymentToken === 'LIFE' 
                    ? (useOnChain ? (Number(priceInfo.lifePrice) / 1e18) : (selectedType?.basePrice || 0))
                    : (useOnChain ? (Number(priceInfo.wldPrice) / 1e18) : ((selectedType?.basePrice || 0) / 100));
                  const userBalance = selectedPaymentToken === 'LIFE' ? parseFloat(lifeBalance) : parseFloat(wldBalance);
                  return userBalance < value;
                })()}
                className={`group relative flex-1 neural-panel px-4 py-2 font-mono text-sm transition-all duration-300 overflow-hidden ${
                  (() => {
                    const isDisabled = purchaseLoading || !selectedPropertyType || (() => {
                      if (!selectedPropertyType) return true;
                      const selectedType = propertyTypes.find(t => t.key === selectedPropertyType);
                      const priceInfo = propertyPrices[selectedPropertyType];
                      const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                      const value = selectedPaymentToken === 'LIFE' 
                        ? (useOnChain ? (Number(priceInfo.lifePrice) / 1e18) : (selectedType?.basePrice || 0))
                        : (useOnChain ? (Number(priceInfo.wldPrice) / 1e18) : ((selectedType?.basePrice || 0) / 100));
                      const userBalance = selectedPaymentToken === 'LIFE' ? parseFloat(lifeBalance) : parseFloat(wldBalance);
                      return userBalance < value;
                    })();
                    
                    if (isDisabled) {
                      return 'border-slate-600/30 text-slate-600 cursor-not-allowed';
                    }
                    
                    return selectedPaymentToken === 'LIFE' 
                      ? 'border-green-400/30 text-green-400 hover:border-green-400/50 hover:text-green-300 hover:shadow-lg hover:shadow-green-400/20' 
                      : 'border-blue-400/30 text-blue-400 hover:border-blue-400/50 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-400/20';
                  })()
                }`}
              >
                {!purchaseLoading && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-energy-flow ${
                    selectedPaymentToken === 'LIFE' ? 'via-green-400/10' : 'via-blue-400/10'
                  }`} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {purchaseLoading && (
                    <div className={`w-3 h-3 border rounded-full animate-spin ${
                      selectedPaymentToken === 'LIFE' 
                        ? 'border-green-400/50 border-t-green-400' 
                        : 'border-blue-400/50 border-t-blue-400'
                    }`} />
                  )}
                  {(() => {
                    if (purchaseLoading) {
                      switch (purchaseStep) {
                        case 'approving': return '{">"} approving_tokens...';
                        case 'purchasing': return '{">"} sending_purchase...';
                        case 'confirming': return '{">"} confirming_tx...';
                        default: return '{">"} processing...';
                      }
                    }
                    
                    if (!selectedPropertyType) {
                      return '{">"} select_property_first';
                    }
                    
                    const selectedType = propertyTypes.find(t => t.key === selectedPropertyType);
                    const priceInfo = propertyPrices[selectedPropertyType];
                    const useOnChain = priceInfo && priceInfo.isActive && (priceInfo.lifePrice !== BigInt(0) || priceInfo.wldPrice !== BigInt(0));
                    const value = selectedPaymentToken === 'LIFE' 
                      ? (useOnChain ? (Number(priceInfo.lifePrice) / 1e18) : (selectedType?.basePrice || 0))
                      : (useOnChain ? (Number(priceInfo.wldPrice) / 1e18) : ((selectedType?.basePrice || 0) / 100));
                    const userBalance = selectedPaymentToken === 'LIFE' ? parseFloat(lifeBalance) : parseFloat(wldBalance);
                    
                    if (userBalance < value) {
                      return `{">"} insufficient_${selectedPaymentToken}`;
                    }
                    
                    return `{">"} acquire_with_${selectedPaymentToken}`;
                  })()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal for Limited Editions */}
      {showPurchaseModal && activeTab === 'limited' && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Confirmation</h2>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedItem.name}</h3>
              <p className="text-gray-600 mb-3">{selectedItem.description}</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-white font-medium ${selectedItem.color}`}>
                  {selectedItem.rarity}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{selectedItem.points} points</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="text-xl font-bold text-green-600">{selectedItem.price} LIFE</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchaseItem(selectedItem)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal for LIFE Tokens */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Send LIFE Tokens
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LIFE)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={lifeBalance}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Available: {lifeBalance} LIFE</span>
                  <button
                    onClick={() => setTransferAmount(lifeBalance)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">You will send:</span>
                <span className="font-bold text-gray-900">{transferAmount || '0'} LIFE</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Network fee:</span>
                <span className="text-gray-500">~0.001 ETH</span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferAddress("");
                  setTransferAmount("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement actual transfer functionality
                  console.log('Transfer:', { to: transferAddress, amount: transferAmount });
                  alert('Transfer functionality will be implemented with wallet integration');
                  setShowTransferModal(false);
                  setTransferAddress("");
                  setTransferAmount("");
                }}
                disabled={!transferAddress || !transferAmount || parseFloat(transferAmount) <= 0}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}