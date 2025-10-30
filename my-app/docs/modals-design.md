# Modal Design System Documentation

## Overview

This document describes the cyberpunk-themed modal design system used throughout the LIFE application. The design follows a neural/cyberpunk aesthetic with consistent styling patterns that can be modularly applied across different components.

## Core Design Philosophy

### Visual Identity
- **Theme**: Cyberpunk/Neural interface aesthetic
- **Primary Colors**: Cyan (#00d4ff) and Green (#00ff00) gradients
- **Typography**: Monospace fonts for terminal/code aesthetic
- **Animations**: Subtle pulsing, flowing energy effects
- **Layout**: Glass morphism with neural panel containers

## Base Modal Structure

### Container Classes
```css
/* Main modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

/* Modal content container */
.neural-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 20, 40, 0.8) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.1),
    inset 0 0 20px rgba(0, 212, 255, 0.05);
}
```

## Typography System

### Heading Hierarchy

#### H1 - Main Titles
```css
.modal-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: bold;
  background: linear-gradient(to right, #22d3ee, #10b981);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.5rem;
}
```

#### H2 - Section Headers
```css
.section-header {
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  color: #22d3ee; /* cyan-400 */
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  background: #22d3ee;
  border-radius: 50%;
  animation: neural-pulse 2s ease-in-out infinite;
}
```

#### Body Text
```css
.modal-text {
  color: #cbd5e1; /* slate-300 */
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.terminal-text {
  font-family: 'Courier New', monospace;
  color: #22d3ee; /* cyan-400 */
  font-size: 0.875rem;
}

.success-text {
  color: #4ade80; /* green-400 */
  font-family: 'Courier New', monospace;
}

.warning-text {
  color: #fb923c; /* orange-400 */
  font-family: 'Courier New', monospace;
}
```

## Color Palette

### Primary Colors
```css
:root {
  /* Energy Colors */
  --energy-primary: #00d4ff;
  --energy-secondary: #0099cc;
  --energy-tertiary: #006699;
  --energy-light: #33ddff;
  --energy-dark: #004466;
  
  /* Holographic Colors */
  --holographic-primary: #ff00ff;
  --holographic-secondary: #cc00cc;
  --holographic-tertiary: #990099;
  --holographic-light: #ff33ff;
  --holographic-dark: #660066;
  
  /* Status Colors */
  --success: #10b981; /* green-500 */
  --warning: #f59e0b; /* amber-500 */
  --error: #ef4444; /* red-500 */
  --info: #3b82f6; /* blue-500 */
}
```

### Gradient Definitions
```css
.energy-gradient {
  background: linear-gradient(45deg, #00d4ff, #0099cc, #006699);
}

.holographic-gradient {
  background: linear-gradient(45deg, #ff00ff 0%, #cc00cc 50%, #990099 100%);
}

.success-gradient {
  background: linear-gradient(to right, #22d3ee, #10b981);
}
```

## Border and Shadow System

### Border Styles
```css
/* Primary neural border */
.neural-border {
  border: 1px solid rgba(0, 212, 255, 0.3);
}

/* Active/hover border */
.neural-border-active {
  border: 1px solid rgba(0, 212, 255, 0.6);
}

/* Success border */
.success-border {
  border: 1px solid rgba(16, 185, 129, 0.5);
}

/* Warning border */
.warning-border {
  border: 1px solid rgba(251, 146, 60, 0.5);
}
```

### Shadow Effects
```css
/* Neural glow */
.neural-shadow {
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.1),
    inset 0 0 20px rgba(0, 212, 255, 0.05);
}

/* Hover enhancement */
.neural-shadow-hover {
  box-shadow: 
    0 0 30px rgba(0, 212, 255, 0.2),
    inset 0 0 30px rgba(0, 212, 255, 0.1);
}

/* Success glow */
.success-shadow {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
}
```

## Animation System

### Core Animations
```css
/* Neural pulse effect */
@keyframes neural-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Energy flow animation */
@keyframes energy-flow {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Data stream animation */
@keyframes data-stream {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Progress bar animation */
@keyframes progress {
  0% {
    width: 0%;
  }
  100% {
    width: var(--progress-width, 75%);
  }
}
```

### Animation Classes
```css
.animate-neural-pulse {
  animation: neural-pulse 2s ease-in-out infinite;
}

.animate-energy-flow {
  animation: energy-flow 3s ease-in-out infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-data-stream {
  animation: data-stream 2s linear infinite;
}

.animate-progress {
  animation: progress 2s ease-out forwards;
}
```

## Component Patterns

### Status Indicators
```css
/* Development mode indicator */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
  border: 1px solid rgba(251, 146, 60, 0.5); /* orange-400/50 */
  color: #fb923c; /* orange-400 */
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.status-indicator::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  background: #fb923c;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

### Progress Bars
```css
.progress-container {
  width: 100%;
  background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
  border-radius: 9999px;
  height: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3); /* slate-600/30 */
}

.progress-bar {
  background: linear-gradient(to right, #06b6d4, #10b981); /* cyan-500 to green-500 */
  height: 0.5rem;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

### Terminal Elements
```css
.terminal-output {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #cbd5e1; /* slate-300 */
}

.terminal-prompt::before {
  content: '> ';
  color: #22d3ee; /* cyan-400 */
}

.terminal-status {
  color: #22d3ee; /* cyan-400 */
  animation: pulse 2s infinite;
}
```

## Interactive States

### Button States
```css
.neural-button {
  position: relative;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* Default state */
.neural-button-default {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #cbd5e1;
}

/* Hover state */
.neural-button-default:hover {
  border-color: rgba(0, 212, 255, 0.6);
  color: #22d3ee;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

/* Active state */
.neural-button-active {
  background: linear-gradient(to right, #06b6d4, #10b981);
  color: white;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}
```

### Hover Effects
```css
.hover-glow:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
  border-color: rgba(0, 212, 255, 0.6);
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}
```

## Layout Patterns

### Modal Sizing
```css
/* Small modal */
.modal-sm {
  max-width: 28rem; /* max-w-md */
}

/* Medium modal */
.modal-md {
  max-width: 32rem; /* max-w-lg */
}

/* Large modal */
.modal-lg {
  max-width: 56rem; /* max-w-4xl */
}

/* Full height constraint */
.modal-scrollable {
  max-height: 90vh;
  overflow-y: auto;
}
```

### Content Spacing
```css
.modal-content {
  padding: 2rem;
  space-y: 1.5rem;
}

.modal-section {
  margin-bottom: 1.5rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}
```

## Accessibility Considerations

### Focus States
```css
.neural-focus:focus {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}

.neural-focus:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.5);
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animate-neural-pulse,
  .animate-energy-flow,
  .animate-float,
  .animate-data-stream {
    animation: none;
  }
}
```

## Implementation Guidelines

### Modular Usage

1. **Base Structure**: Always start with `.neural-panel` for modal containers
2. **Typography**: Use consistent heading hierarchy with `.section-header` and `.modal-text`
3. **Colors**: Stick to the defined color palette variables
4. **Animations**: Apply animations sparingly and respect user preferences
5. **Spacing**: Use consistent padding and margin patterns

### Component Composition

```jsx
// Example modal structure
<div className="modal-overlay">
  <div className="neural-panel modal-lg modal-scrollable">
    <div className="modal-content">
      <h1 className="modal-title">Modal Title</h1>
      <div className="modal-section">
        <h2 className="section-header">Section Title</h2>
        <p className="modal-text">Content text...</p>
      </div>
    </div>
  </div>
</div>
```

### Customization Points

- **Colors**: Modify CSS custom properties for theme variations
- **Animations**: Adjust animation duration and easing functions
- **Spacing**: Update padding and margin values for different layouts
- **Typography**: Change font families while maintaining monospace for terminal elements

## Future Enhancements

### Planned Additions
- Sound effects integration
- More sophisticated glitch effects
- Dynamic background patterns
- Enhanced accessibility features
- Theme switching capabilities

### Maintenance Notes
- Keep animations performant (use `transform` and `opacity`)
- Test across different screen sizes
- Validate color contrast ratios
- Monitor animation performance on lower-end devices

This design system ensures consistent, modular, and maintainable modal components throughout the LIFE application while maintaining the cyberpunk aesthetic and user experience standards.