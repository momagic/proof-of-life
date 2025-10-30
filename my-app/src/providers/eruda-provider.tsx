"use client";

import { useEffect } from "react";

// Toggle this to enable/disable Eruda in production
const ENABLE_ERUDA_IN_PROD = true; // Set to false to disable in production

export function ErudaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize eruda based on environment and toggle
    const shouldInitialize = process.env.NODE_ENV === 'development' || ENABLE_ERUDA_IN_PROD;
    
    if (shouldInitialize) {
      // Dynamic import for client-side only
      import("eruda").then((eruda) => {
        eruda.default.init();
      }).catch((error) => {
        console.warn('Failed to initialize Eruda:', error);
      });
    }
  }, []);

  return <>{children}</>;
}
