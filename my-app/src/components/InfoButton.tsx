"use client";

import { Info, X } from "lucide-react";

interface InfoButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function InfoButton({ onClick, isOpen = false }: InfoButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 neural-panel p-3 hover:shadow-cyan-400/20 transition-all duration-300 group"
    >
      <div className="relative w-5 h-5">
        {/* Info Icon */}
        <Info 
          className={`absolute inset-0 w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 transform ${
            isOpen ? 'rotate-180 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`} 
        />
        {/* X Icon */}
        <X 
          className={`absolute inset-0 w-5 h-5 text-red-400 group-hover:text-red-300 transition-all duration-300 transform ${
            isOpen ? 'rotate-0 opacity-100 scale-100' : 'rotate-180 opacity-0 scale-0'
          }`} 
        />
      </div>
    </button>
  );
}