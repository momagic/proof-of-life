import React from 'react';

// Neural Pod Icon
export const NeuralPodIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path d="M12 2C8.5 2 6 4.5 6 8v8c0 3.5 2.5 6 6 6s6-2.5 6-6V8c0-3.5-2.5-6-6-6z" fill="url(#neuralGradient)" opacity="0.3" />
    <circle cx="12" cy="8" r="2" fill="#8B5CF6" />
    <circle cx="12" cy="12" r="1.5" fill="#EC4899" />
    <circle cx="12" cy="16" r="1" fill="#8B5CF6" />
    <path d="M8 10h2M14 10h2M8 14h2M14 14h2" stroke="#8B5CF6" strokeWidth="1" />
  </svg>
);

// Data Fortress Icon
export const DataFortressIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fortressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="16" height="12" rx="2" fill="url(#fortressGradient)" opacity="0.3" />
    <rect x="6" y="6" width="12" height="2" fill="#06B6D4" />
    <rect x="8" y="4" width="8" height="2" fill="#8B5CF6" />
    <rect x="6" y="10" width="2" height="2" fill="#06B6D4" />
    <rect x="10" y="10" width="2" height="2" fill="#8B5CF6" />
    <rect x="14" y="10" width="2" height="2" fill="#06B6D4" />
    <rect x="6" y="14" width="2" height="2" fill="#8B5CF6" />
    <rect x="10" y="14" width="2" height="2" fill="#06B6D4" />
    <rect x="14" y="14" width="2" height="2" fill="#8B5CF6" />
  </svg>
);

// Cyber Tower Icon
export const CyberTowerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect x="8" y="4" width="8" height="16" fill="url(#towerGradient)" opacity="0.3" />
    <rect x="6" y="18" width="12" height="2" fill="#10B981" />
    <rect x="9" y="6" width="2" height="2" fill="#06B6D4" />
    <rect x="13" y="6" width="2" height="2" fill="#10B981" />
    <rect x="9" y="10" width="2" height="2" fill="#10B981" />
    <rect x="13" y="10" width="2" height="2" fill="#06B6D4" />
    <rect x="9" y="14" width="2" height="2" fill="#06B6D4" />
    <rect x="13" y="14" width="2" height="2" fill="#10B981" />
    <circle cx="12" cy="2" r="1" fill="#06B6D4" />
    <path d="M10 2L12 4L14 2" stroke="#10B981" strokeWidth="1" fill="none" />
  </svg>
);

// Neon Palace Icon
export const NeonPalaceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="palaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path d="M12 2L4 8v12h16V8L12 2z" fill="url(#palaceGradient)" opacity="0.3" />
    <path d="M12 2L8 6h8L12 2z" fill="#F59E0B" />
    <rect x="6" y="12" width="2" height="6" fill="#EC4899" />
    <rect x="10" y="10" width="2" height="8" fill="#F59E0B" />
    <rect x="14" y="12" width="2" height="6" fill="#EC4899" />
    <rect x="18" y="14" width="2" height="4" fill="#F59E0B" />
    <circle cx="12" cy="8" r="1" fill="#EC4899" />
    <path d="M8 18h8" stroke="#F59E0B" strokeWidth="2" />
  </svg>
);

// Quantum Spire Icon
export const QuantumSpireIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/> 
        </feMerge>
      </filter>
    </defs>
    <path d="M12 2L10 6L8 10L6 14L4 18h16L18 14L16 10L14 6L12 2z" fill="url(#quantumGradient)" opacity="0.4" />
    <circle cx="12" cy="4" r="1" fill="#8B5CF6" filter="url(#glow)" />
    <circle cx="12" cy="8" r="1.5" fill="#06B6D4" filter="url(#glow)" />
    <circle cx="12" cy="12" r="2" fill="#10B981" filter="url(#glow)" />
    <circle cx="12" cy="16" r="1.5" fill="#06B6D4" filter="url(#glow)" />
    <path d="M8 6L16 6M7 10L17 10M6 14L18 14" stroke="url(#quantumGradient)" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Icon mapping for easy access
export const CyberpunkIcons = {
  neural_pod: NeuralPodIcon,
  data_fortress: DataFortressIcon,
  cyber_tower: CyberTowerIcon,
  neon_palace: NeonPalaceIcon,
  quantum_spire: QuantumSpireIcon,
};

export type CyberpunkIconType = keyof typeof CyberpunkIcons;