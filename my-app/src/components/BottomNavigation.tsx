"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Package, Trophy, User, Wallet } from "lucide-react";
import { useSafeAreaInsets } from "@/contexts/WorldAppContext";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    id: "assets",
    label: "Assets",
    icon: Package,
    path: "/assets",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    path: "/wallet",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    path: "/profile",
  },
];

interface BottomNavigationProps {
  className?: string;
}

function BottomNavigationComponent({ className = "" }: BottomNavigationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    if (isMounted) {
      router.push(path);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-t border-white/20 shadow-lg">
      <div className="flex justify-around items-center py-world-xs max-w-md mx-auto px-world-xs relative">
        <div className="absolute inset-0 bg-gradient-to-r from-energy-primary/5 via-holographic-primary/5 to-energy-secondary/5 animate-energy-flow" />
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`relative flex flex-col items-center py-2.5 px-3 rounded-xl transition-all duration-300 min-w-0 flex-1 group z-10 ${
                isActive 
                  ? 'text-energy-primary shadow-energy scale-105 transform' 
                  : 'text-gray-400 hover:text-holographic-primary active:scale-95'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-400/30 rounded-xl animate-neural-pulse" />
              )}
              <div className={`relative z-10 p-1 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-400/40' : 'group-hover:bg-slate-800/30'
              }`}>
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'scale-110 animate-float' : 'group-hover:scale-105'
                }`} />
              </div>
              <span className={`relative z-10 text-xs font-medium mt-1 truncate max-w-full transition-all duration-300 ${
                isActive ? 'font-semibold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent' : 'group-hover:text-holographic-primary'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="relative z-10 w-1 h-1 bg-gradient-to-r from-energy-primary to-energy-secondary rounded-full mt-0.5 animate-holographic-shift" />
              )}
            </button>
          );
        })}
      </div>
      {/* Dynamic safe area inset for bottom */}
      <div 
        style={{ height: `${safeAreaInsets.bottom}px` }}
        className="min-h-world-xs" 
      />
    </nav>
  );
}

// Export with dynamic import to disable SSR and prevent router mounting issues
export const BottomNavigation = dynamic(() => Promise.resolve(BottomNavigationComponent), {
  ssr: false,
});