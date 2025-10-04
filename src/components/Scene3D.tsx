import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Star } from './Star';
import { Planet } from './Planet';
import { Tooltip2D } from './Tooltip2D';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { useIsMobile } from '@/hooks/use-mobile';

export const Scene3D = () => {
  const { planets } = usePlanetsStore();
  const isMobile = useIsMobile();

  // Mobile performance optimizations
  const mobileSettings = {
    starCount: 2000,
    starRadius: 200,
    starDepth: 40,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: false,
    shadows: false
  };

  const desktopSettings = {
    starCount: 5000,
    starRadius: 300,
    starDepth: 60,
    pixelRatio: window.devicePixelRatio,
    antialias: true,
    shadows: true
  };

  const settings = isMobile ? mobileSettings : desktopSettings;

  return (
    <Canvas
      camera={{ position: [0, 15, 15], fov: 60 }}
      style={{ background: 'transparent' }}
      dpr={settings.pixelRatio}
      gl={{ 
        antialias: settings.antialias,
        alpha: true,
        powerPreference: isMobile ? "low-power" : "high-performance"
      }}
      shadows={settings.shadows}
      performance={{ min: 0.5 }}
    >
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Background stars - reduced count on mobile */}
      <Stars 
        radius={settings.starRadius} 
        depth={settings.starDepth} 
        count={settings.starCount} 
        factor={4} 
        fade 
        speed={0.5} 
      />
      
      {/* Central star */}
      <Star />
      
      {/* Planets */}
      {planets.map((planet) => (
        <Planet key={planet.id} planet={planet} />
      ))}
      
      {/* Camera controls - optimized for touch on mobile */}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minPolarAngle={Math.PI / 2 - 0.3}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.8 : 1}
        zoomSpeed={isMobile ? 0.8 : 1}
      />
      
      {/* Tooltip (must be inside Canvas to use R3F hooks) */}
      <Tooltip2D />
    </Canvas>
  );
};
