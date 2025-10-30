"use client";

import { Wallet, Clock, Sparkles, User, CheckCircle } from "lucide-react";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";

export default function WalletPage() {
  const { isAuthenticated, user, isLoading, connectWallet } = useUnifiedAuth();
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background energy lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-energy-gradient animate-energy-flow"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-energy-gradient animate-energy-flow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-energy-gradient animate-energy-flow" style={{animationDelay: '0.5s'}}></div>
      </div>
      
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
              <Wallet className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500/40 to-orange-500/40 border border-red-400/60 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4 animate-neural-pulse">
            [WALLET_MODULE]
          </h1>

          {/* Status */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-orange-400/50 text-orange-400 px-4 py-2 rounded-lg text-sm font-mono">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>DEVELOPMENT_MODE</span>
            </div>
          </div>

          {/* Terminal Messages */}
          <div className="text-left space-y-2 mb-8 font-mono text-sm">
            <p className="text-slate-300">{'>'} initializing_wallet_protocols...</p>
            <p className="text-slate-300">{'>'} loading_defi_integrations...</p>
            <p className="text-slate-300">{'>'} establishing_secure_connections...</p>
            <p className="text-cyan-400 animate-pulse">{'>'} status: COMING_SOON</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-800/50 rounded-full h-2 border border-slate-600/30">
              <div className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full animate-progress" style={{width: '75%'}}></div>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-2">neural_link_establishment: 75%</p>
          </div>

          {/* Coming Soon Message */}
          <p className="text-slate-300 font-mono text-center mb-4">
            wallet_management_system under_construction
          </p>
          <p className="text-xs text-slate-400 font-mono">
            return_to_main_hub for_active_modules
          </p>
        </div>
      </div>

      {/* Commented Out Original Content */}
      {/*
      <div className="flex flex-col items-center text-center pt-8 relative z-10">
        <div className="relative mb-6 animate-float">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-400/50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-cyan-400/20 hover:shadow-green-400/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-energy-flow"></div>
            <Wallet className="w-12 h-12 text-white relative z-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500/40 to-green-500/40 border border-cyan-400/60 rounded-full flex items-center justify-center shadow-lg shadow-cyan-400/20 animate-neural-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent mb-4">Wallet</h1>
        {isLoading ? (
          <div className="inline-flex items-center gap-2 neural-panel text-cyan-400 px-6 py-3 rounded-full text-sm font-mono font-medium hover:shadow-cyan-400/20 transition-all duration-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-holographic-primary"></div>
            <span className="bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent font-bold">Loading...</span>
          </div>
        ) : isAuthenticated && user ? (
          <div className="inline-flex items-center gap-2 neural-panel border-green-400/50 text-green-400 px-6 py-3 rounded-full text-sm font-mono font-medium hover:shadow-green-400/20 transition-all duration-300">
            <CheckCircle className="w-4 h-4" />
            <span className="bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent font-bold">Connected</span>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="inline-flex items-center gap-2 neural-panel text-cyan-400 px-6 py-3 rounded-full text-sm font-mono font-medium hover:shadow-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300"
          >
            <User className="w-4 h-4" />
            <span className="bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent font-bold">Connect Wallet</span>
          </button>
        )}
      </div>
      <div className="flex flex-col items-center pb-8 px-6">
        <div className="text-center max-w-md">
          <div className="neural-panel p-6 mb-8 animate-float" style={{animationDelay: '0.2s'}}>
            {isAuthenticated && user ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-energy-primary to-energy-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">
                      {user.address.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-1">Welcome back!</p>
                  <p className="text-gray-300 text-sm font-mono">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                </div>
                <p className="text-white text-lg leading-relaxed">
                  Your wallet is connected and ready. Manage your <span className="bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent font-bold">LIFE tokens</span> and explore DeFi opportunities.
                </p>
              </div>
            ) : (
              <p className="text-white text-lg leading-relaxed">
                Connect your wallet to access an amazing experience that will let you manage your <span className="bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent font-bold">LIFE tokens</span>, view transaction history, and interact with DeFi protocols seamlessly.
              </p>
            )}
          </div>
          <div className="neural-panel p-6 hover:shadow-cyan-400/20 transition-all duration-500 mb-8 animate-float" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-bold bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-holographic-primary animate-holographic-shift" />
              Upcoming Features
            </h3>
            <div className="text-left space-y-4">
              <div className="flex items-center gap-3 text-white group hover:text-white transition-colors">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500/50 to-green-500/50 border border-cyan-400/70 rounded-full animate-pulse group-hover:animate-neural-pulse"></div>
                <span className="group-hover:bg-gradient-to-r group-hover:from-energy-primary group-hover:to-energy-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Token balance and portfolio tracking</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200 group hover:text-white transition-colors">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500/50 to-green-500/50 border border-cyan-400/70 rounded-full animate-pulse group-hover:animate-neural-pulse"></div>
                <span className="group-hover:bg-gradient-to-r group-hover:from-holographic-primary group-hover:to-holographic-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Transaction history and analytics</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200 group hover:text-white transition-colors">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500/50 to-green-500/50 border border-cyan-400/70 rounded-full animate-pulse group-hover:animate-neural-pulse"></div>
                <span className="group-hover:bg-gradient-to-r group-hover:from-energy-primary group-hover:to-holographic-primary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">DeFi integration and yield farming</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200 group hover:text-white transition-colors">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500/50 to-cyan-500/50 border border-green-400/70 rounded-full animate-pulse group-hover:animate-neural-pulse"></div>
                <span className="group-hover:bg-gradient-to-r group-hover:from-holographic-secondary group-hover:to-energy-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Cross-chain asset management</span>
              </div>
            </div>
          </div>
          <div className="neural-panel p-6 hover:shadow-cyan-400/20 hover:border-cyan-400/50 transition-all duration-500 animate-float" style={{animationDelay: '0.6s'}}>
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-energy-primary/5 via-holographic-primary/10 to-energy-secondary/5 animate-energy-flow"></div>
              <div className="relative z-10">
                <p className="text-sm text-white mb-3 font-medium">
                  Want to be notified when the wallet launches?
                </p>
                <p className="text-xs bg-gradient-to-r from-holographic-primary to-holographic-secondary bg-clip-text text-transparent font-bold">
                  Stay tuned for updates in our community channels!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}