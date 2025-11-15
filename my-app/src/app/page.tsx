"use client";

import { useState, useEffect, useCallback } from "react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { LifeTimer } from "@/components/LifeTimer";
import { VerifyButton } from "@/components/VerifyButton";
import { ClaimButton } from "@/components/ClaimButton";
import { WalletAuthButton } from "@/components/wallet-auth-button";
import { TransactionStatus } from "@/components/TransactionStatus";
import Globe3D from "@/components/Globe3D";
import { useGeolocation } from "@/components/Globe3D";
import { LifeTokenContract, ContractUtils } from "@/lib/contract-utils";
import { createPublicClient, http } from "viem";
import { worldchain } from "@/lib/chains";
import { InfoButton } from "@/components/InfoButton";
import { WhitePaperModal } from "@/components/WhitePaperModal";

// // This would come from environment variables in a real app
// const APP_ID =
//   process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID ||
//   "app_9a73963d73efdf2e7d9472593dc9dffd";

interface ClaimLocation {
  lat: number;
  lng: number;
  timestamp: number;
  id: string;
}

export default function Page() {
  const { isAuthenticated, user, isLoading: authLoading, connectWallet, disconnect } = useUnifiedAuth();
  const { getCurrentLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const [walletConnected, setWalletConnected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [lifeClaimed, setLifeClaimed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [lifetimeCheckIns, setLifetimeCheckIns] = useState(0);
  const [transactionId, setTransactionId] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);
  const [claimLocations, setClaimLocations] = useState<ClaimLocation[]>([]);
  const [showClaimCelebration, setShowClaimCelebration] = useState(false);
  const [showWhitePaper, setShowWhitePaper] = useState(false);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [contractStatus, setContractStatus] = useState<'active' | 'inactive'>('inactive');
  const [recentBlockchainClaims, setRecentBlockchainClaims] = useState<ClaimLocation[]>([]);
  const [isLoadingBlockchainClaims, setIsLoadingBlockchainClaims] = useState(false);
  const [alive24h, setAlive24h] = useState(0);

  // Create Viem client for transaction tracking
  const client = createPublicClient({
    chain: worldchain,
    transport: http(),
  });

  // Contract interaction utilities are now handled by LifeTokenContract class

  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const track = async () => {
      if (!transactionId) return;
      setIsConfirming(true);
      const ok = await ContractUtils.waitForTransaction(transactionId);
      if (!cancelled) {
        setIsConfirmed(ok);
        setIsConfirming(false);
      }
    };
    track();
    return () => { cancelled = true; };
  }, [transactionId]);

  // Function to fetch recent blockchain claims
  const fetchRecentBlockchainClaims = useCallback(async () => {
    try {
      setIsLoadingBlockchainClaims(true);
      console.log('🌍 Fetching recent blockchain claims...');
      const recentEvents = await LifeTokenContract.getRecentClaimEvents(5);
      console.log('📊 Found', recentEvents.length, 'recent claim events');
      
      const blockchainClaims: ClaimLocation[] = [];
      
      for (const event of recentEvents) {
        try {
          const coords = await LifeTokenContract.getCoordinatesForRegion(event.region);
          if (coords) {
            blockchainClaims.push({
              lat: coords.lat,
              lng: coords.lng,
              timestamp: event.timestamp * 1000, // Convert to milliseconds
              id: `blockchain-${event.transactionHash}-${event.blockNumber}`
            });
          }
        } catch (error) {
          console.error('Error processing blockchain claim event:', error);
        }
      }
      
      console.log('🗺️ Converted', blockchainClaims.length, 'blockchain claims to coordinates');
      setRecentBlockchainClaims(blockchainClaims);
    } catch (error) {
      console.error('Error fetching recent blockchain claims:', error);
      setRecentBlockchainClaims([]);
    } finally {
      setIsLoadingBlockchainClaims(false);
    }
  }, []);

  const fetchAliveLast24h = useCallback(async () => {
    try {
      const count = await LifeTokenContract.getUniqueClaimersLast24h();
      setAlive24h(count);
    } catch (e) {
      setAlive24h(0);
    }
  }, []);

  // Function to fetch cooldown time from contract
  const fetchCooldownTime = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      const timeUntilNext = await LifeTokenContract.getTimeUntilNextClaim(user.address as `0x${string}`);
      
      const cooldownSeconds = Number(timeUntilNext);
      setTimeRemaining(cooldownSeconds);
      
      // If cooldown is 0, user can claim again
      if (cooldownSeconds === 0) {
        setLifeClaimed(false);
        setVerified(false);
      } else {
        setLifeClaimed(true);
      }
    } catch (error) {
      console.error('Error fetching cooldown time:', error);
    }
  }, [user?.address]);

  // Function to fetch contract data
  const fetchContractData = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      // Fetch user balance
      const balance = await LifeTokenContract.getBalance(user.address as `0x${string}`);
      setUserBalance(LifeTokenContract.formatBalance(balance));
      
      // Fetch total supply
      const supply = await LifeTokenContract.getTotalSupply();
      setTotalSupply(LifeTokenContract.formatBalance(supply));
      
      // Fetch lifetime check-ins from blockchain
      const checkIns = await LifeTokenContract.getLifetimeCheckIns(user.address as `0x${string}`);
      const checkInsNumber = Number(checkIns);
      setLifetimeCheckIns(checkInsNumber);
      console.log('📊 Lifetime check-ins from blockchain:', checkInsNumber);
      
      // Set contract as active if we can fetch data
      setContractStatus('active');
    } catch (error) {
      console.error('Error fetching contract data:', error);
      setContractStatus('inactive');
    }
  }, [user?.address]);

  // Check if user is authenticated when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.address) {
      setWalletConnected(true);
      console.log("User authenticated:", { address: user.address });
      // Fetch contract data when user is authenticated
      fetchContractData();
    } else {
      setWalletConnected(false);
    }
  }, [isAuthenticated, user, fetchContractData]);

  // Periodically fetch contract data
  useEffect(() => {
    if (isAuthenticated && user?.address) {
      const interval = setInterval(() => {
        fetchContractData();
      }, 120000); // Update every 2 minutes to reduce RPC load
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.address, fetchContractData]);

  // Auto-connect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.address && !walletConnected) {
      setWalletConnected(true);
      console.log("Auto-connected authenticated user:", user.address);
    }
  }, [isAuthenticated, user, walletConnected]);

  // Update UI when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && !lifeClaimed) {
      setClaimCount((prevCount) => prevCount + 1);
      setIsMinting(false);
      // Fetch new cooldown time after successful claim
      setTimeout(() => {
        fetchCooldownTime();
      }, 2000); // Wait 2 seconds for blockchain to update
    }
  }, [isConfirmed, lifeClaimed, fetchCooldownTime]);

  // Handle wallet connection success
  const handleWalletConnected = async () => {
    const success = await connectWallet();
    if (success) {
      setWalletConnected(true);
      console.log("Wallet connected successfully");
    } else {
      console.error("Failed to connect wallet");
    }
  };

  // Handle verification success
  const handleVerificationSuccess = () => {
    console.log("Verification success callback triggered in LifeApp");
    setVerified(true);
  };

  // Load locations from localStorage on mount
  useEffect(() => {
    const savedLocations = localStorage.getItem('claimLocations');
    if (savedLocations) {
      try {
        setClaimLocations(JSON.parse(savedLocations));
      } catch (error) {
        console.error('Error loading saved locations:', error);
      }
    }
  }, []);

  // Generate globe locations based on blockchain claim count
  const generateGlobeLocations = useCallback((claimCount: number) => {
    const locations: ClaimLocation[] = [];
    
    // Generate locations for each claim
    for (let i = 0; i < claimCount; i++) {
      // Create deterministic but varied locations based on user address and claim index
      const seed = user?.address ? parseInt(user.address.slice(-8), 16) + i : i;
      const lat = (Math.sin(seed * 0.1) * 90); // -90 to 90
      const lng = (Math.cos(seed * 0.1) * 180); // -180 to 180
      
      locations.push({
        lat,
        lng,
        timestamp: Date.now() - (claimCount - i) * 24 * 60 * 60 * 1000, // Spread over days
        id: `blockchain-claim-${i}`
      });
    }
    
    return locations;
  }, [user?.address]);

  // Update globe locations when lifetime check-ins change (only if no real locations exist)
  useEffect(() => {
    if (lifetimeCheckIns > 0 && claimLocations.length === 0) {
      const generatedLocations = generateGlobeLocations(lifetimeCheckIns);
      setClaimLocations(generatedLocations);
      console.log('🌍 Generated', lifetimeCheckIns, 'globe locations from blockchain data');
    }
  }, [lifetimeCheckIns, generateGlobeLocations, claimLocations.length]);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    if (claimLocations.length > 0) {
      localStorage.setItem('claimLocations', JSON.stringify(claimLocations));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('claimLocationUpdated'));
      
      // Also refresh blockchain claims directly
      setTimeout(() => {
        fetchRecentBlockchainClaims();
      }, 2000); // Wait 2 seconds for transaction to be mined
    }
  }, [claimLocations, fetchRecentBlockchainClaims]);

  // Handle claim success with location capture
  const handleClaimSuccess = async (txId: string, coordinates?: { lat: number; lng: number }) => {
    console.log("Claim initiated with transaction ID:", txId);
    console.log("Received coordinates from ClaimButton:", coordinates);
    setTransactionId(txId);
    setIsMinting(true);
    
    // Immediately set lifeClaimed to true and start cooldown timer
    setLifeClaimed(true);
    // Set initial cooldown time (24 hours = 86400 seconds)
    setTimeRemaining(86400);
    console.log("✅ Cooldown timer activated immediately after successful claim");
    
    // Use coordinates from ClaimButton if available
    if (coordinates) {
      const newLocation: ClaimLocation = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        timestamp: Date.now(),
        id: `${txId}-${Date.now()}`
      };
      setClaimLocations(prev => {
        // Avoid duplicates by checking if location already exists
        const exists = prev.some(loc => 
          Math.abs(loc.lat - newLocation.lat) < 0.1 && 
          Math.abs(loc.lng - newLocation.lng) < 0.1 &&
          Math.abs(loc.timestamp - newLocation.timestamp) < 60000
        );
        return exists ? prev : [...prev, newLocation];
      });
      console.log('✅ Location data successfully processed and added to globe:', newLocation);
      console.log('📍 Globe will now light up at coordinates:', `${coordinates.lat}, ${coordinates.lng}`);
    } else {
      // Fallback: try to get user location
      try {
        const location = await getCurrentLocation();
        const newLocation: ClaimLocation = {
          lat: location.lat,
          lng: location.lng,
          timestamp: Date.now(),
          id: `${txId}-${Date.now()}`
        };
        setClaimLocations(prev => {
          // Avoid duplicates
          const exists = prev.some(loc => 
            Math.abs(loc.lat - newLocation.lat) < 0.1 && 
            Math.abs(loc.lng - newLocation.lng) < 0.1 &&
            Math.abs(loc.timestamp - newLocation.timestamp) < 60000
          );
          return exists ? prev : [...prev, newLocation];
        });
        console.log('Location captured via fallback:', location);
      } catch (error) {
        console.log('Could not capture location:', error);
        // Continue without location - this is optional
      }
    }
  };

  // Check cooldown time when user connects or transaction confirms
  useEffect(() => {
    if (user?.address) {
      fetchCooldownTime();
    }
  }, [user?.address, fetchCooldownTime]);

  // Fetch recent blockchain claims on mount and periodically
  useEffect(() => {
    fetchRecentBlockchainClaims();
    fetchAliveLast24h();
    
    // Refresh blockchain claims and 24h alive every 60 seconds
    const interval = setInterval(() => {
      fetchRecentBlockchainClaims();
      fetchAliveLast24h();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchRecentBlockchainClaims, fetchAliveLast24h]);

  // Timer effect for claim cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (lifeClaimed && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            // When timer reaches zero, enable claiming again
            setLifeClaimed(false);
            setVerified(false); // Reset verification for next claim cycle
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lifeClaimed, timeRemaining]);

  // Show welcome screen if not authenticated
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden transition-all duration-700 ease-in-out">
        {/* White Paper Info Icon */}
        <InfoButton 
          onClick={() => setShowWhitePaper(!showWhitePaper)} 
          isOpen={showWhitePaper} 
        />

        {/* Cyberpunk atmospheric background */}
        <div className="absolute inset-0 opacity-20">
          {/* Data stream lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-data-stream"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-data-stream" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-data-stream" style={{animationDelay: '0.5s'}}></div>
          
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%),
                linear-gradient(0deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          {/* Static interference */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-400/10 to-transparent animate-static-noise" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent animate-screen-flicker" />
        </div>
        
        {/* Main content container */}
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-30 gap-8 animate-fade-in">
          {/* Neural interface header */}
          <div className="text-center transform transition-all duration-700 ease-in-out">
            <div className="neural-panel p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2 font-mono text-xs text-green-400">
                <span>[NEURAL INTERFACE INITIALIZED]</span>
                <span className="animate-terminal-blink">_</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-light text-cyan-300 mb-4 font-mono glitch-text">
                PROOF OF LIFE PROTOCOL
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg font-mono">
                {'>'} Biometric verification required
              </p>
              <p className="text-slate-400 text-xs sm:text-sm font-mono mt-2">
                {'>'} Neural link status: DISCONNECTED
              </p>
            </div>
            <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto animate-data-stream"></div>
          </div>

          {/* 2. Globe */}
           <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
             <Globe3D 
               locations={[...recentBlockchainClaims, ...claimLocations].slice(-5)} 
               isLoadingBlockchain={isLoadingBlockchainClaims}
               alive24h={alive24h}
             />
           </div>

          {/* Neural rewards display */}
          <div className="neural-panel p-4 max-w-lg transform transition-all duration-700 ease-in-out hover:scale-105">
            <div className="text-center space-y-3">
              <div className="text-green-400 font-mono text-xs mb-3">[REWARD PROTOCOLS DETECTED]</div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2 font-mono">
                  <div className={`w-2 h-2 rounded-full animate-neural-pulse ${
                    contractStatus === 'active' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className={contractStatus === 'active' ? 'text-green-300' : 'text-red-300'}>
                    {'>'} contract_{contractStatus}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
                  <span className="text-cyan-300">
                    {'>'} {userBalance} balance
                  </span>
                </div>
                
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-neural-pulse" />
                  <span className="text-purple-300">
                    {'>'} {totalSupply} supply
                  </span>
                </div>
                
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-neural-pulse" />
                  <span className="text-yellow-300">
                    {'>'} daily_claim
                  </span>
                </div>
              </div>
              
              <div className="text-slate-400 font-mono text-xs mt-2">
                {'>'} Biometric authentication required for access
              </div>
            </div>
          </div>

          {/* Neural authentication interface */}
          <div className="w-full max-w-md transform transition-all duration-700 ease-in-out">
            <button
              onClick={handleWalletConnected}
              disabled={authLoading}
              className="w-full neural-panel relative overflow-hidden font-mono text-lg font-bold py-8 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border bg-gradient-to-r from-slate-900/20 to-gray-900/20 border-slate-400/30 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20 disabled:opacity-50 group transform hover:scale-105"
            >
              {/* Scanning grid overlay when loading */}
              {authLoading && (
                <div className="absolute inset-0 opacity-20">
                  <div className="biometric-scanner" />
                </div>
              )}
              
              {/* Data stream effect */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-8 bg-gradient-to-t from-transparent via-cyan-400 to-transparent animate-data-stream opacity-60" />
              </div>
              
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 transform transition-all duration-300">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="relative z-10 transform transition-all duration-300">
                {authLoading ? "> Establishing neural link..." : "> Initialize World ID Protocol"}
              </span>
            </button>
          </div>
        </div>

        {/* White Paper Modal */}
        <WhitePaperModal 
          isOpen={showWhitePaper} 
          onClose={() => setShowWhitePaper(false)}
          showCloseButton={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden transition-all duration-700 ease-in-out">
      {/* White Paper Info Icon */}
      <InfoButton 
        onClick={() => setShowWhitePaper(!showWhitePaper)} 
        isOpen={showWhitePaper} 
      />

      {/* Cyberpunk atmospheric background - matching login page */}
      <div className="absolute inset-0 opacity-20">
        {/* Data stream lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-data-stream"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-data-stream" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-data-stream" style={{animationDelay: '0.5s'}}></div>
        
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%),
              linear-gradient(0deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Static interference */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-400/10 to-transparent animate-static-noise" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent animate-screen-flicker" />
      </div>

      {/* Main content container with fade-in animation */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-30 gap-8 animate-fade-in">
        {/* Neural assets interface - positioned at top right - Only show for specific address */}
        {user?.address?.toLowerCase() === '0x1fce79ea8510ee137f2aa2cc870ae701e240d5da' && (
          <button
            onClick={() => window.location.href = '/assets'}
            className="fixed top-4 right-16 z-50 neural-panel p-3 hover:shadow-cyan-400/20 transition-all duration-300 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 group-hover:text-cyan-300">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        )}
        
        {/* Neural disconnect interface - positioned at top right */}
        <button
          onClick={disconnect}
          className="fixed top-4 right-4 z-50 neural-panel p-3 hover:shadow-cyan-400/20 transition-all duration-300 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 group-hover:text-cyan-300">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
        
        {/* Neural interface header */}
        <div className="text-center transform transition-all duration-700 ease-in-out">
          <div className="neural-panel p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2 font-mono text-xs text-green-400">
              <span>[NEURAL INTERFACE ACTIVE]</span>
              <span className="animate-terminal-blink">_</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-cyan-300 mb-4 font-mono glitch-text">
              PROOF OF LIFE PROTOCOL
            </h1>
            <p className="text-slate-300 text-sm sm:text-lg font-mono">
              {'>'} Biometric verification active
            </p>
            <p className="text-slate-400 text-xs sm:text-sm font-mono mt-2">
              {'>'} Neural link status: CONNECTED
            </p>
          </div>
          <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto animate-data-stream"></div>
        </div>

        {/* 3D Wireframe Globe */}
        <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
          <Globe3D 
            locations={[...recentBlockchainClaims, ...claimLocations].slice(-5)} 
            isLoadingBlockchain={isLoadingBlockchainClaims}
          />
        </div>

        {/* Neural rewards display */}
        <div className="neural-panel p-4 max-w-lg transform transition-all duration-700 ease-in-out hover:scale-105">
          <div className="text-center space-y-3">
            <div className="text-green-400 font-mono text-xs mb-3">[REWARD PROTOCOLS ACTIVE]</div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2 font-mono">
                <div className={`w-2 h-2 rounded-full animate-neural-pulse ${
                  contractStatus === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className={contractStatus === 'active' ? 'text-green-300' : 'text-red-300'}>
                  {'>'} contract_{contractStatus}
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-mono">
                <div className={`w-2 h-2 rounded-full animate-neural-pulse ${
                  lifeClaimed ? 'bg-orange-400' : 'bg-green-400'
                }`} />
                <span className={lifeClaimed ? 'text-orange-300' : 'text-green-300'}>
                  {lifeClaimed ? '> cooldown_active' : '> claim_ready'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-mono">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
                <span className="text-cyan-300">
                  {'>'} {userBalance} balance
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-mono">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-neural-pulse" />
                <span className="text-purple-300">
                  {'>'} {lifetimeCheckIns} claims
                </span>
              </div>
            </div>
            
            {claimLocations.length > 0 && (
              <div className="flex items-center justify-center gap-2 font-mono text-sm mt-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-neural-pulse" />
                <span className="text-yellow-300">
                  {'>'} 📍 {claimLocations[claimLocations.length - 1].lat.toFixed(4)}, {claimLocations[claimLocations.length - 1].lng.toFixed(4)}
                </span>
              </div>
            )}
            
            <div className="text-slate-400 font-mono text-xs mt-2">
              {'>'} Neural link: {user?.address ? `${user.address.substring(0, 6)}...${user.address.substring(38)}` : "..."}
            </div>
          </div>
        </div>

        {/* Cooldown Timer */}
        {lifeClaimed && (
          <div className="neural-panel text-white px-6 py-4 text-sm max-w-md transform transition-all duration-700 ease-in-out animate-fade-in flex justify-center font-mono">
            <LifeTimer timeRemaining={timeRemaining} />
          </div>
        )}

        {/* Action Section */}
        {!lifeClaimed && (
          <div className="w-full max-w-md space-y-4 transform transition-all duration-700 ease-in-out animate-fade-in flex flex-col items-center">
            <div className="text-center transform transition-all duration-700 ease-in-out">
              <p className="text-gray-300 text-sm mb-4 transform transition-all duration-700 ease-in-out">
                {!verified
                  ? "Verify with World ID to claim LIFE tokens"
                  : isConfirming || isMinting
                  ? "Claiming LIFE tokens..."
                  : "Ready! Claim your LIFE tokens"}
              </p>
              
              {/* Transaction Status */}
              <div className="flex justify-center">
                <TransactionStatus
                  isConfirming={isConfirming}
                  isConfirmed={isConfirmed}
                  isMinting={isMinting}
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="transform transition-all duration-700 ease-in-out flex justify-center w-full">
              {!verified ? (
                <VerifyButton onVerificationSuccess={handleVerificationSuccess} />
              ) : (
                <ClaimButton onSuccess={handleClaimSuccess} />
              )}
            </div>
          </div>
        )}



        {/* White Paper Modal */}
        <WhitePaperModal 
          isOpen={showWhitePaper} 
          onClose={() => setShowWhitePaper(false)}
          showCloseButton={false}
        />
      </div>
    </div>
  );
}
