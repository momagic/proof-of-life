"use client"

import { X, MoreVertical, Globe } from "lucide-react"

export default function LifeApp() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <button className="p-2">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
            <Globe className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-lg">LIFE</span>
        </div>
        <button className="p-2">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-green-300 to-green-500 flex items-center justify-center shadow-md">
            <Globe className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-gray-600">Claim Daily Reward</span>
          <h1 className="text-4xl font-bold text-gray-800">LIFE</h1>
          <p className="text-sm text-green-600 font-medium">1000 LIFE Signing Bonus + 1 LIFE Daily</p>
        </div>

        <p className="text-gray-600 text-center">Connect wallet to claim your signing bonus<br/>and start earning daily LIFE tokens</p>

        <button className="px-8 py-3 bg-green-500 text-white font-medium rounded-lg shadow-sm hover:bg-green-600 transition-colors">
          Connect Wallet
        </button>
      </div>
    </div>
  )
}

