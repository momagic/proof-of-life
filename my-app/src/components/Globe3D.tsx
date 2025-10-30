"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// Dynamically import ReactGlobe to avoid SSR issues and naming conflicts
const ReactGlobe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[400px] h-[400px]">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

interface ClaimLocation {
  lat: number;
  lng: number;
  timestamp: number;
  id: string;
}

interface Globe3DProps {
  locations: ClaimLocation[];
  isLoadingBlockchain?: boolean;
  alive24h?: number;
}

export default function Globe3D({ locations, isLoadingBlockchain = false, alive24h }: Globe3DProps) {
  const globeEl = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [globeError, setGlobeError] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [useFallback, setUseFallback] = useState(false);

  // Responsive sizing - smaller on mobile to fit properly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateDimensions = () => {
      const viewportMin = Math.min(window.innerWidth, window.innerHeight);
      const target = Math.round(viewportMin * 0.6);
      const size = Math.max(360, Math.min(640, target));
      setDimensions({ width: size, height: size });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update camera/controls when ready or dimensions change (avoid manual canvas sizing)
  useEffect(() => {
    if (!globeReady || !globeEl.current) return;
    const controls = globeEl.current.controls();
    const camera = globeEl.current.camera();
    if (!controls || !camera) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const initialDistance = isMobile ? 400 : 300;
    const minDistance = isMobile ? 200 : 150; // Allow closer zoom
    const maxDistance = isMobile ? 600 : 500; // Allow further zoom out
    camera.fov = isMobile ? 60 : 50;
    camera.updateProjectionMatrix();
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    camera.position.set(0, 0, initialDistance);
    camera.lookAt(0, 0, 0);
    if (typeof controls.update === 'function') controls.update();
  }, [globeReady, dimensions]);

  // Globe ready state management with timeout
  useEffect(() => {
    // Set a timeout to detect if globe fails to load
    const loadTimeout = setTimeout(() => {
      if (!globeReady && !globeError) {
        console.warn('Globe loading timeout - using fallback');
        setGlobeError(true);
        setUseFallback(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(loadTimeout);
  }, [globeReady, globeError]);

  // Transform locations for globe points with enhanced cyberpunk styling
  const pointsData = useMemo(() => {
    return locations.map((location, index) => {
      const age = Date.now() - location.timestamp;
      const intensity = Math.max(0.6, 1 - age / 300000); // Fade over 5 minutes but keep minimum visibility
      const cyberpunkColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600', '#8800ff', '#ff0080', '#00ff00'];
      return {
        lat: location.lat,
        lng: location.lng,
        size: 2.0, // Fixed size for better performance
        color: cyberpunkColors[index % cyberpunkColors.length],
        id: location.id,
        intensity,
        // Add some debugging info
        timestamp: location.timestamp
      };
    });
  }, [locations]);

  // Reset states when locations change
  useEffect(() => {
    if (locations.length > 0 && globeReady) {
      console.log('New locations added to globe:', locations.length);
      console.log('Points data:', pointsData);
    }
  }, [locations, globeReady, pointsData]);

  // Simple 2D fallback globe
  const FallbackGlobe = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const rotationRef = useRef(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const drawGlobe = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Draw globe outline
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
        ctx.lineWidth = 1;

        // Longitude lines
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const radiusX = Math.abs(radius * Math.cos(angle));
          if (radiusX > 0) {
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radius, 0, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }

        // Latitude lines
        for (let i = 1; i < 6; i++) {
          const y = Math.abs((radius * i) / 3);
          if (y > 0) {
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius, y, 0, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }

        // Draw claim points
        locations.forEach((location, index) => {
          const phi = (location.lat * Math.PI) / 180;
          const theta = ((location.lng + rotationRef.current) * Math.PI) / 180;
          const x = centerX + radius * Math.cos(phi) * Math.sin(theta);
          const y = centerY - radius * Math.sin(phi);
          const z = Math.cos(phi) * Math.cos(theta);

          if (z > 0) {
            const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600'];
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
          }
        });

        rotationRef.current += 0.005;
      };

      const animate = () => {
        drawGlobe();
        animationRef.current = requestAnimationFrame(animate);
      };

      if (typeof window !== 'undefined') {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [locations]);

    return (
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ 
          width: `${dimensions.width}px`, 
          height: `${dimensions.height}px`,
          maxWidth: `${dimensions.width}px`, 
          maxHeight: `${dimensions.height}px` 
        }}
      />
    );
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}>
          {!globeReady && !globeError && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm font-medium">Loading Earth...</p>
              </div>
            </div>
          )}
          {globeError && !useFallback && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-white text-sm font-medium">Failed to load 3D Earth</p>
                <button 
                  onClick={() => {
                    setUseFallback(true);
                  }}
                  className="text-white text-xs px-4 py-2 rounded-full hover:bg-slate-800/50 transition-all duration-300"
                >
                  Use 2D Globe
                </button>
              </div>
            </div>
          )}

          {useFallback ? (
            <FallbackGlobe />
          ) : (
            <ReactGlobe
              ref={globeEl}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="rgba(0,0,0,0)"
              showGlobe={true}
              showAtmosphere={true}
              atmosphereColor="#00ffff"
              atmosphereAltitude={0.15}
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              pointsData={pointsData}
              pointAltitude={0.1}
              pointRadius={3.0}
              pointColor="color"
              pointResolution={4}
              pointsMerge={false}
              pointLabel={(d: any) => `🌟 LIFE Claim: ${d.lat.toFixed(2)}, ${d.lng.toFixed(2)}`}
              onGlobeReady={() => {
                console.log('🌍 Wireframe Globe ready!');
                setGlobeReady(true);
                setGlobeError(false);
                setTimeout(() => {
                  if (globeEl.current) {
                    try {
                      const controls = globeEl.current.controls();
                      controls.enableRotate = true;
                      controls.enablePan = false;
                      controls.enableZoom = true;
                      controls.autoRotate = true;
                      controls.autoRotateSpeed = 0.2;
                      controls.rotateSpeed = 0.3;
                      const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
                      const minDistance = isMobile ? 200 : 150;
                      const maxDistance = isMobile ? 600 : 500;
                      controls.minDistance = minDistance;
                      controls.maxDistance = maxDistance;
                      controls.enableDamping = false;
                      controls.dampingFactor = 0.1;
                      const camera = globeEl.current.camera();
                      if (camera) {
                        const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
                        camera.fov = isMobile ? 60 : 50;
                        camera.updateProjectionMatrix();
                        const initialDistance = isMobile ? 400 : 300;
                        camera.position.set(0, 0, initialDistance);
                        camera.lookAt(0, 0, 0);
                      }
                      const globeMesh = globeEl.current.scene().children.find((child: any) => child.type === 'Mesh');
                      if (globeMesh && globeMesh.material) {
                        globeMesh.material.wireframe = false;
                        globeMesh.material.transparent = true;
                        globeMesh.material.opacity = 0.9;
                        globeMesh.material.emissive = new THREE.Color(0x001133);
                        try {
                          const wireframeGeometry = new THREE.WireframeGeometry(globeMesh.geometry);
                          const wireframeMaterial = new THREE.LineBasicMaterial({ 
                            color: 0x00ffff, 
                            transparent: true, 
                            opacity: 0.2 
                          });
                          const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                          globeEl.current.scene().add(wireframe);
                        } catch (error) {
                          console.warn('Could not add wireframe overlay:', error);
                        }
                        globeMesh.position.set(0, 0, 0);
                      }
                    } catch (error) {
                      console.warn('Could not configure globe controls:', error);
                    }
                  }
                }, 100);
              }}
              onGlobeClick={() => {
                console.log('🌍 Globe interaction detected');
              }}
              rendererConfig={{
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
                precision: "mediump"
              }}
              animateIn={false}
              waitForGlobeReady={true}
            />
          )}

          {(globeReady || useFallback) && (
            <div className="absolute top-2 right-2 space-y-1">
              {isLoadingBlockchain && (
                <div className="bg-black/70 text-cyan-400 px-2 py-1 rounded text-xs font-mono">
                  <span className="animate-pulse">●</span> Loading blockchain data...
                </div>
              )}
              {typeof alive24h === 'number' && (
                <div className="bg-black/70 text-cyan-300 px-2 py-1 rounded text-xs font-mono">
                  24h alive: {alive24h}
                </div>
              )}
              {locations.length > 0 && (
                <div className="bg-black/70 text-green-400 px-2 py-1 rounded text-xs font-mono">
                  last {locations.length} claim{locations.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight hook for geolocation
export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLoading(false);
          setError(error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  return { getCurrentLocation, loading, error };
}