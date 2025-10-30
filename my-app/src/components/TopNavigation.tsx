"use client";

import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { useSafeAreaInsets } from '@/contexts/WorldAppContext';
import { useState, useEffect, useCallback } from "react";
import { LifeTokenContract, PropertyContract, LimitedEditionContract } from '@/lib/contract-utils';

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className = "" }: TopNavigationProps) {
  const { user, isAuthenticated } = useUnifiedAuth();
  const safeAreaInsets = useSafeAreaInsets();
  const [lifeBalance, setLifeBalance] = useState<string>("0");
  const [statusPoints, setStatusPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch user's LIFE token balance and status points
  const fetchUserData = useCallback(async () => {
    if (!user?.address) return;
    
    setLoading(true);
    try {
      // Fetch LIFE token balance
      const balance = await LifeTokenContract.getBalance(user.address as `0x${string}`);
      setLifeBalance(LifeTokenContract.formatBalance(balance));
      
      // Fetch status points from properties and limited editions
      const [propertyPoints, limitedEditionPoints] = await Promise.all([
        PropertyContract.getUserStatusPoints(user.address as `0x${string}`),
        LimitedEditionContract.getUserStatusPoints(user.address as `0x${string}`)
      ]);
      
      const totalPoints = Number(propertyPoints) + Number(limitedEditionPoints);
      setStatusPoints(totalPoints);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to default values on error
      setLifeBalance("0");
      setStatusPoints(0);
    } finally {
      setLoading(false);
    }
  }, [user?.address]);

  useEffect(() => {
    if (isAuthenticated && user?.address) {
      fetchUserData();
    }
  }, [isAuthenticated, user?.address, fetchUserData]);

  // Generate a simple avatar based on address
  const generateAvatar = (address: string) => {
    const colors = [
      'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-500',
      'bg-gray-900', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800'
    ];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  };

  // Get avatar initials
  const getAvatarInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user?.address?.substring(2, 4).toUpperCase() || 'AU';
  };

  // Get display name for mobile view
  const getDisplayName = () => {
    if (user?.username) {
      return `@${user.username}`;
    }
    return formatAddress(user?.address || '');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  if (!isAuthenticated || !user?.address) {
    return (
      <nav 
        className={`relative neural-panel border-b border-slate-600/30 ${className}`}
        style={{ paddingTop: `${safeAreaInsets.top}px` }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto px-world-md py-world-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20 animate-neural-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-gray-400/30 animate-energy-flow"></div>
              <span className="text-black font-bold text-base relative z-10">P</span>
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Proof of Life</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-600/30 rounded-lg">
              <span className="text-sm text-white font-medium">Connect</span>
            </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`relative neural-panel border-b border-slate-600/30 ${className}`}
      style={{ paddingTop: `${safeAreaInsets.top}px` }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto px-world-md py-world-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20 animate-neural-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-gray-400/30 animate-energy-flow"></div>
            <span className="text-black font-bold text-base relative z-10">P</span>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Proof of Life</span>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user?.profilePictureUrl ? (
            <div className="relative">
              <img 
                src={user.profilePictureUrl} 
                alt="Profile" 
                className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-cyan-400/20 transition-transform hover:scale-105 border border-slate-600/30"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-gray-400/20 opacity-20 animate-glass-pulse pointer-events-none"></div>
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-400/20 transition-transform hover:scale-105 border border-slate-600/30 relative overflow-hidden ${generateAvatar(user.address)}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-gray-400/20 opacity-20 animate-glass-pulse"></div>
              <span className="relative z-10">{getAvatarInitials()}</span>
            </div>
          )}
          
          {/* Desktop Stats */}
          <div className="hidden sm:flex flex-col items-end text-xs space-y-0.5">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-600/30 rounded-lg">
              <span className="text-white font-bold">{loading ? '...' : lifeBalance}</span>
              <span className="text-gray-300 text-xs">LIFE</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-600/30 rounded-lg">
              <span className="text-gray-300 font-medium">{loading ? '...' : statusPoints}</span>
              <span className="text-gray-300 text-xs">PTS</span>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="sm:hidden flex flex-col items-end space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1">
              {getDisplayName()}
              {user?.username && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-800/50 border border-slate-600/30 text-white">
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800/50 border border-slate-600/30 rounded-lg">
              <span className="text-white font-semibold">{loading ? '...' : lifeBalance}</span>
              <span className="text-gray-300">LIFE</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}