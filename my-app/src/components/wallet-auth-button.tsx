"use client";
import { useUnifiedAuth } from "@/providers/unified-minikit-auth";

interface WalletAuthButtonProps {
  onSuccess?: () => void;
}

export function WalletAuthButton({ onSuccess }: WalletAuthButtonProps) {
  const { connectWallet, connectDevAccount, isLoading } = useUnifiedAuth();

  const handleWalletAuth = async () => {
    const success = await connectWallet();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleDevAuth = () => {
    connectDevAccount();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={handleWalletAuth}
        disabled={isLoading}
        className="px-8 py-8 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg border-2 border-yellow-900/50 font-bold text-lg shadow-md transition-colors disabled:opacity-50 tracking-wide"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-serif">Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-2">🎰</span>
            <span className="font-serif">Connect Wallet</span>
          </div>
        )}
      </button>
      
      {/* Dev Mode Button - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleDevAuth}
          className="px-8 py-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-lg transition-colors"
        >
          🚀 Dev Account
        </button>
      )}
    </div>
  );
}
