"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, Fingerprint, Zap } from "lucide-react";
import type {
  VerifyCommandInput,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";

interface VerifyButtonProps {
  onVerificationSuccess: () => void;
}

export function VerifyButton({ onVerificationSuccess }: VerifyButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [scanningState, setScanningState] = useState<'idle' | 'fingerprint' | 'retina' | 'neural' | 'success' | 'error'>('idle');
  const [connectionStrength, setConnectionStrength] = useState(0);

  const simulateBiometricScan = async () => {
    // Fingerprint scan phase
    setScanningState('fingerprint');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Retina scan phase
    setScanningState('retina');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Neural link establishment
    setScanningState('neural');
    
    // Simulate connection strength building
    for (let i = 0; i <= 100; i += 10) {
      setConnectionStrength(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleVerify = async () => {
    // Don't start verification if it's already in progress
    if (isVerifying) {
      console.log("Verification already in progress");
      return;
    }

    // More robust MiniKit check for production
    const hasMiniKitVerify = window.MiniKit?.commandsAsync?.verify !== undefined;
    const isWorldApp = window.WorldApp !== undefined;
    
    if (!hasMiniKitVerify && !isWorldApp) {
      setVerificationError("Neural interface not detected");
      setScanningState('error');
      return;
    }

    try {
      console.log("Starting verification process");
      setIsVerifying(true);
      setVerificationError(null);
      setConnectionStrength(0);

      // Start biometric scanning sequence
      await simulateBiometricScan();

      const verifyPayload: any = {
        action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || "web3-template",
        signal: "",
        verification_level: 'orb',
      };

      // Use async approach with commandsAsync
      console.log("Using async verification approach");

      // Ensure the MiniKit is correctly initialized before using it
      if (
        !window.MiniKit?.commandsAsync ||
        typeof window.MiniKit.commandsAsync.verify !== "function"
      ) {
        throw new Error(
          "MiniKit.commandsAsync.verify is not available. Make sure you're using the latest version of the MiniKit library."
        );
      }

      // Execute the verify command and wait for the result
      const { finalPayload } = await window.MiniKit.commandsAsync.verify(
        verifyPayload
      );

      if (finalPayload.status === "error") {
        console.log("Error payload", finalPayload);
        setScanningState('error');
        setVerificationError(`Neural verification failed: Please try again`);
        setIsVerifying(false);
        return;
      }

      setScanningState('success');

      try {
        const verifyResponse = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload as ISuccessResult,
            action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || "web3-template",
            signal: "",
          }),
        });

        // Brief success state display
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsVerifying(false);
        setVerificationError(null);
        // Persist orb verification for route guards
        try {
          localStorage.setItem('worldid_verified_level', 'orb');
          localStorage.setItem('worldid_verified_at', Date.now().toString());
        } catch {}
        onVerificationSuccess();
      } catch (error) {
        console.error("Server verification error:", error);
        setScanningState('error');
        setVerificationError(
          error instanceof Error
            ? `Neural verification error: ${error.message}`
            : "Unknown neural verification error occurred"
        );
      }

      // Process successful verification
      //   await verifyOnServer(finalPayload as ISuccessResult);
    } catch (error) {
      console.error("Verification error:", error);
      setScanningState('error');
      setVerificationError(
        error instanceof Error
          ? `Neural verification error: ${error.message}`
          : "Unknown neural verification error occurred"
      );
      setIsVerifying(false);
    } finally {
      // Reset to idle after a delay
      setTimeout(() => {
        setScanningState('idle');
        setConnectionStrength(0);
      }, 2000);
    }
  };

  const getScanningIcon = () => {
    switch (scanningState) {
      case 'fingerprint':
        return <Fingerprint className="w-6 h-6 animate-fingerprint-scan" />;
      case 'retina':
        return <Eye className="w-6 h-6 animate-retina-scan" />;
      case 'neural':
        return <Zap className="w-6 h-6 animate-neural-pulse" />;
      case 'success':
        return <Shield className="w-6 h-6 text-green-400" />;
      case 'error':
        return <Shield className="w-6 h-6 text-red-400 animate-glitch" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getScanningText = () => {
    switch (scanningState) {
      case 'fingerprint':
        return 'Scanning biometrics...';
      case 'retina':
        return 'Analyzing retinal pattern...';
      case 'neural':
        return `Neural link: ${connectionStrength}%`;
      case 'success':
        return 'Neural verification complete';
      case 'error':
        return 'Neural interface error';
      default:
        return 'Initialize Neural Verification';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full relative overflow-hidden font-mono text-lg font-bold py-8 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border";
    
    switch (scanningState) {
      case 'fingerprint':
        return `${baseClasses} neural-panel bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-400/30 text-cyan-300 animate-pulse`;
      case 'retina':
        return `${baseClasses} neural-panel bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-400/30 text-purple-300 animate-pulse`;
      case 'neural':
        return `${baseClasses} neural-panel bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30 text-green-300`;
      case 'success':
        return `${baseClasses} neural-panel bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-400/50 text-green-300 animate-panel-activate`;
      case 'error':
        return `${baseClasses} neural-panel bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-400/30 text-red-300 animate-glitch`;
      default:
        return `${baseClasses} neural-panel bg-gradient-to-r from-slate-900/20 to-gray-900/20 border-slate-400/30 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className={getButtonClasses()}
      >
        {/* Neural connection strength indicator */}
        {scanningState === 'neural' && (
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300" 
               style={{ width: `${connectionStrength}%` }} />
        )}
        
        {/* Scanning grid overlay */}
        {(scanningState === 'fingerprint' || scanningState === 'retina') && (
          <div className="absolute inset-0 opacity-20">
            <div className="biometric-scanner" />
          </div>
        )}
        
        {/* Main content */}
        <div className="relative z-10 flex items-center gap-3">
          {getScanningIcon()}
          <span className={scanningState === 'error' ? 'animate-glitch' : ''}>
            {getScanningText()}
          </span>
        </div>
        
        {/* Data stream effect for neural state */}
        {scanningState === 'neural' && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-8 bg-gradient-to-t from-transparent via-green-400 to-transparent animate-data-stream opacity-60" />
          </div>
        )}
      </button>
      
      {/* Terminal-style error display */}
      {verificationError && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-400/30 rounded text-red-300 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-red-400">[ERROR]</span>
            <span className="animate-terminal-blink">_</span>
          </div>
          <div className="mt-1">{verificationError}</div>
        </div>
      )}
    </div>
  );
}
