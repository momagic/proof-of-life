import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        // World Design Guidelines spacing
        'world-xs': '12px',   // Safe area spacing for iOS/Android
        'world-sm': '16px',   // Default content spacing
        'world-md': '24px',   // Default padding and header spacing
        'world-lg': '32px',   // Section separation spacing
        // Mobile-first game-like compact spacing
        'game-xs': '2px',     // Ultra-compact spacing
        'game-sm': '4px',     // Minimal spacing
        'game-md': '6px',     // Small spacing
        'game-lg': '8px',     // Medium spacing
        'game-xl': '12px',    // Larger spacing
      },
      fontSize: {
        // Mobile-first game UI font sizes
        'game-xs': ['10px', { lineHeight: '14px' }],
        'game-sm': ['12px', { lineHeight: '16px' }],
        'game-md': ['14px', { lineHeight: '18px' }],
        'game-lg': ['16px', { lineHeight: '20px' }],
        'game-xl': ['18px', { lineHeight: '22px' }],
      },
      maxWidth: {
        // Compact panel widths for mobile game UI
        'game-panel': '90%',
        'game-card': '45%',
        'game-widget': '30%',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Black and white glassmorphic colors
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.15)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
        energy: {
          primary: "#00d4ff",
          secondary: "#0099cc",
          tertiary: "#006699",
          light: "#33ddff",
          dark: "#004466",
        },
        holographic: {
          primary: "#ff00ff",
          secondary: "#cc00cc",
          tertiary: "#990099",
          light: "#ff33ff",
          dark: "#660066",
        },
        "glass-border": "rgba(255, 255, 255, 0.2)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        'glass': '10px',
        'glass-strong': '20px',
      },
      backgroundImage: {
        'energy-gradient': 'linear-gradient(45deg, #00d4ff, #0099cc, #006699)',
        'holographic': 'linear-gradient(45deg, #ff00ff 0%, #cc00cc 50%, #990099 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'energy': '0 0 20px rgba(255, 255, 255, 0.3)',
        'holographic': '0 0 30px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "energy-flow": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "holographic-shift": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        "glass-pulse": {
          "0%, 100%": { "backdrop-filter": "blur(10px)", opacity: "0.8" },
          "50%": { "backdrop-filter": "blur(15px)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%) scaleY(0)", opacity: "0" },
          "10%": { transform: "translateY(-100%) scaleY(1)", opacity: "1" },
          "90%": { transform: "translateY(100%) scaleY(1)", opacity: "1" },
          "100%": { transform: "translateY(100%) scaleY(0)", opacity: "0" },
        },
        // Cyberpunk Neural Interface Keyframes
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "neural-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)", filter: "brightness(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)", filter: "brightness(1.2)" },
        },
        "fingerprint-scan": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "retina-scan": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "inset 0 0 20px #ff00ff, 0 0 20px #ff00ff" },
          "50%": { transform: "scale(1.1)", boxShadow: "inset 0 0 40px #ff00ff, 0 0 40px #ff00ff" },
        },
        "data-stream": {
          "0%": { transform: "translateY(-100vh)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "terminal-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "static-noise": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "0.1" },
        },
        "screen-flicker": {
          "0%, 98%, 100%": { opacity: "1" },
          "99%": { opacity: "0.8" },
        },
        "panel-activate": {
          "0%": { borderColor: "rgba(0, 212, 255, 0.3)", boxShadow: "0 0 10px rgba(0, 212, 255, 0.2)" },
          "100%": { borderColor: "rgba(0, 212, 255, 1)", boxShadow: "0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "energy-flow": "energy-flow 2s ease-in-out infinite",
        "holographic-shift": "holographic-shift 3s ease-in-out infinite",
        "glass-pulse": "glass-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        // Cyberpunk Neural Interface Animations
        "glitch": "glitch 0.3s ease-in-out infinite",
        "neural-pulse": "neural-pulse 2s ease-in-out infinite",
        "fingerprint-scan": "fingerprint-scan 2s linear infinite",
        "retina-scan": "retina-scan 3s ease-in-out infinite",
        "data-stream": "data-stream 4s linear infinite",
        "terminal-blink": "terminal-blink 1s infinite",
        "static-noise": "static-noise 0.1s infinite",
        "screen-flicker": "screen-flicker 0.15s infinite linear",
        "panel-activate": "panel-activate 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

