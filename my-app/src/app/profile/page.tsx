"use client";

import { useState, useEffect, useCallback } from "react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { User, Wallet, Star, Building, Gem, Trophy, Copy, ExternalLink, Settings } from "lucide-react";
import { InfoButton } from "@/components/InfoButton";
import { WhitePaperModal } from "@/components/WhitePaperModal";
import { createPublicClient, http } from "viem";
import { worldchain } from "@/lib/chains";
import { LifeTokenContract } from "@/lib/contract-utils";

interface UserStats {
  lifeBalance: number;
  totalStatusPoints: number;
  propertiesCount: number;
  limitedEditionsCount: number;
  rank: number;
  joinDate: string;
  lastClaimTime: number;
  totalClaimed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const achievements: Achievement[] = [
  {
    id: "first_claim",
    name: "First Steps",
    description: "Claimed your first LIFE tokens",
    icon: "🎯",
    unlocked: true,
    unlockedAt: "2024-01-15",
  },
  {
    id: "property_owner",
    name: "Property Owner",
    description: "Purchased your first property",
    icon: "🏠",
    unlocked: true,
    unlockedAt: "2024-01-20",
  },
  {
    id: "collector",
    name: "Collector",
    description: "Own 5 or more properties",
    icon: "🏘️",
    unlocked: false,
  },
  {
    id: "luxury_lover",
    name: "Luxury Lover",
    description: "Purchased a limited edition item",
    icon: "💎",
    unlocked: true,
    unlockedAt: "2024-01-25",
  },
  {
    id: "top_player",
    name: "Top Player",
    description: "Reach top 10 on leaderboard",
    icon: "👑",
    unlocked: false,
  },
  {
    id: "daily_grinder",
    name: "Daily Grinder",
    description: "Claim tokens for 30 consecutive days",
    icon: "⚡",
    unlocked: false,
  },
];

export default function ProfilePage() {
  const { user, isAuthenticated, connectDevAccount } = useUnifiedAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showWhitePaper, setShowWhitePaper] = useState(false);

  // Initialize Viem client
  const client = createPublicClient({
    chain: worldchain,
    transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
  });

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    if (!user?.address) return;
    
    try {
      setLoading(true);
      
      // Fetch actual token balance
      const balance = await LifeTokenContract.getBalance(user.address as `0x${string}`);
      const formattedBalance = parseFloat(LifeTokenContract.formatBalance(balance));
      
      // For other stats, we'll use mock data until contracts are available
      const stats: UserStats = {
        lifeBalance: formattedBalance,
        totalStatusPoints: 1200, // Mock data
        propertiesCount: 2, // Mock data
        limitedEditionsCount: 1, // Mock data
        rank: 15, // Mock data
        joinDate: "2024-01-15", // Mock data
        lastClaimTime: Date.now() - 3600000, // Mock data
        totalClaimed: 45, // Mock data
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to mock data on error
      const fallbackStats: UserStats = {
        lifeBalance: 0,
        totalStatusPoints: 1200,
        propertiesCount: 2,
        limitedEditionsCount: 1,
        rank: 15,
        joinDate: "2024-01-15",
        lastClaimTime: Date.now() - 3600000,
        totalClaimed: 45,
      };
      setUserStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }, [user?.address, client]);

  useEffect(() => {
    if (isAuthenticated && user?.address) {
      fetchUserStats();
    }
  }, [isAuthenticated, user?.address, fetchUserStats]);

  const copyAddress = async () => {
    if (user?.address) {
      await navigator.clipboard.writeText(user.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  // Generate avatar color based on address
  const generateAvatarColor = (address: string) => {
    const colors = [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  };

  // Get display name with fallback
  const getDisplayName = () => {
    if (user?.username) {
      return user.username;
    }
    return 'Anonymous User';
  };

  // Get avatar initials
  const getAvatarInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user?.address?.substring(2, 4).toUpperCase() || 'AU';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 relative overflow-hidden">
        {/* Cyberpunk atmospheric background */}
        <div className="absolute inset-0 opacity-20">
          {/* Data stream lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-data-stream"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-data-stream" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-data-stream" style={{animationDelay: '0.5s'}}></div>
          
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="circuit-pattern" />
          </div>
          
          {/* Static interference */}
          <div className="absolute top-10 right-20 w-32 h-1 bg-gradient-to-r from-red-500/30 to-blue-500/30 animate-static-noise" />
          <div className="absolute bottom-32 left-16 w-24 h-1 bg-gradient-to-r from-blue-500/30 to-red-500/30 animate-screen-flicker" />
        </div>
        
        {/* Neural profile header skeleton */}
        <div className="relative neural-panel p-6 mb-6 animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-slate-700/10 to-green-500/10 rounded-lg animate-data-stream" />
          <div className="relative z-10 flex items-start gap-4">
            {/* Avatar Skeleton */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-600/50 to-gray-800/50 animate-pulse border-2 border-white/30" />
            
            {/* User Info Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-48 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-gradient-to-r from-holographic-primary/30 to-holographic-secondary/30 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                <div className="h-5 w-64 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
              </div>
              <div className="h-4 w-80 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
            </div>
            
            {/* Settings Button Skeleton */}
            <div className="w-9 h-9 bg-gradient-to-br from-gray-600/50 to-gray-800/50 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Neural stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="relative neural-panel p-6 text-center animate-float" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-lg animate-neural-pulse" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600/50 to-gray-800/50 rounded-xl mx-auto mb-3 animate-pulse" />
                <div className="h-8 w-16 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-20 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded mx-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Neural achievements skeleton */}
        <div className="relative neural-panel p-6 mb-8 animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-slate-700/10 to-green-500/10 rounded-lg animate-data-stream" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative flex items-center gap-3 p-4 rounded-lg border border-slate-600/30 backdrop-blur-sm bg-slate-900/20 animate-float" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neural activity summary skeleton */}
        <div className="relative neural-panel p-6 animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-slate-700/10 to-cyan-500/10 rounded-lg animate-data-stream" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-slate-600/30 animate-float" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="h-5 w-32 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-600/30">
              <div className="w-full h-12 bg-gradient-to-r from-gray-600/50 to-gray-800/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-8 relative">
        {/* Neural background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-slate-700/10 to-green-500/10 animate-data-stream" />
        
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
                <User className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500/40 to-orange-500/40 border border-red-400/60 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4 animate-neural-pulse">
              [PROFILE_SYSTEM]
            </h1>

            {/* Status */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-orange-400/50 text-orange-400 px-4 py-2 rounded-lg text-sm font-mono">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>USER_DATA_OFFLINE</span>
              </div>
            </div>

            {/* Terminal Messages */}
            <div className="text-left space-y-2 mb-8 font-mono text-sm">
              <p className="text-slate-300">{'>'} loading_user_profile...</p>
              <p className="text-slate-300">{'>'} synchronizing_achievements...</p>
              <p className="text-slate-300">{'>'} calculating_statistics...</p>
              <p className="text-cyan-400 animate-pulse">{'>'} status: COMING_SOON</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-slate-800/50 rounded-full h-2 border border-slate-600/30">
                <div className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full animate-progress" style={{width: '85%'}}></div>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-2">profile_data_integration: 85%</p>
            </div>

            {/* Coming Soon Message */}
            <p className="text-slate-300 font-mono text-center mb-4">
              user_profile_management under_construction
            </p>
            <p className="text-xs text-slate-400 font-mono">
              return_to_main_hub for_active_modules
            </p>
            
            {/* Dev Mode Button - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={connectDevAccount}
                disabled={loading}
                className="relative bg-gradient-to-r from-cyan-500 to-green-500 text-black px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-mono font-medium shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40 animate-neural-pulse mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-green-500/50 rounded-lg blur opacity-30 animate-data-stream" />
                <span className="relative z-10">{loading ? '> connecting...' : '> connect_dev_account'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* White Paper Info Icon */}
      <InfoButton 
        onClick={() => setShowWhitePaper(!showWhitePaper)} 
        isOpen={showWhitePaper} 
      />
      {/* Neural data streams */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-cyan-500/50 to-green-500/50 animate-data-stream"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-green-500/50 to-cyan-500/50 animate-data-stream" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-cyan-500/50 to-slate-500/50 animate-data-stream" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Neural profile header */}
      <div className="relative neural-panel p-6 mb-6 hover:shadow-cyan-400/20 transition-all duration-500 animate-float">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-slate-700/10 to-green-500/10 rounded-lg animate-neural-pulse" />
        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          {user?.profilePictureUrl ? (
            <div className="relative">
              <img 
                src={user.profilePictureUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg animate-float"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/10 animate-holographic-shift" />
            </div>
          ) : (
            <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-float border-2 border-white/50`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-gray-400/20 animate-holographic-shift" />
              <span className="relative z-10">{getAvatarInitials()}</span>
            </div>
          )}
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent">{getDisplayName()}</h1>
              {user?.username && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-holographic-primary/20 to-holographic-secondary/20 text-holographic-primary border border-holographic-primary/30 backdrop-blur-sm animate-holographic-shift">
                  ✓ World ID
                </span>
              )}
            </div>
            <div className="space-y-2 mb-3">
               {user?.username && (
                 <div className="flex items-center gap-2">
                   <User className="w-4 h-4 text-energy-primary animate-holographic-shift" />
                   <span className="text-white font-medium">@{user.username}</span>
                 </div>
               )}
               <div className="flex items-center gap-2">
                 <Wallet className="w-4 h-4 text-holographic-primary animate-holographic-shift" />
                 <span className="text-white text-sm">{formatAddress(user?.address || '')}</span>
                 <button
                   onClick={copyAddress}
                   className="text-white hover:text-energy-primary transition-colors animate-float"
                   title="Copy full address"
                 >
                   <Copy className="w-4 h-4" />
                 </button>
                 {copiedAddress && (
                   <span className="text-holographic-primary text-sm font-medium animate-holographic-shift">Copied!</span>
                 )}
               </div>
             </div>
            
            {userStats && (
              <div className="flex items-center gap-4 text-sm text-white">
                <span>Joined {formatDate(userStats.joinDate)}</span>
                <span className="text-energy-primary">•</span>
                <span className="bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent font-medium">Rank #{userStats.rank}</span>
                <span className="text-energy-primary">•</span>
                <span>Last claim {formatTimeAgo(userStats.lastClaimTime)}</span>
              </div>
            )}
          </div>
          
          {/* Neural settings button */}
          <button className="relative p-2 text-slate-300 hover:text-cyan-400 transition-colors animate-float backdrop-blur-sm bg-slate-900/20 rounded-lg border border-slate-600/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="relative neural-panel p-6 text-center hover:shadow-cyan-400/20 animate-float hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-900/40 bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center mx-auto mb-3 animate-neural-pulse">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-2xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">{userStats.lifeBalance}</p>
              <p className="text-sm text-slate-300 font-mono">LIFE_tokens</p>
            </div>
          </div>
          
          <div className="relative neural-panel p-6 text-center hover:shadow-green-400/20 animate-float hover:scale-105 transition-all duration-300" style={{animationDelay: '0.1s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-900/40 bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-400/30 rounded-lg flex items-center justify-center mx-auto mb-3 animate-neural-pulse">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-mono font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">{userStats.totalStatusPoints}</p>
              <p className="text-sm text-slate-300 font-mono">status_points</p>
            </div>
          </div>
          
          <div className="relative neural-panel p-6 text-center hover:shadow-slate-400/20 animate-float hover:scale-105 transition-all duration-300" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-cyan-500/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-900/40 bg-gradient-to-br from-slate-600/20 to-cyan-500/20 border border-slate-400/30 rounded-lg flex items-center justify-center mx-auto mb-3 animate-neural-pulse">
                <Building className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-2xl font-mono font-bold bg-gradient-to-r from-slate-400 to-cyan-400 bg-clip-text text-transparent">{userStats.propertiesCount}</p>
              <p className="text-sm text-slate-300 font-mono">properties</p>
            </div>
          </div>
          
          <div className="relative neural-panel p-6 text-center hover:shadow-green-400/20 animate-float hover:scale-105 transition-all duration-300" style={{animationDelay: '0.3s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-slate-600/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-900/40 bg-gradient-to-br from-green-500/20 to-slate-600/20 border border-green-400/30 rounded-lg flex items-center justify-center mx-auto mb-3 animate-neural-pulse">
                <Gem className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-mono font-bold bg-gradient-to-r from-green-400 to-slate-400 bg-clip-text text-transparent">{userStats.limitedEditionsCount}</p>
              <p className="text-sm text-slate-300 font-mono">limited_items</p>
            </div>
          </div>
        </div>
      )}

      {/* Neural achievements */}
      <div className="relative neural-panel p-6 mb-8 hover:shadow-cyan-400/20 transition-all duration-500 animate-float">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-slate-700/10 to-green-500/10 rounded-lg animate-neural-pulse" />
        <div className="relative z-10">
          <h2 className="text-lg font-mono font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400 animate-neural-pulse" />
            [ACHIEVEMENTS]
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 hover:scale-105 animate-float group ${
                  achievement.unlocked
                    ? 'backdrop-blur-sm bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-400/30 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40'
                    : 'backdrop-blur-sm bg-slate-900/20 border-slate-600/30'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {achievement.unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-lg animate-neural-pulse" />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <div className={`text-2xl ${achievement.unlocked ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-mono font-medium ${
                      achievement.unlocked ? 'text-cyan-300' : 'text-slate-500'
                    }`}>
                      {achievement.unlocked ? `> ${achievement.name.toLowerCase().replace(/\s+/g, '_')}` : `[LOCKED] ${achievement.name}`}
                    </h3>
                    <p className={`text-sm font-mono ${
                      achievement.unlocked ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {achievement.unlocked ? `// ${achievement.description}` : achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs font-mono bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mt-1 animate-neural-pulse">
                        {'>'} unlocked_{formatDate(achievement.unlockedAt).replace(/\s+/g, '_').toLowerCase()}
                      </p>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/20 animate-neural-pulse">
                      <span className="text-black text-xs font-mono font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neural activity summary */}
      {userStats && (
        <div className="relative neural-panel p-6 hover:shadow-green-400/20 transition-all duration-500 animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-slate-700/10 to-cyan-500/10 rounded-lg animate-neural-pulse" />
          <div className="relative z-10">
            <h2 className="text-lg font-mono font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-400 animate-neural-pulse" />
              [ACTIVITY_SUMMARY]
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-600/30 animate-float hover:bg-cyan-500/5 transition-colors duration-300 rounded-lg px-2">
                <span className="text-slate-300 font-mono">total_life_claimed:</span>
                <span className="font-mono font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">{userStats.totalClaimed}_LIFE</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-600/30 animate-float hover:bg-green-500/5 transition-colors duration-300 rounded-lg px-2" style={{animationDelay: '0.1s'}}>
                <span className="text-slate-300 font-mono">current_balance:</span>
                <span className="font-mono font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent animate-neural-pulse">{userStats.lifeBalance}_LIFE</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-600/30 animate-float hover:bg-slate-500/5 transition-colors duration-300 rounded-lg px-2" style={{animationDelay: '0.2s'}}>
                <span className="text-slate-300 font-mono">global_rank:</span>
                <span className="font-mono font-semibold bg-gradient-to-r from-slate-400 to-cyan-400 bg-clip-text text-transparent">#{userStats.rank}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 animate-float hover:bg-green-500/5 transition-colors duration-300 rounded-lg px-2" style={{animationDelay: '0.3s'}}>
                <span className="text-slate-300 font-mono">member_since:</span>
                <span className="font-mono font-semibold bg-gradient-to-r from-green-400 to-slate-400 bg-clip-text text-transparent">{formatDate(userStats.joinDate).replace(/\s+/g, '_').toLowerCase()}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-600/30">
              <button className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-green-400 transition-all duration-300 font-mono font-medium shadow-lg shadow-cyan-400/20 hover:shadow-green-400/30 animate-float group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-green-500/50 rounded-lg blur opacity-30 animate-neural-pulse group-hover:opacity-50 transition-opacity duration-300" />
                <ExternalLink className="w-4 h-4 relative z-10 animate-neural-pulse" />
                <span className="relative z-10">[VIEW_ON_WORLDCHAIN_EXPLORER]</span>
              </button>
            </div>
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
  );
}