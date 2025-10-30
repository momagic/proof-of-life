"use client";

import { useEffect, useRef, useState } from "react";
import { LifeTokenContract } from "@/lib/contract-utils";

interface GlobeProps {
  highlightedLocation?: { lat: number; lng: number };
  allLocations?: { lat: number; lng: number; timestamp?: number; id?: string }[];
  className?: string;
}

interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RealClaimData {
  lat: number;
  lng: number;
  region: string;
  timestamp: number;
  user: string;
}

export function Globe({ highlightedLocation, allLocations = [], className = "" }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [realClaimData, setRealClaimData] = useState<RealClaimData[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const rotationRef = useRef(0);

  // Fetch real claim data from blockchain
  const fetchRecentClaims = async () => {
    try {
      setIsLoadingClaims(true);
      console.log('🌍 Fetching recent claims from blockchain...');
      
      // Get recent claim events
      const recentEvents = await LifeTokenContract.getRecentClaimEvents(5);
      console.log('📊 Found', recentEvents.length, 'recent claim events');
      
      // Convert regions to coordinates
      const claimCoordinates: RealClaimData[] = [];
      
      for (const event of recentEvents) {
        try {
          // Use the built-in region mapping from LifeTokenContract
          const coords = await LifeTokenContract.getCoordinatesForRegion(event.region);
          if (coords) {
            claimCoordinates.push({
              lat: coords.lat,
              lng: coords.lng,
              region: event.region,
              timestamp: event.timestamp * 1000, // Convert to milliseconds
              user: event.user
            });
          }
        } catch (error) {
          console.error('Error processing claim event:', error);
        }
      }
      
      console.log('🗺️ Converted', claimCoordinates.length, 'claims to coordinates');
      setRealClaimData(claimCoordinates);
    } catch (error) {
      console.error('Error fetching recent claims:', error);
      // Fallback to empty array if blockchain fetch fails
      setRealClaimData([]);
    } finally {
      setIsLoadingClaims(false);
    }
  };

  // Combine blockchain claims with local claim locations
  const getCombinedClaimData = (): RealClaimData[] => {
    const combinedData: RealClaimData[] = [];
    
    // Add blockchain claims first (these are real recent claims from all users)
    combinedData.push(...realClaimData);
    
    // Add local claim locations (user's own claims) if they're not already in blockchain data
    if (allLocations && allLocations.length > 0) {
      allLocations.forEach(location => {
        // Check if this location is already represented in blockchain data
        const isDuplicate = realClaimData.some(claim => 
          Math.abs(claim.lat - location.lat) < 0.1 && 
          Math.abs(claim.lng - location.lng) < 0.1 &&
          Math.abs(claim.timestamp - (location.timestamp || Date.now())) < 60000 // Within 1 minute
        );
        
        if (!isDuplicate) {
          combinedData.push({
            lat: location.lat,
            lng: location.lng,
            region: 'Recent Claim', // Generic region for local claims
            timestamp: location.timestamp || Date.now(),
            user: 'Local User'
          });
        }
      });
    }
    
    // Sort by timestamp (most recent first) and limit to 5
    return combinedData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  // Fetch claims on component mount and periodically
  useEffect(() => {
    fetchRecentClaims();
    
    // Refresh claims every 60 seconds to reduce RPC load
    const interval = setInterval(fetchRecentClaims, 60000);
    
    // Listen for new claim events from the homepage
    const handleClaimUpdate = () => {
      console.log('🌍 New claim detected, refreshing blockchain data...');
      fetchRecentClaims();
    };
    
    window.addEventListener('claimLocationUpdated', handleClaimUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('claimLocationUpdated', handleClaimUpdate);
    };
  }, []);

  // Update locations when allLocations prop changes
  useEffect(() => {
    if (allLocations && allLocations.length > 0) {
      const formattedLocations: Location[] = allLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        timestamp: loc.timestamp || Date.now()
      }));
      setLocations(formattedLocations);
    }
  }, [allLocations]);

  // Add new location when highlightedLocation changes (for backward compatibility)
  useEffect(() => {
    if (highlightedLocation && (!allLocations || allLocations.length === 0)) {
      const newLocation: Location = {
        ...highlightedLocation,
        timestamp: Date.now()
      };
      setLocations(prev => [...prev, newLocation]);
    }
  }, [highlightedLocation, allLocations]);

  // Clean up old locations only if using highlightedLocation mode (not allLocations)
  useEffect(() => {
    if (!allLocations || allLocations.length === 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        setLocations(prev => prev.filter(loc => now - loc.timestamp < 30000));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [allLocations]);

  // Project lat/lng to globe coordinates
  const projectToGlobe = (lat: number, lng: number, centerX: number, centerY: number, radius: number, rotation: number) => {
    const phi = (lat * Math.PI) / 180;
    const theta = ((lng + rotation) * Math.PI) / 180;

    const x = centerX + radius * Math.cos(phi) * Math.sin(theta);
    const y = centerY - radius * Math.sin(phi);
    const z = Math.cos(phi) * Math.cos(theta);

    return { x, y, visible: z > 0 };
  };

  const drawGlobe = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Draw globe outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(100, 255, 218, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = "rgba(100, 255, 218, 0.1)";
    ctx.lineWidth = 1;

    // Longitude lines
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const radiusX = Math.abs(radius * Math.cos(angle));
      if (radiusX > 0) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radius, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Latitude lines
    for (let i = 1; i < 6; i++) {
      const y = Math.abs((radius * i) / 3);
      if (y > 0) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, y, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Draw combined claim data (blockchain + local claims)
    const combinedClaims = getCombinedClaimData();
    combinedClaims.forEach((claim) => {
      const point = projectToGlobe(claim.lat, claim.lng, centerX, centerY, radius, rotationRef.current);
      if (point.visible) {
        // Calculate age-based opacity (newer claims are brighter)
        const now = Date.now();
        const ageInHours = (now - claim.timestamp) / (1000 * 60 * 60);
        const maxAge = 24 * 7; // 7 days
        const opacity = Math.max(0.3, 1 - (ageInHours / maxAge));
        
        // Different colors for blockchain vs local claims
        const isLocalClaim = claim.user === 'Local User';
        const baseColor = isLocalClaim ? '255, 100, 218' : '100, 255, 218';
        
        // Draw claim dot with age-based styling
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
        ctx.fill();
        
        // Add glow effect for recent claims
        if (ageInHours < 24) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(${baseColor}, ${opacity * 0.3})`;
          ctx.fill();
          
          // Extra glow for very recent claims (< 1 hour)
          if (ageInHours < 1) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(${baseColor}, ${opacity * 0.2})`;
            ctx.fill();
          }
        }
      }
    });

    // Draw highlighted location (for backward compatibility)
    if (highlightedLocation) {
      const point = projectToGlobe(highlightedLocation.lat, highlightedLocation.lng, centerX, centerY, radius, rotationRef.current);
      if (point.visible) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
        ctx.fill();
        
        // Add pulsing effect
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 100, 100, 0.3)";
        ctx.fill();
      }
    }

    // Draw other locations from props
    locations.forEach((location) => {
      const point = projectToGlobe(location.lat, location.lng, centerX, centerY, radius, rotationRef.current);
      if (point.visible) {
        const age = Date.now() - location.timestamp;
        const opacity = Math.max(0.2, 1 - age / 30000);
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(100, 255, 218, ${opacity})`;
        ctx.fill();
      }
    });
  };

  const animate = () => {
    rotationRef.current += 0.005;
    drawGlobe();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [realClaimData, locations, highlightedLocation, allLocations]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full"
        style={{ maxWidth: "400px", maxHeight: "400px" }}
      />
      
      {/* Loading indicator */}
      {isLoadingClaims && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          Loading blockchain data...
        </div>
      )}
      
      {/* Claim count indicator */}
      {!isLoadingClaims && getCombinedClaimData().length > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          last {getCombinedClaimData().length} claims
        </div>
      )}
      
      {/* No data indicator */}
      {!isLoadingClaims && getCombinedClaimData().length === 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-yellow-400 px-2 py-1 rounded text-xs">
          No recent claims found
        </div>
      )}
    </div>
  );
}