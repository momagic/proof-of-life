"use client";

import { usePathname } from "next/navigation";
import { useSafeAreaInsets } from "@/contexts/WorldAppContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import Globe3D from "@/components/Globe3D";
import { useState, useEffect } from "react";

interface ClaimLocation {
  lat: number;
  lng: number;
  timestamp: number;
  id: string;
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const safeAreaInsets = useSafeAreaInsets();
  const [claimLocations, setClaimLocations] = useState<ClaimLocation[]>([]);
  
  // Load locations from localStorage
  useEffect(() => {
    const loadLocations = () => {
      const savedLocations = localStorage.getItem('claimLocations');
      if (savedLocations) {
        try {
          const locations = JSON.parse(savedLocations);
          setClaimLocations(locations);
        } catch (error) {
          console.error('Error loading saved locations:', error);
        }
      }
    };

    loadLocations();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'claimLocations') {
        loadLocations();
      }
    };
    
    const handleLocationUpdate = () => {
      loadLocations();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('claimLocationUpdated', handleLocationUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('claimLocationUpdated', handleLocationUpdate);
    };
  }, []);
  
  // Hide navigation on main page (login, checkin, cooldown)
  const hideNavigation = pathname === '/' || pathname === '/claim' || pathname === '/cooldown';
  
  // Remove special wallet page handling - let it render normally
  
  // Main page (login, checkin, cooldown) - no navigation
  if (hideNavigation) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto">
        {children}
      </div>
    );
  }
  
  // All other pages - without top navigation and with bottom navigation
  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: `${safeAreaInsets.bottom}px` }}
      >
        <BottomNavigation />
      </div>
      
      {/* Scrollable Content */}
      <main 
        className="overflow-y-auto"
        style={{ 
          paddingTop: `${safeAreaInsets.top}px`,
          paddingBottom: `${safeAreaInsets.bottom + 80}px`,
          minHeight: '100vh'
        }}
      >
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}