import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Sphere, Ring } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { PlanetData } from '@/types/exoplanet';
import { useIsMobile } from '@/hooks/use-mobile';

interface Professional3DVisualizationProps {
  planetData: PlanetData;
}

// Enhanced planet type classification
const getPlanetType = (planetData: PlanetData): 'rocky' | 'gas' | 'ice' | 'super-earth' => {
  const radius = planetData.features.radius;
  const distance = planetData.features.distance;
  
  if (radius < 1.25) return 'rocky';
  if (radius < 2) return 'super-earth';
  if (distance > 5 || radius < 4) return 'ice';
  return 'gas';
};

const ProfessionalPlanet = ({ planetData }: { planetData: PlanetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  const radius = Math.max(0.5, Math.min(3, planetData.features.radius * 0.25));
  const planetType = useMemo(() => getPlanetType(planetData), [planetData]);
  
  // Enhanced planet texture creation
  const { planetTexture, normalMap, emissiveMap } = useMemo(() => {
    // Main texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Noise function for realistic patterns
    const noise = (x: number, y: number, scale: number = 1) => {
      const nx = x * scale;
      const ny = y * scale;
      return (Math.sin(nx * 0.1) + Math.sin(ny * 0.1) + Math.sin((nx + ny) * 0.05)) / 3;
    };
    
    const imageData = ctx.createImageData(1024, 512);
    const data = imageData.data;
    
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const index = (y * 1024 + x) * 4;
        const noiseValue = noise(x, y, 0.01) * 0.5 + 0.5;
        const detailNoise = noise(x, y, 0.05) * 0.3 + 0.7;
        
        let r, g, b;
        
        switch (planetType) {
          case 'rocky':
            // Earth-like with continents and oceans
            if (noiseValue > 0.6) {
              r = Math.floor((139 + noiseValue * 50) * detailNoise);
              g = Math.floor((69 + noiseValue * 80) * detailNoise);
              b = Math.floor((19 + noiseValue * 30) * detailNoise);
            } else {
              r = Math.floor((30 + noiseValue * 40) * detailNoise);
              g = Math.floor((144 + noiseValue * 60) * detailNoise);
              b = Math.floor((255 * (0.6 + noiseValue * 0.4)) * detailNoise);
            }
            break;
            
          case 'super-earth':
            // Larger rocky world with more varied terrain
            const elevation = noiseValue;
            if (elevation > 0.7) {
              // Mountains - grays and browns
              r = Math.floor((120 + elevation * 80) * detailNoise);
              g = Math.floor((100 + elevation * 60) * detailNoise);
              b = Math.floor((80 + elevation * 40) * detailNoise);
            } else if (elevation > 0.4) {
              // Plains - greens and browns
              r = Math.floor((100 + elevation * 60) * detailNoise);
              g = Math.floor((120 + elevation * 80) * detailNoise);
              b = Math.floor((60 + elevation * 40) * detailNoise);
            } else {
              // Lowlands/water - blues
              r = Math.floor((40 + elevation * 60) * detailNoise);
              g = Math.floor((80 + elevation * 100) * detailNoise);
              b = Math.floor((200 + elevation * 55) * detailNoise);
            }
            break;
            
          case 'gas':
            // Jupiter-like with bands
            const bandY = Math.sin(y * 0.02) * 0.5 + 0.5;
            const bandPattern = Math.sin(y * 0.1 + x * 0.001) * 0.3 + 0.7;
            
            if (bandY > 0.7) {
              r = Math.floor((255 * (0.9 + noiseValue * 0.1)) * bandPattern);
              g = Math.floor((228 * (0.8 + noiseValue * 0.2)) * bandPattern);
              b = Math.floor((181 * (0.7 + noiseValue * 0.3)) * bandPattern);
            } else if (bandY > 0.3) {
              r = Math.floor((222 * (0.8 + noiseValue * 0.2)) * bandPattern);
              g = Math.floor((184 * (0.7 + noiseValue * 0.3)) * bandPattern);
              b = Math.floor((135 * (0.6 + noiseValue * 0.4)) * bandPattern);
            } else {
              r = Math.floor((139 * (0.6 + noiseValue * 0.4)) * bandPattern);
              g = Math.floor((69 * (0.5 + noiseValue * 0.5)) * bandPattern);
              b = Math.floor((19 * (0.4 + noiseValue * 0.6)) * bandPattern);
            }
            break;
            
          case 'ice':
            // Europa-like ice world
            const crackPattern = Math.abs(noise(x, y, 0.02)) > 0.3 ? 0.3 : 1.0;
            r = Math.floor((224 + noiseValue * 31) * crackPattern * detailNoise);
            g = Math.floor((255 * (0.9 + noiseValue * 0.1)) * crackPattern * detailNoise);
            b = Math.floor((255 * (0.95 + noiseValue * 0.05)) * crackPattern * detailNoise);
            break;
            
          default:
            r = g = b = 128;
        }
        
        // Apply exoplanet status tint
        if (!isExoplanet) {
          r = Math.floor(r * 0.8 + 50); // Add red tint for false positives
          g = Math.floor(g * 0.6);
          b = Math.floor(b * 0.6);
        }
        
        data[index] = Math.min(255, Math.max(0, r));
        data[index + 1] = Math.min(255, Math.max(0, g));
        data[index + 2] = Math.min(255, Math.max(0, b));
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add surface features
    if (planetType === 'rocky' || planetType === 'super-earth') {
      // Add cloud patterns
      ctx.globalCompositeOperation = 'overlay';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const size = Math.random() * 80 + 40;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
      }
    }
    
    const planetTexture = new THREE.CanvasTexture(canvas);
    
    // Create normal map
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 512;
    normalCanvas.height = 256;
    const normalCtx = normalCanvas.getContext('2d')!;
    const normalImageData = normalCtx.createImageData(512, 256);
    const normalData = normalImageData.data;
    
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 512; x++) {
        const index = (y * 512 + x) * 4;
        const height = noise(x, y, 0.02) * 0.5 + 0.5;
        
        normalData[index] = Math.floor((height * 0.5 + 0.5) * 255);
        normalData[index + 1] = Math.floor((height * 0.5 + 0.5) * 255);
        normalData[index + 2] = 255;
        normalData[index + 3] = 255;
      }
    }
    
    normalCtx.putImageData(normalImageData, 0, 0);
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    
    // Create emissive map for gas giants
    let emissiveMap = null;
    if (planetType === 'gas') {
      const emissiveCanvas = document.createElement('canvas');
      emissiveCanvas.width = 512;
      emissiveCanvas.height = 256;
      const emissiveCtx = emissiveCanvas.getContext('2d')!;
      
      // Add storm systems
      emissiveCtx.fillStyle = '#000000';
      emissiveCtx.fillRect(0, 0, 512, 256);
      
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const size = Math.random() * 40 + 20;
        
        const gradient = emissiveCtx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, isExoplanet ? '#22c55e' : '#ef4444');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        emissiveCtx.fillStyle = gradient;
        emissiveCtx.fillRect(x - size, y - size, size * 2, size * 2);
      }
      
      emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
    }
    
    return { planetTexture, normalMap, emissiveMap };
  }, [planetData, isExoplanet, planetType]);
  
  // Enhanced animation with interactive features
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      // Different rotation speeds based on planet type
      const rotationSpeed = planetType === 'gas' ? 0.02 : 0.008;
      meshRef.current.rotation.y += rotationSpeed;
      
      // Subtle wobble for realistic effect
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.03;
      
      // Hover effect
      if (isHovered) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(time * 2) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.003;
      atmosphereRef.current.rotation.x = Math.sin(time * 0.4) * 0.02;
    }
    
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.001;
    }
  });
  
  const handlePointerOver = () => setIsHovered(true);
  const handlePointerOut = () => setIsHovered(false);
  
  return (
    <group>
      {/* Main planet with enhanced materials */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 128, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(
            planetType === 'rocky' || planetType === 'super-earth' ? 1.5 : 0.5,
            planetType === 'rocky' || planetType === 'super-earth' ? 1.5 : 0.5
          )}
          emissiveMap={emissiveMap}
          emissive={isExoplanet ? '#22c55e' : '#ef4444'}
          emissiveIntensity={planetType === 'gas' ? 0.2 : 0.05}
          roughness={planetType === 'ice' ? 0.1 : planetType === 'gas' ? 0.9 : 0.7}
          metalness={planetType === 'rocky' || planetType === 'super-earth' ? 0.3 : 0.1}
          envMapIntensity={planetType === 'ice' ? 1.5 : 0.8}
        />
      </mesh>
      
      {/* Enhanced atmosphere for larger planets */}
      {(planetType === 'gas' || planetType === 'super-earth') && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.08, 64, 32]} />
          <meshBasicMaterial
            color={planetType === 'gas' 
              ? (isExoplanet ? '#FFE4B5' : '#FF6B6B') 
              : (isExoplanet ? '#87CEEB' : '#FFA07A')
            }
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Multi-layer glow effect */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 32, 16]} />
        <meshBasicMaterial
          color={isExoplanet ? '#22c55e' : '#ef4444'}
          transparent
          opacity={isHovered ? 0.2 : 0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[radius * 1.3, 16, 8]} />
        <meshBasicMaterial
          color={isExoplanet ? '#22c55e' : '#ef4444'}
          transparent
          opacity={isHovered ? 0.1 : 0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced ring system for gas giants */}
      {planetType === 'gas' && planetData.features.radius > 3 && (
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.4, radius * 2.2, 128]} />
            <meshBasicMaterial
              color={isExoplanet ? '#D4AF37' : '#CD853F'}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Inner ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.2, radius * 1.35, 64]} />
            <meshBasicMaterial
              color={isExoplanet ? '#F0E68C' : '#DEB887'}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
      
      {/* Interactive planet label */}
      <Text
        position={[0, radius + 1.2, 0]}
        fontSize={isHovered ? 0.35 : 0.25}
        color={isExoplanet ? '#22c55e' : '#ef4444'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {planetData.name || planetData.id}
      </Text>
      
      {/* Planet type indicator */}
      <Text
        position={[0, radius + 0.8, 0]}
        fontSize={0.15}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        {planetType === 'rocky' && 'Rocky Planet'}
        {planetType === 'super-earth' && 'Super-Earth'}
        {planetType === 'gas' && 'Gas Giant'}
        {planetType === 'ice' && 'Ice World'}
      </Text>
      
      {/* Orbital path indicator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planetData.features.distance * 0.5, planetData.features.distance * 0.5 + 0.02, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isHovered ? 0.3 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Enhanced star field component
const EnhancedStarField = ({ isMobile }: { isMobile: boolean }) => {
  const starsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
      starsRef.current.rotation.x += 0.0001;
    }
  });
  
  return (
    <group>
      <Stars
        ref={starsRef}
        radius={150}
        depth={80}
        count={isMobile ? 800 : 1500}
        factor={6}
        saturation={0.2}
        fade
        speed={0.5}
      />
      
      {/* Distant nebula effect */}
      <mesh>
        <sphereGeometry args={[200, 32, 16]} />
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const Scene = ({ planetData, isMobile }: { planetData: PlanetData; isMobile: boolean }) => {
  const { camera } = useThree();
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  
  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.2} color="#ffffff" />
      
      {/* Main star light */}
      <pointLight 
        position={[8, 8, 8]} 
        intensity={1.2} 
        color="#FFF8DC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Secondary fill light */}
      <pointLight 
        position={[-6, -4, 6]} 
        intensity={0.4} 
        color={isExoplanet ? "#22c55e" : "#ef4444"}
      />
      
      {/* Rim light for dramatic effect */}
      <pointLight 
        position={[0, 0, -10]} 
        intensity={0.3} 
        color="#4f46e5"
      />
      
      {/* Directional light for better planet illumination */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
      
      <EnhancedStarField isMobile={isMobile} />
      
      <ProfessionalPlanet planetData={planetData} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={isMobile ? 0.2 : 0.3}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={isMobile ? 0.4 : 0.6}
        zoomSpeed={isMobile ? 0.5 : 1.2}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
      />
    </>
  );
};

export const Professional3DVisualization = ({ planetData }: Professional3DVisualizationProps) => {
  const isMobile = useIsMobile();
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  const planetType = useMemo(() => getPlanetType(planetData), [planetData]);
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate additional planet characteristics
  const characteristics = useMemo(() => {
    const radius = planetData.features.radius;
    const period = planetData.features.period;
    const distance = planetData.features.distance;
    
    // Estimate temperature based on distance (simplified)
    const stellarTemp = 5778; // Sun-like star
    const temperature = Math.round(stellarTemp * Math.sqrt(0.5 / distance));
    
    // Estimate mass based on radius and type
    let mass;
    if (planetType === 'rocky') {
      mass = Math.pow(radius, 3.7); // Rocky planet mass-radius relation
    } else if (planetType === 'super-earth') {
      mass = Math.pow(radius, 2.8);
    } else {
      mass = Math.pow(radius, 1.8); // Gas giant relation
    }
    
    // Habitability score
    const habitabilityZone = distance >= 0.8 && distance <= 1.5;
    const sizeScore = radius >= 0.5 && radius <= 2.0;
    const habitability = (habitabilityZone && sizeScore && planetType !== 'gas') ? 'Potentially Habitable' : 'Not Habitable';
    
    return {
      temperature,
      mass: mass.toFixed(2),
      habitability,
      density: (mass / Math.pow(radius, 3)).toFixed(2)
    };
  }, [planetData, planetType]);
  
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
        shadows
      >
        <Scene planetData={planetData} isMobile={isMobile} />
      </Canvas>
      
      {/* Enhanced status indicator */}
      <motion.div 
        className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`${isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-full font-semibold backdrop-blur-md border ${
          isExoplanet 
            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isExoplanet ? 'bg-green-400' : 'bg-red-400'}`} />
            {isMobile 
              ? (isExoplanet ? 'Exoplaneta' : 'Falso Positivo')
              : (isExoplanet ? 'Exoplaneta Confirmado' : 'Falso Positivo')
            }
          </div>
        </div>
      </motion.div>
      
      {/* Controls hint */}
      {!isMobile && (
        <motion.div 
          className="absolute top-4 left-4 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="glass-panel px-3 py-2 rounded-lg text-xs text-muted-foreground">
            <div className="space-y-1">
              <div>🖱️ Drag to rotate</div>
              <div>🔍 Scroll to zoom</div>
              <div>👆 Hover planet for details</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Enhanced planet info overlay */}
      <motion.div 
        className={`absolute ${isMobile ? 'bottom-2 left-2 right-2' : 'bottom-4 left-4 right-4'} z-10`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`glass-panel ${isMobile ? 'p-3' : 'p-4'} rounded-lg backdrop-blur-md border border-white/10`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-bold ${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>
              {planetData.name || planetData.id}
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-primary/20 hover:bg-primary/30 rounded-md transition-colors`}
            >
              {showDetails ? 'Less' : 'More'}
            </button>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-foreground">
                  {planetType === 'rocky' && 'Rocky Planet'}
                  {planetType === 'super-earth' && 'Super-Earth'}
                  {planetType === 'gas' && 'Gas Giant'}
                  {planetType === 'ice' && 'Ice World'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Radius:</span>
                <span className="font-medium text-foreground">{planetData.features.radius.toFixed(2)} R⊕</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium text-foreground">{planetData.features.period.toFixed(1)} days</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium text-foreground">{planetData.features.distance.toFixed(2)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Probability:</span>
                <span className={`font-medium ${isExoplanet ? 'text-green-400' : 'text-red-400'}`}>
                  {((planetData.probability ?? 0.5) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Mass:</span>
                <span className="font-medium text-foreground">{characteristics.mass} M⊕</span>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Temperature:</span>
                      <span className="font-medium text-foreground">{characteristics.temperature}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Density:</span>
                      <span className="font-medium text-foreground">{characteristics.density} g/cm³</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Habitability:</span>
                      <span className={`font-medium text-xs ${
                        characteristics.habitability === 'Potentially Habitable' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {characteristics.habitability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discovery Method:</span>
                      <span className="font-medium text-foreground">Transit</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};