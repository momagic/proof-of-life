"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  address: string;
  username?: string;
  profilePictureUrl?: string;
}

interface UnifiedAuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  
  // Authentication methods
  connectWallet: () => Promise<boolean>;
  disconnect: () => void;
  
  // Session management
  refreshAuth: () => Promise<void>;
  
  // Dev mode
  connectDevAccount: () => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'minikit_auth_session';

interface StoredSession {
  user: User;
  timestamp: number;
  expiresAt: number;
}

export function UnifiedMiniKitAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [miniKitReady, setMiniKitReady] = useState(false);

  // Wait for MiniKit to be ready
  useEffect(() => {
    const checkMiniKitReady = () => {
      if (typeof window === 'undefined') return false;
      
      // More robust MiniKit detection for production
      const hasMiniKit = window.MiniKit !== undefined;
      const hasCommands = window.MiniKit?.commands !== undefined;
      const hasCommandsAsync = window.MiniKit?.commandsAsync !== undefined;
      const isInstalledCheck = typeof window.MiniKit?.isInstalled === 'function' ? window.MiniKit.isInstalled() : false;
      
      // Check if we're in World App environment
      const isWorldApp = window.WorldApp !== undefined;
      
      console.log('[Auth] MiniKit detection:', {
        hasMiniKit,
        hasCommands,
        hasCommandsAsync,
        isInstalledCheck,
        isWorldApp
      });
      
      // Consider MiniKit ready if:
      // 1. We have MiniKit object AND commands/commandsAsync, OR
      // 2. We're in World App environment (more reliable than isInstalled)
      const isMiniKitReady = (hasMiniKit && (hasCommands || hasCommandsAsync)) || isWorldApp;
      
      if (isMiniKitReady) {
        setMiniKitReady(true);
        console.log('[Auth] MiniKit is ready');
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkMiniKitReady()) {
      return;
    }

    // If not ready, poll for MiniKit availability
    const interval = setInterval(() => {
      if (checkMiniKitReady()) {
        clearInterval(interval);
      }
    }, 100);

    // Increased timeout to 15 seconds for production reliability
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setMiniKitReady(true); // Allow app to continue even if MiniKit isn't available
      console.warn('[Auth] MiniKit not detected after 15 seconds, continuing without it');
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Load session from localStorage on mount, but only after MiniKit is ready
  useEffect(() => {
    if (!miniKitReady) return;

    const loadStoredSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session: StoredSession = JSON.parse(stored);
          
          // Check if session is still valid (24 hours)
          if (Date.now() < session.expiresAt) {
            setUser(session.user);
            setIsAuthenticated(true);
            console.log('[Auth] Restored session for:', session.user.address);
            console.log('[Auth] Session expires at:', new Date(session.expiresAt).toLocaleString());
          } else {
            // Session expired, clear it
            localStorage.removeItem(STORAGE_KEY);
            console.log('[Auth] Session expired, cleared storage');
          }
        }
      } catch (error) {
        console.error('[Auth] Error loading stored session:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
        console.log('[Auth] Initial loading completed, isAuthenticated:', isAuthenticated);
      }
    };

    loadStoredSession();
  }, [miniKitReady]);

  // Save session to localStorage
  const saveSession = useCallback((userData: User) => {
    const session: StoredSession = {
      user: userData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    console.log('Session saved for:', userData.address);
  }, []);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Session cleared');
  }, []);

  const connectWallet = async (): Promise<boolean> => {
    if (!miniKitReady) {
      console.error("MiniKit is not ready yet");
      return false;
    }

    // More robust check for production environments
    const hasMiniKitCommands = window.MiniKit?.commandsAsync?.walletAuth !== undefined;
    const isWorldApp = window.WorldApp !== undefined;
    const isInstalledCheck = typeof window.MiniKit?.isInstalled === 'function' ? window.MiniKit.isInstalled() : false;
    
    console.log('[Auth] Wallet connection checks:', {
      hasMiniKitCommands,
      isWorldApp,
      isInstalledCheck
    });
    
    if (!hasMiniKitCommands && !isWorldApp) {
      console.error("MiniKit wallet commands not available");
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Starting MiniKit wallet authentication...');
      
      // Generate nonce for SIWE
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Perform wallet authentication with MiniKit
      const { finalPayload } = await window.MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // 1 hour
        statement: "Sign in with your World ID wallet to access the Proof of Life app",
      });

      if (finalPayload.status === "error") {
        console.error("Wallet auth failed:", finalPayload.error_code);
        return false;
      }

      console.log('Wallet auth successful:', finalPayload);

      // Verify the SIWE message locally
      const isValidMessage = await verifyLocalSiweMessage(finalPayload, nonce);
      
      if (!isValidMessage) {
        console.error('SIWE message verification failed');
        return false;
      }

      // Get user profile from MiniKit
      let userProfile;
      try {
        userProfile = await window.MiniKit.getUserByAddress(finalPayload.address);
      } catch (error) {
        console.warn('Could not fetch user profile, using address only:', error);
        userProfile = { username: null, profilePictureUrl: null };
      }

      // Create user object
      const userData: User = {
        address: finalPayload.address.toLowerCase(),
        username: userProfile.username || undefined,
        profilePictureUrl: userProfile.profilePictureUrl || undefined,
      };

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      saveSession(userData);
      
      console.log('Authentication successful for:', userData.address);
      return true;
      
    } catch (error) {
      console.error("Wallet connection error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
    console.log('User disconnected');
  }, [clearSession]);

  const refreshAuth = async (): Promise<void> => {
    // For now, just reload from storage
    // In a production app, you might want to validate the session with a server
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session: StoredSession = JSON.parse(stored);
        if (Date.now() < session.expiresAt) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          disconnect();
        }
      } catch (error) {
        console.error('Error refreshing auth:', error);
        disconnect();
      }
    }
  };

  const connectDevAccount = useCallback(() => {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Dev account is only available in development mode');
      return;
    }

    const devUser: User = {
      address: '0x1234567890123456789012345678901234567890',
      username: 'DevUser',
      profilePictureUrl: undefined,
    };

    setUser(devUser);
    setIsAuthenticated(true);
    saveSession(devUser);
    console.log('Connected dev account:', devUser.address);
  }, [saveSession]);

  const contextValue: UnifiedAuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    connectWallet,
    disconnect,
    refreshAuth,
    connectDevAccount,
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// Hook to use the unified auth context
export function useUnifiedAuth(): UnifiedAuthContextType {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedMiniKitAuthProvider');
  }
  return context;
}

// Local SIWE message verification (simplified)
async function verifyLocalSiweMessage(payload: any, expectedNonce: string): Promise<boolean> {
  try {
    if (!payload.message || !payload.signature || !payload.address) {
      return false;
    }

    // Parse the SIWE message to extract the nonce
    const messageLines = payload.message.split('\n');
    const nonceLine = messageLines.find((line: string) => line.startsWith('Nonce:'));
    
    if (!nonceLine) {
      console.error('No nonce found in message');
      return false;
    }

    const messageNonce = nonceLine.replace('Nonce:', '').trim();
    
    // Verify the nonce matches
    if (messageNonce !== expectedNonce) {
      console.error(`Nonce mismatch. Got: ${messageNonce}, Expected: ${expectedNonce}`);
      return false;
    }

    // In a production app, you would also verify the signature cryptographically
    // For now, we trust MiniKit's authentication
    return true;
  } catch (error) {
    console.error('Error verifying SIWE message:', error);
    return false;
  }
}

// Export the provider as default
export default UnifiedMiniKitAuthProvider;
