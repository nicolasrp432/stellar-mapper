import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { PlanetData } from '@/types/exoplanet';
import { useIsMobile } from '@/hooks/use-mobile';

interface Professional3DVisualizationProps {
  planetData: PlanetData;
}

const ProfessionalPlanet = ({ planetData }: { planetData: PlanetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  const radius = Math.max(0.5, Math.min(2, planetData.features.radius * 0.3));
  
  // Create planet texture based on type and status
  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base color based on exoplanet status
    const baseColor = isExoplanet ? '#22c55e' : '#ef4444';
    const secondaryColor = isExoplanet ? '#16a34a' : '#dc2626';
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, secondaryColor);
    gradient.addColorStop(1, baseColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    
    // Add surface details
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = Math.random() * 20 + 5;
      
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add atmospheric bands for gas giants
    if (planetData.features.radius > 3) {
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 10; i++) {
        const y = (i / 10) * 256;
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(0, y, 512, 25);
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [planetData, isExoplanet]);
  
  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group>
      {/* Main planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshStandardMaterial
          map={planetTexture}
          emissive={isExoplanet ? '#22c55e' : '#ef4444'}
          emissiveIntensity={0.1}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Atmosphere for larger planets */}
      {planetData.features.radius > 2 && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.1, 32, 16]} />
          <meshBasicMaterial
            color={isExoplanet ? '#22c55e' : '#ef4444'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[radius * 1.2, 32, 16]} />
        <meshBasicMaterial
          color={isExoplanet ? '#22c55e' : '#ef4444'}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Ring system for gas giants */}
      {planetData.features.radius > 4 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 2, 64]} />
          <meshBasicMaterial
            color={isExoplanet ? '#22c55e' : '#ef4444'}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Planet label */}
      <Text
        position={[0, radius + 1, 0]}
        fontSize={0.3}
        color={isExoplanet ? '#22c55e' : '#ef4444'}
        anchorX="center"
        anchorY="middle"
      >
        {planetData.name || planetData.id}
      </Text>
    </group>
  );
};

const Scene = ({ planetData, isMobile }: { planetData: PlanetData; isMobile: boolean }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? 500 : 1000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      <ProfessionalPlanet planetData={planetData} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={isMobile ? 0.3 : 0.5}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.3 : 0.5}
        zoomSpeed={isMobile ? 0.3 : 1}
      />
    </>
  );
};

export const Professional3DVisualization = ({ planetData }: Professional3DVisualizationProps) => {
  const isMobile = useIsMobile();
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full w-full relative"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        className="w-full h-full"
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance"
        }}
      >
        <Scene planetData={planetData} isMobile={isMobile} />
      </Canvas>
      
      {/* Status indicator */}
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10`}>
        <div className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'} rounded-full font-semibold ${
          isExoplanet 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isMobile 
            ? (isExoplanet ? 'Exoplaneta' : 'Falso Positivo')
            : (isExoplanet ? 'Exoplaneta Confirmado' : 'Falso Positivo')
          }
        </div>
      </div>
      
      {/* Planet info overlay */}
      <div className={`absolute ${isMobile ? 'bottom-2 left-2 right-2' : 'bottom-4 left-4 right-4'} z-10`}>
        <div className={`glass-panel ${isMobile ? 'p-2' : 'p-4'} rounded-lg`}>
          <h4 className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} mb-2`}>
            {planetData.name || planetData.id}
          </h4>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'} ${isMobile ? 'text-xs' : 'text-xs'}`}>
            <div>
              <span className="text-muted-foreground">Radio:</span>
              <span className="ml-1 font-medium">{planetData.features.radius.toFixed(2)} R⊕</span>
            </div>
            <div>
              <span className="text-muted-foreground">Período:</span>
              <span className="ml-1 font-medium">{planetData.features.period} días</span>
            </div>
            <div>
              <span className="text-muted-foreground">Distancia:</span>
              <span className="ml-1 font-medium">{planetData.features.distance.toFixed(1)} UA</span>
            </div>
            <div>
              <span className="text-muted-foreground">Probabilidad:</span>
              <span className="ml-1 font-medium">{((planetData.probability ?? 0.5) * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          {/* Planet type classification */}
          {!isMobile && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-muted-foreground text-xs">Tipo: </span>
              <span className="text-xs font-medium">
                {planetData.features.radius < 1.5 
                  ? 'Planeta Rocoso' 
                  : planetData.features.radius < 4 
                  ? 'Neptuno' 
                  : 'Gigante Gaseoso'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};