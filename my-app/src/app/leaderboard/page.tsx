"use client";

import { useState, useEffect, useCallback } from "react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "@/lib/chains";

interface Player {
  address: string;
  username?: string;
  totalStatusPoints: number;
  lifeBalance: number;
  propertiesCount: number;
  limitedEditionsCount: number;
  rank: number;
}

interface LeaderboardStats {
  totalPlayers: number;
  totalStatusPoints: number;
  averageStatusPoints: number;
}

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [userRank, setUserRank] = useState<Player | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'weekly'>('all');

  // Initialize Viem client
  const client = createPublicClient({
    chain: worldchain,
    transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
  });

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      // This would require the PlayerRegistry contract ABI to fetch leaderboard data
      // For now, showing mock data
      const mockPlayers: Player[] = [
        {
          address: "0x1234567890123456789012345678901234567890",
          username: "CryptoKing",
          totalStatusPoints: 5000,
          lifeBalance: 2500,
          propertiesCount: 8,
          limitedEditionsCount: 3,
          rank: 1,
        },
        {
          address: "0x2345678901234567890123456789012345678901",
          username: "PropertyMogul",
          totalStatusPoints: 4200,
          lifeBalance: 1800,
          propertiesCount: 12,
          limitedEditionsCount: 1,
          rank: 2,
        },
        {
          address: "0x3456789012345678901234567890123456789012",
          username: "LuxuryCollector",
          totalStatusPoints: 3800,
          lifeBalance: 3200,
          propertiesCount: 5,
          limitedEditionsCount: 5,
          rank: 3,
        },
        {
          address: "0x4567890123456789012345678901234567890123",
          username: "LifeEnthusiast",
          totalStatusPoints: 3200,
          lifeBalance: 1500,
          propertiesCount: 7,
          limitedEditionsCount: 2,
          rank: 4,
        },
        {
          address: "0x5678901234567890123456789012345678901234",
          username: "StatusSeeker",
          totalStatusPoints: 2800,
          lifeBalance: 900,
          propertiesCount: 6,
          limitedEditionsCount: 1,
          rank: 5,
        },
      ];

      // Add current user if authenticated
      if (user?.address) {
        const currentUserRank: Player = {
          address: user.address,
          username: "You",
          totalStatusPoints: 1200,
          lifeBalance: 450,
          propertiesCount: 2,
          limitedEditionsCount: 1,
          rank: 15,
        };
        setUserRank(currentUserRank);
      }

      setPlayers(mockPlayers);
      setStats({
        totalPlayers: 1247,
        totalStatusPoints: 125000,
        averageStatusPoints: 100,
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.address]);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, user?.address, fetchLeaderboard]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-holographic-primary animate-holographic-shift" />;
      case 2:
        return <Medal className="w-6 h-6 text-energy-secondary animate-pulse" />;
      case 3:
        return <Medal className="w-6 h-6 text-energy-primary animate-pulse" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-amber-600'];
      return `${colors[rank - 1]} text-white`;
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Animated background energy lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-energy-gradient animate-energy-flow"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-energy-gradient animate-energy-flow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-energy-gradient animate-energy-flow" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative">
      
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
              <Trophy className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500/40 to-orange-500/40 border border-red-400/60 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4 animate-neural-pulse">
            [LEADERBOARD_SYSTEM]
          </h1>

          {/* Status */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-orange-400/50 text-orange-400 px-4 py-2 rounded-lg text-sm font-mono">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>RANKING_OFFLINE</span>
            </div>
          </div>

          {/* Terminal Messages */}
          <div className="text-left space-y-2 mb-8 font-mono text-sm">
            <p className="text-slate-300">{'>'} compiling_player_statistics...</p>
            <p className="text-slate-300">{'>'} calculating_global_rankings...</p>
            <p className="text-slate-300">{'>'} synchronizing_achievement_data...</p>
            <p className="text-cyan-400 animate-pulse">{'>'} status: COMING_SOON</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-800/50 rounded-full h-2 border border-slate-600/30">
              <div className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full animate-progress" style={{width: '60%'}}></div>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-2">ranking_algorithm_optimization: 60%</p>
          </div>

          {/* Coming Soon Message */}
          <p className="text-slate-300 font-mono text-center mb-4">
            competitive_ranking_system under_development
          </p>
          <p className="text-xs text-slate-400 font-mono">
            return_to_main_hub for_active_modules
          </p>
        </div>
      </div>

      {/* Commented Out Original Content */}
      {/*
      <div className="relative neural-panel p-6 mb-8 hover:shadow-cyan-400/20 transition-all duration-500 animate-float">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-slate-700/5 to-green-500/10 rounded-lg animate-neural-pulse" />
        <div className="relative z-10">
          <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-cyan-400 animate-neural-pulse" />
              [LEADERBOARD]
            </h1>
          <p className="text-slate-300 font-mono">top_performers_in_digital_realm</p>
        </div>
      </div>

      <div className="relative flex gap-3 mb-8">
        {(['all', 'monthly', 'weekly'] as const).map((period, index) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`relative px-6 py-3 rounded-lg text-sm font-mono font-medium transition-all duration-300 animate-float overflow-hidden ${
              timeframe === period
                ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-lg shadow-cyan-400/20 hover:shadow-green-400/30'
                : 'neural-panel text-slate-300 hover:border-cyan-400/50 hover:text-cyan-400'
            }`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            {timeframe === period && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-slate-700/10 to-green-500/20 animate-neural-pulse" />
            )}
            <span className="relative z-10">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
          </button>
        ))}
      </div>

      {stats && (
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative neural-panel p-6 hover:shadow-cyan-400/20 animate-float hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900/20 bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-400/50 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/20 animate-neural-pulse">
                <Trophy className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-300 font-mono">total_players:</p>
                <p className="text-xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">{stats.totalPlayers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="relative neural-panel p-6 hover:shadow-green-400/20 animate-float hover:scale-105 transition-all duration-500" style={{animationDelay: '0.1s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-slate-700/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900/20 bg-gradient-to-br from-green-500/30 to-slate-600/30 border border-green-400/50 rounded-lg flex items-center justify-center shadow-lg shadow-green-400/20 animate-neural-pulse">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-300 font-mono">total_status_points:</p>
                <p className="text-xl font-mono font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">{stats.totalStatusPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="relative neural-panel p-6 hover:shadow-slate-400/20 animate-float hover:scale-105 transition-all duration-500" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-cyan-500/10 rounded-lg animate-neural-pulse" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900/20 bg-gradient-to-br from-slate-600/30 to-cyan-500/30 border border-slate-400/50 rounded-lg flex items-center justify-center shadow-lg shadow-slate-400/20 animate-pulse">
                <TrendingUp className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-300 font-mono">average_points:</p>
                <p className="text-xl font-mono font-bold bg-gradient-to-r from-slate-400 to-cyan-400 bg-clip-text text-transparent">{stats.averageStatusPoints}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && userRank && (
        <div className="relative neural-panel p-6 mb-8 hover:shadow-green-400/20 transition-all duration-500 animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-green-500/10 to-slate-700/10 rounded-lg animate-neural-pulse" />
          <div className="relative z-10">
            <h3 className="text-lg font-mono font-semibold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <Crown className="w-5 h-5 text-green-400 animate-neural-pulse" />
              [YOUR_RANKING]
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 bg-slate-900/20 bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-400/50 rounded-lg flex items-center justify-center text-white font-mono font-bold shadow-lg shadow-cyan-400/20 animate-neural-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-lg animate-neural-pulse" />
                  <span className="relative z-10">#{userRank.rank}</span>
                </div>
                <div>
                  <p className="font-mono font-medium text-slate-300">{formatAddress(userRank.address)}</p>
                  <p className="text-sm bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-mono font-medium">{userRank.totalStatusPoints}_status_points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300 font-mono">life_balance:</p>
                <p className="font-mono font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent text-lg">{userRank.lifeBalance}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative neural-panel overflow-hidden hover:shadow-cyan-400/20 transition-all duration-500 animate-float">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-green-500/5 to-slate-700/5 animate-neural-pulse" />
        <div className="relative z-10 px-6 py-4 border-b border-slate-600/30">
          <h3 className="font-mono font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400 animate-pulse" />
            [TOP_PLAYERS]
          </h3>
        </div>
        
        {loading ? (
          <div className="relative z-10 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-400/30 rounded-full animate-neural-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-slate-600/20 rounded mb-1 animate-neural-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-green-500/20 to-slate-700/20 rounded w-2/3 animate-neural-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-cyan-400/20 to-green-400/20 rounded w-16 animate-neural-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10 divide-y divide-slate-600/30">
            {players.map((player, index) => (
              <div key={player.address} className="px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-green-500/5 transition-all duration-300 animate-float group" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getRankIcon(player.rank)}
                      <div className="absolute inset-0 animate-neural-pulse bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div>
                      <p className="font-mono font-medium text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-green-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {player.username || formatAddress(player.address)}
                      </p>
                      <p className="text-sm font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                        {formatAddress(player.address)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex justify-end gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-mono font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-green-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{player.totalStatusPoints}</p>
                      <p className="font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">status_pts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{player.lifeBalance}</p>
                      <p className="font-mono text-slate-300 group-hover:text-green-300 transition-colors">life_bal</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-green-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{player.propertiesCount}</p>
                      <p className="font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">props</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{player.limitedEditionsCount}</p>
                      <p className="font-mono text-slate-300 group-hover:text-green-300 transition-colors">limited</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="relative neural-panel p-8 text-center hover:shadow-cyan-400/20 transition-all duration-500 animate-float mt-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-green-500/10 to-slate-700/10 rounded-lg animate-neural-pulse" />
          <div className="relative z-10">
            <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-neural-pulse" />
            <h3 className="text-lg font-mono font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">[JOIN_COMPETITION]</h3>
            <p className="font-mono text-slate-300">connect_wallet_to_access_leaderboard_rankings</p>
          </div>
        </div>
      )}
      */}
      </div>
    </div>
  );
}