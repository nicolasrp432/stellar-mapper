import { useRef, useMemo, useState } from 'react';
import { Mesh, Group, Vector3, CanvasTexture, Vector2 } from 'three';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { PlanetData } from '@/types/exoplanet';
import {
  scaleRadius,
  scaleDistance,
  scalePeriod,
  getProbabilityColor,
  calculateOrbitalPosition,
} from '@/utils/scale';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';

interface PlanetProps {
  planet: PlanetData;
  paused?: boolean;
  simplified?: boolean;
}

// Enhanced function to create realistic planet textures
const createPlanetTexture = (type: 'rocky' | 'gas' | 'ice', color: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Noise function for realistic surface patterns
  const noise = (x: number, y: number, scale: number = 1) => {
    const nx = x * scale;
    const ny = y * scale;
    return (Math.sin(nx * 0.1) + Math.sin(ny * 0.1) + Math.sin((nx + ny) * 0.05)) / 3;
  };

  // Create base texture based on planet type
  const imageData = ctx.createImageData(1024, 512);
  const data = imageData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const index = (y * 1024 + x) * 4;
      const noiseValue = noise(x, y, 0.01) * 0.5 + 0.5;
      const detailNoise = noise(x, y, 0.05) * 0.3 + 0.7;
      const fineNoise = noise(x, y, 0.1) * 0.2 + 0.8;
      
      let r, g, b;
      
      switch (type) {
        case 'rocky':
          // Earth-like rocky planet with continents and oceans
          if (noiseValue > 0.6) {
            // Land masses - browns and greens
            r = Math.floor((139 + noiseValue * 50) * detailNoise);
            g = Math.floor((69 + noiseValue * 80) * detailNoise);
            b = Math.floor((19 + noiseValue * 30) * detailNoise);
          } else if (noiseValue > 0.4) {
            // Coastal areas - sandy colors
            r = Math.floor((194 + noiseValue * 30) * detailNoise);
            g = Math.floor((178 + noiseValue * 40) * detailNoise);
            b = Math.floor((128 + noiseValue * 20) * detailNoise);
          } else {
            // Ocean areas - blues
            r = Math.floor((30 + noiseValue * 40) * detailNoise);
            g = Math.floor((144 + noiseValue * 60) * detailNoise);
            b = Math.floor((255 * (0.6 + noiseValue * 0.4)) * detailNoise);
          }
          break;
          
        case 'gas':
          // Jupiter-like gas giant with bands
          const bandY = Math.sin(y * 0.02) * 0.5 + 0.5;
          const bandPattern = Math.sin(y * 0.1 + x * 0.001) * 0.3 + 0.7;
          
          if (bandY > 0.7) {
            // Light bands - cream/yellow
            r = Math.floor((255 * (0.9 + noiseValue * 0.1)) * bandPattern);
            g = Math.floor((228 * (0.8 + noiseValue * 0.2)) * bandPattern);
            b = Math.floor((181 * (0.7 + noiseValue * 0.3)) * bandPattern);
          } else if (bandY > 0.3) {
            // Medium bands - orange/brown
            r = Math.floor((222 * (0.8 + noiseValue * 0.2)) * bandPattern);
            g = Math.floor((184 * (0.7 + noiseValue * 0.3)) * bandPattern);
            b = Math.floor((135 * (0.6 + noiseValue * 0.4)) * bandPattern);
          } else {
            // Dark bands - deep brown/red
            r = Math.floor((139 * (0.6 + noiseValue * 0.4)) * bandPattern);
            g = Math.floor((69 * (0.5 + noiseValue * 0.5)) * bandPattern);
            b = Math.floor((19 * (0.4 + noiseValue * 0.6)) * bandPattern);
          }
          break;
          
        case 'ice':
          // Europa-like ice world with cracks
          const crackPattern = Math.abs(noise(x, y, 0.02)) > 0.3 ? 0.3 : 1.0;
          r = Math.floor((224 + noiseValue * 31) * crackPattern * fineNoise);
          g = Math.floor((255 * (0.9 + noiseValue * 0.1)) * crackPattern * fineNoise);
          b = Math.floor((255 * (0.95 + noiseValue * 0.05)) * crackPattern * fineNoise);
          break;
          
        default:
          r = g = b = 128;
      }
      
      data[index] = Math.min(255, Math.max(0, r));
      data[index + 1] = Math.min(255, Math.max(0, g));
      data[index + 2] = Math.min(255, Math.max(0, b));
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add additional surface features
  ctx.globalCompositeOperation = 'overlay';
  
  if (type === 'rocky') {
    // Add cloud patterns
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = Math.random() * 100 + 50;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
  } else if (type === 'gas') {
    // Add storm systems
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = Math.random() * 80 + 40;
      
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'ice') {
    // Add ice crack details
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 1024, Math.random() * 512);
      ctx.lineTo(Math.random() * 1024, Math.random() * 512);
      ctx.stroke();
    }
  }

  return new CanvasTexture(canvas);
};

// Function to create normal maps for surface detail
const createNormalMap = (type: 'rocky' | 'gas' | 'ice') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(512, 256);
  const data = imageData.data;

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      const index = (y * 512 + x) * 4;
      
      // Generate height map based on noise
      const height = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 0.5 + 0.5;
      const detail = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.2;
      
      // Calculate normal from height differences
      const heightL = Math.sin((x - 1) * 0.02) * Math.cos(y * 0.02) * 0.5 + 0.5;
      const heightR = Math.sin((x + 1) * 0.02) * Math.cos(y * 0.02) * 0.5 + 0.5;
      const heightU = Math.sin(x * 0.02) * Math.cos((y - 1) * 0.02) * 0.5 + 0.5;
      const heightD = Math.sin(x * 0.02) * Math.cos((y + 1) * 0.02) * 0.5 + 0.5;
      
      const normalX = (heightL - heightR) * 0.5 + 0.5;
      const normalY = (heightU - heightD) * 0.5 + 0.5;
      const normalZ = 0.8; // Pointing mostly outward
      
      data[index] = Math.floor(normalX * 255);     // Red = X normal
      data[index + 1] = Math.floor(normalY * 255); // Green = Y normal  
      data[index + 2] = Math.floor(normalZ * 255); // Blue = Z normal
      data[index + 3] = 255;                       // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new CanvasTexture(canvas);
};

// Determine planet type based on properties
const getPlanetType = (planet: PlanetData): 'rocky' | 'gas' | 'ice' => {
  if (planet.features.radius > 2) return 'gas'; // Large planets are gas giants
  if (planet.features.distance > 5) return 'ice'; // Far planets are ice worlds
  return 'rocky'; // Default to rocky
};

export const Planet = ({ planet, paused = false, simplified = false }: PlanetProps) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const { setHoveredPlanet, selectPlanet, hoveredPlanet } = usePlanetsStore();
  const [isHovered, setIsHovered] = useState(false);

  const radius = scaleRadius(planet.features.radius);
  const distance = scaleDistance(planet.features.distance);
  const angularVelocity = scalePeriod(planet.features.period);
  const color = planet.isExoplanet !== undefined
    ? (planet.isExoplanet ? '#22c55e' : '#f87171')
    : getProbabilityColor(planet.probability);

  // Determine planet type and create texture
  const planetType = useMemo(() => getPlanetType(planet), [planet]);
  const planetTexture = useMemo(() => createPlanetTexture(planetType, color), [planetType, color]);

  const normalMap = useMemo(() => {
    return createNormalMap(planetType);
  }, [planetType]);

  // Generate orbit path with slight ellipse
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const eccentricity = 0.1; // Slight elliptical orbit
    
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const basePos = calculateOrbitalPosition(angle, planet.features.distance);
      const [x, y, z] = basePos;
      
      // Apply elliptical distortion
      const ellipticalX = x * (1 + eccentricity * Math.cos(angle));
      const ellipticalZ = z * (1 - eccentricity * Math.cos(angle));
      
      points.push([ellipticalX, y, ellipticalZ]);
    }
    return points;
  }, [planet.features.distance]);

  useFrame(({ clock }) => {
    if (paused) return;
    if (groupRef.current) {
      const angle = clock.elapsedTime * angularVelocity;
      const [x, y, z] = calculateOrbitalPosition(angle, planet.features.distance);
      groupRef.current.position.set(x, y, z);
      
      // Different rotation speeds based on planet type
      const rotationSpeed = planetType === 'gas' ? 3 : 1.5;
      if (meshRef.current) {
        meshRef.current.rotation.y = clock.elapsedTime * rotationSpeed;
        // Slight axial tilt
        meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.1;
      }
    }

    // Animate atmosphere for gas giants
    if (atmosphereRef.current && planetType === 'gas') {
      atmosphereRef.current.rotation.y = clock.elapsedTime * 0.5;
    }
  });

  const getAtmosphereColor = () => {
    switch (planetType) {
      case 'gas': return '#FFE4B5';
      case 'ice': return '#B0E0E6';
      default: return '#D2691E';
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredPlanet(planet);
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredPlanet(null);
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectPlanet(planet);
  };

  return (
    <>
      {/* Orbital path */}
      <Line
        points={orbitPoints}
        color="#ffffff"
        opacity={isHovered ? 0.6 : 0.2}
        transparent
        lineWidth={1}
      />
      
      {/* Planet */}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          scale={isHovered ? 1.2 : 1}
        >
          <sphereGeometry args={[radius, 64, 32]} />
          {simplified ? (
            <meshStandardMaterial
              color={color}
              roughness={0.8}
              metalness={0.0}
            />
          ) : (
            <meshStandardMaterial
              map={planetTexture}
              normalMap={normalMap}
              normalScale={new THREE.Vector2(planetType === 'rocky' ? 1.5 : 0.8, planetType === 'rocky' ? 1.5 : 0.8)}
              color={color}
              emissive={color}
              emissiveIntensity={planetType === 'gas' ? 0.1 : 0.05}
              roughness={planetType === 'ice' ? 0.1 : planetType === 'gas' ? 0.9 : 0.7}
              metalness={planetType === 'rocky' ? 0.4 : planetType === 'ice' ? 0.2 : 0.05}
              envMapIntensity={planetType === 'ice' ? 1.5 : 0.8}
              bumpScale={planetType === 'rocky' ? 0.02 : 0.01}
            />
          )}
        </mesh>

        {/* Atmosphere for gas giants */}
        {!simplified && planetType === 'gas' && (
          <mesh
            ref={atmosphereRef}
            scale={isHovered ? 1.35 : 1.15}
          >
            <sphereGeometry args={[radius, 32, 16]} />
            <meshBasicMaterial
              color={getAtmosphereColor()}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
        )}
        
        {/* Enhanced glow effect */}
        {!simplified && isHovered && (
          <>
            <mesh scale={1.4}>
              <sphereGeometry args={[radius, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                depthWrite={false}
              />
            </mesh>
            
            {/* Outer glow ring */}
            <mesh scale={1.8}>
              <sphereGeometry args={[radius, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.1}
                depthWrite={false}
              />
            </mesh>
          </>
        )}

        {/* Ring system for some gas giants */}
        {!simplified && planetType === 'gas' && planet.features.radius > 2.5 && (
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[radius * 1.5, radius * 2.2, 32]} />
            <meshBasicMaterial
              color="#8B7355"
              transparent
              opacity={0.4}
              side={2}
            />
          </mesh>
        )}

        {/* Tooltip */}
        {isHovered && hoveredPlanet?.id === planet.id && (
          <Html
            position={[0, radius * 2, 0]}
            center
            distanceFactor={10}
            style={{ pointerEvents: 'none' }}
          >
            <div className="glass-panel px-4 py-3 rounded-lg max-w-xs animate-fade-in">
              <div className="space-y-1">
                <div className="font-semibold text-foreground whitespace-nowrap">
                  {planet.name || planet.id}
                </div>
                {planet.probability !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    Probability: {(planet.probability * 100).toFixed(1)}%
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Radius: {planet.features.radius.toFixed(2)} R⊕</div>
                  <div>Period: {planet.features.period.toFixed(1)} days</div>
                  <div>Distance: {planet.features.distance.toFixed(1)} AU</div>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};
