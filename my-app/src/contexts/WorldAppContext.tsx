'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

// Extend the Window interface to include WorldApp
declare global {
  interface Window {
    WorldApp?: {
      pending_notifications: number;
      supported_commands: Array<{
        name: string;
        supported_versions: number[];
      }>;
      world_app_version: number;
      safe_area_insets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      device_os: string;
      is_optional_analytics: boolean;
    };
  }
}

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface DeviceProperties {
  safeAreaInsets: SafeAreaInsets;
  deviceOS: string;
  worldAppVersion: number;
}

interface WorldAppContextType {
  deviceProperties: DeviceProperties | null;
  isWorldApp: boolean;
  isLoading: boolean;
}

const defaultSafeAreaInsets: SafeAreaInsets = {
  top: 44,
  right: 0,
  bottom: 34,
  left: 0,
};

const WorldAppContext = createContext<WorldAppContextType>({
  deviceProperties: null,
  isWorldApp: false,
  isLoading: true,
});

export const useWorldApp = () => {
  const context = useContext(WorldAppContext);
  if (!context) {
    throw new Error('useWorldApp must be used within a WorldAppProvider');
  }
  return context;
};

interface WorldAppProviderProps {
  children: ReactNode;
}

export const WorldAppProvider: React.FC<WorldAppProviderProps> = ({ children }) => {
  const [deviceProperties, setDeviceProperties] = useState<DeviceProperties | null>(null);
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWorldApp = async () => {
      try {
        // Check if we're running in World App environment
        if (typeof window !== 'undefined' && window.WorldApp) {
          setIsWorldApp(true);
          
          // Get device properties from MiniKit
          const properties = MiniKit.deviceProperties;
          
          if (properties) {
            setDeviceProperties({
              safeAreaInsets: properties.safeAreaInsets || defaultSafeAreaInsets,
              deviceOS: properties.deviceOS || 'unknown',
              worldAppVersion: properties.worldAppVersion || 0,
            });
          } else {
            // Fallback to default values if properties are not available
            setDeviceProperties({
              safeAreaInsets: defaultSafeAreaInsets,
              deviceOS: 'unknown',
              worldAppVersion: 0,
            });
          }
        } else {
          // Not in World App, use default values for development
          setIsWorldApp(false);
          setDeviceProperties({
            safeAreaInsets: defaultSafeAreaInsets,
            deviceOS: 'web',
            worldAppVersion: 0,
          });
        }
      } catch (error) {
        console.warn('Failed to initialize World App context:', error);
        // Fallback to default values
        setDeviceProperties({
          safeAreaInsets: defaultSafeAreaInsets,
          deviceOS: 'unknown',
          worldAppVersion: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorldApp();
  }, []);

  return (
    <WorldAppContext.Provider
      value={{
        deviceProperties,
        isWorldApp,
        isLoading,
      }}
    >
      {children}
    </WorldAppContext.Provider>
  );
};

// Hook to get safe area insets with fallback values
export const useSafeAreaInsets = () => {
  const { deviceProperties } = useWorldApp();
  return deviceProperties?.safeAreaInsets || defaultSafeAreaInsets;
};

// Hook to check if running in World App
export const useIsWorldApp = () => {
  const { isWorldApp } = useWorldApp();
  return isWorldApp;
};

// Hook to get device OS
export const useDeviceOS = () => {
  const { deviceProperties } = useWorldApp();
  return deviceProperties?.deviceOS || 'unknown';
};