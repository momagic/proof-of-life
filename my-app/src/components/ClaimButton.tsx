"use client";

import { useState, useEffect } from "react";
import { Zap, Activity, Cpu, Wifi } from "lucide-react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { LIFE_ABI } from "@/life-abi";
import { CONTRACT_ADDRESSES } from "@/lib/contract-utils";
import LocationSelector from "./LocationSelector";

interface ClaimButtonProps {
  onSuccess: (txId: string, coordinates?: { lat: number; lng: number }) => void;
}

export function ClaimButton({ onSuccess }: ClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scannerState, setScannerState] = useState<'idle' | 'location' | 'vitals' | 'neural' | 'claiming' | 'success' | 'error'>('idle');
  const [lifeSignals, setLifeSignals] = useState({ heartRate: 0, brainActivity: 0, cellularEnergy: 0 });
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const { isAuthenticated, user } = useUnifiedAuth();

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

      // Store approximate coordinates for globe visualization
      if (data.latitude && data.longitude) {
        const coords = { lat: data.latitude, lng: data.longitude };
        setCoordinates(coords);
        console.log('🌍 IP-based coordinates captured for globe:', coords);
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

  // Function to get precise location using browser geolocation (requires permission)
  const detectLocationByGPS = async () => {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Store coordinates for globe visualization
      const coords = { lat: latitude, lng: longitude };
      setCoordinates(coords);
      console.log('📍 GPS coordinates captured for globe:', coords);

      // Use BigDataCloud's free reverse geocoding API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error("Failed to get location information");
      }

      const data = await response.json();
      
      // Extract city and country for region
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      
      let detectedRegion = "";
      if (city && country) {
        detectedRegion = `${city}, ${country}`;
      } else if (country) {
        detectedRegion = country;
      } else {
        throw new Error("Could not determine your region");
      }

      return detectedRegion;
    } catch (error) {
      console.error("GPS location detection error:", error);
      throw error;
    }
  };

  const simulateLifeScanning = async () => {
    // Location scanning phase
    setScannerState('location');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vital signs scanning
    setScannerState('vitals');
    
    // Simulate life signal readings
    for (let i = 0; i <= 100; i += 5) {
      setLifeSignals({
        heartRate: Math.floor(60 + Math.random() * 40), // 60-100 BPM
        brainActivity: Math.floor(i * 0.8 + Math.random() * 20), // 0-100%
        cellularEnergy: Math.floor(i * 0.9 + Math.random() * 10), // 0-100%
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Neural network connection
    setScannerState('neural');
    await new Promise(resolve => setTimeout(resolve, 1200));
  };

  // Main location detection function with fallback strategy
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    try {
      // First, try IP-based geolocation (no permission required)
      console.log('Attempting IP-based location detection...');
      const ipRegion = await detectLocationByIP();
      setRegion(ipRegion);
      console.log('IP-based location detected:', ipRegion);
      
      // Then try to get more precise GPS location in the background (optional)
      // This won't block the user if permission is denied
      setTimeout(async () => {
        try {
          console.log('Attempting GPS location detection for better accuracy...');
          const gpsRegion = await detectLocationByGPS();
          // Only update if GPS gives us a more specific result
          if (gpsRegion && gpsRegion !== ipRegion) {
            setRegion(gpsRegion);
            console.log('GPS location detected, updated to:', gpsRegion);
          }
        } catch (gpsError) {
          // GPS failed, but we already have IP location, so no error shown
          console.log('GPS location failed, keeping IP-based location:', gpsError);
        }
      }, 100);
      
    } catch (error) {
      console.error("All location detection methods failed:", error);
      // Only show error if both IP and GPS fail
      setLocationError("Could not detect your location automatically. Please enter your region manually or check your internet connection.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Auto-detect location on component mount
  useEffect(() => {
    if (!region) {
      detectLocation();
    }
  }, [region]);

  // Handle location selection from LocationSelector
  const handleLocationSelect = (location: string, coords: { lat: number; lng: number }) => {
    setRegion(location);
    setCoordinates(coords);
    setLocationError(null);
    setShowLocationSelector(false);
    console.log('📍 Location selected:', location, coords);
  };

  async function handleMint() {
    // More robust MiniKit check for production
    const hasMiniKitCommands = window.MiniKit?.commandsAsync?.sendTransaction !== undefined;
    const isWorldApp = window.WorldApp !== undefined;
    
    if (!hasMiniKitCommands && !isWorldApp) {
      console.error("MiniKit transaction commands not available");
      return;
    }

    if (!isAuthenticated || !user?.address) {
      console.error("User not authenticated");
      setScannerState('error');
      return;
    }

    if (!region.trim()) {
      alert("Please enter your region or allow location access before claiming");
      return;
    }

    try {
      setIsLoading(true);
      setLifeSignals({ heartRate: 0, brainActivity: 0, cellularEnergy: 0 });
      
      // Start holographic life scanning sequence
      await simulateLifeScanning();
      
      setScannerState('claiming');
      // Send transaction to claim tokens
      const { finalPayload } = await (window as any).MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: CONTRACT_ADDRESSES.LIFE_TOKEN,
            abi: LIFE_ABI,
            functionName: "claim",
            args: [region.trim()], // Pass the user's region
          },
        ],
      });

      if (finalPayload.status === "error") {
        console.error("Error claiming tokens:", finalPayload);
        setScannerState('error');
        return;
      }

      console.log("Claiming successful:", finalPayload);
      console.log("Sending coordinates to parent:", coordinates);
      console.log("Region being submitted:", region.trim());
      setScannerState('success');
      
      // Brief success state display
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess(finalPayload.transaction_id, coordinates || undefined);
    } catch (error) {
      console.error("Error claiming tokens:", error);
      setScannerState('error');
    } finally {
      setIsLoading(false);
      // Reset to idle after a delay
      setTimeout(() => {
        setScannerState('idle');
        setLifeSignals({ heartRate: 0, brainActivity: 0, cellularEnergy: 0 });
      }, 3000);
    }
  }

  const getScannerIcon = () => {
    switch (scannerState) {
      case 'location':
        return <Wifi className="w-6 h-6 animate-pulse" />;
      case 'vitals':
        return <Activity className="w-6 h-6 animate-pulse" />;
      case 'neural':
        return <Cpu className="w-6 h-6 animate-neural-pulse" />;
      case 'claiming':
        return <Zap className="w-6 h-6 animate-energy-flow" />;
      case 'success':
        return <Zap className="w-6 h-6 text-green-400" />;
      case 'error':
        return <Zap className="w-6 h-6 text-red-400 animate-glitch" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getScannerText = () => {
    switch (scannerState) {
      case 'location':
        return 'Scanning biometric location...';
      case 'vitals':
        return 'Analyzing life signatures...';
      case 'neural':
        return 'Establishing neural link...';
      case 'claiming':
        return 'Extracting life tokens...';
      case 'success':
        return 'Life extraction complete';
      case 'error':
        return 'Scanner malfunction detected';
      default:
        return 'Initialize Life Scanner';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full relative overflow-hidden font-mono text-lg font-bold py-8 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border";
    
    switch (scannerState) {
      case 'location':
        return `${baseClasses} neural-panel bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-400/30 text-blue-300 animate-pulse`;
      case 'vitals':
        return `${baseClasses} neural-panel bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30 text-green-300 animate-pulse`;
      case 'neural':
        return `${baseClasses} neural-panel bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-400/30 text-purple-300`;
      case 'claiming':
        return `${baseClasses} neural-panel bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-400/30 text-yellow-300 animate-energy-flow`;
      case 'success':
        return `${baseClasses} neural-panel bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-400/50 text-green-300 animate-panel-activate`;
      case 'error':
        return `${baseClasses} neural-panel bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-400/30 text-red-300 animate-glitch`;
      default:
        return `${baseClasses} neural-panel bg-gradient-to-r from-slate-900/20 to-gray-900/20 border-slate-400/30 text-slate-300 hover:border-green-400/50 hover:text-green-300 hover:shadow-lg hover:shadow-green-400/20`;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="neural-panel p-4 text-center text-red-300 font-mono text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-red-400">[ACCESS DENIED]</span>
          <span className="animate-terminal-blink">_</span>
        </div>
        Neural interface authentication required to access life scanner.
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="text-center">
        {isDetectingLocation && (
          <div className="flex items-center justify-center gap-1 mb-4 p-2 game-card">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-transparent border-t-white border-r-gray-400 bg-gradient-to-r from-white to-gray-400 animate-energy-flow"></div>
            <span className="text-xs text-white font-medium">Detecting location...</span>
          </div>
        )}
        {locationError && !showLocationSelector && (
          <div className="mb-2 p-2 backdrop-blur-md bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-400/20 rounded-lg shadow-lg space-y-2">
            <p className="text-xs text-gray-300">{locationError}</p>
            <div className="flex gap-2">
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="text-xs text-white hover:text-gray-200 disabled:text-gray-400 transition-all duration-300 font-medium px-2 py-1 bg-white/10 rounded"
              >
                Try again
              </button>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="text-xs text-white hover:text-gray-200 transition-all duration-300 font-medium px-2 py-1 bg-blue-500/20 rounded"
              >
                Select location
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Or enter manually:</p>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., New York, USA"
                className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        )}
        {showLocationSelector && (
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationSelector(false)}
          />
        )}
        {region && !locationError && !showLocationSelector && (
          <div className="mb-2 p-2 backdrop-blur-md bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-400/20 rounded-lg shadow-lg space-y-1">
            <p className="text-xs text-gray-300">📍 <strong className="text-white">{region}</strong></p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRegion('');
                  setLocationError('Enter your region manually:');
                }}
                className="text-xs text-gray-400 hover:text-white transition-all duration-300"
              >
                Change location
              </button>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-all duration-300"
              >
                Browse locations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Life signals display during vitals scanning */}
      {scannerState === 'vitals' && (
        <div className="neural-panel p-4 space-y-3">
          <div className="text-green-300 font-mono text-xs mb-2">[LIFE SIGNATURES DETECTED]</div>
          
          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="text-center">
              <div className="text-red-400 mb-1">HEART RATE</div>
              <div className="text-red-300 text-lg">{lifeSignals.heartRate}</div>
              <div className="text-red-400/60">BPM</div>
            </div>
            
            <div className="text-center">
              <div className="text-purple-400 mb-1">BRAIN ACTIVITY</div>
              <div className="text-purple-300 text-lg">{lifeSignals.brainActivity}%</div>
              <div className="text-purple-400/60">NEURAL</div>
            </div>
            
            <div className="text-center">
              <div className="text-green-400 mb-1">CELLULAR ENERGY</div>
              <div className="text-green-300 text-lg">{lifeSignals.cellularEnergy}%</div>
              <div className="text-green-400/60">MITOCHONDRIAL</div>
            </div>
          </div>
          
          {/* Scanning grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="biometric-scanner" />
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={handleMint}
          disabled={isLoading || !region.trim() || isDetectingLocation}
          className={getButtonClasses()}
        >
          {/* Scanning grid overlay for active states */}
          {(scannerState === 'location' || scannerState === 'vitals' || scannerState === 'neural') && (
            <div className="absolute inset-0 opacity-20">
              <div className="biometric-scanner" />
            </div>
          )}
          
          {/* Main content */}
          <div className="relative z-10 flex items-center gap-3">
            {getScannerIcon()}
            <span className={scannerState === 'error' ? 'animate-glitch' : ''}>
              {getScannerText()}
            </span>
          </div>
          
          {/* Data stream effects */}
          {(scannerState === 'claiming' || scannerState === 'neural') && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-8 bg-gradient-to-t from-transparent via-green-400 to-transparent animate-data-stream opacity-60" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
