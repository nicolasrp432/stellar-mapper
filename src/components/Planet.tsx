import { useRef, useMemo, useState } from 'react';
import { Mesh, Group, Vector3, CanvasTexture } from 'three';
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
}

// Function to create procedural planet texture
const createPlanetTexture = (type: 'rocky' | 'gas' | 'ice', color: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Create gradient based on planet type
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  
  switch (type) {
    case 'rocky':
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(0.3, '#CD853F');
      gradient.addColorStop(0.6, '#D2691E');
      gradient.addColorStop(1, '#A0522D');
      break;
    case 'gas':
      gradient.addColorStop(0, '#FFE4B5');
      gradient.addColorStop(0.2, '#DEB887');
      gradient.addColorStop(0.5, '#F4A460');
      gradient.addColorStop(0.8, '#D2691E');
      gradient.addColorStop(1, '#CD853F');
      break;
    case 'ice':
      gradient.addColorStop(0, '#E0FFFF');
      gradient.addColorStop(0.3, '#B0E0E6');
      gradient.addColorStop(0.6, '#87CEEB');
      gradient.addColorStop(1, '#4682B4');
      break;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);

  // Add surface details
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const size = Math.random() * 20 + 5;
    
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = type === 'gas' ? '#8B4513' : '#696969';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add atmospheric bands for gas giants
  if (type === 'gas') {
    for (let i = 0; i < 8; i++) {
      const y = (i / 8) * 256;
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = i % 2 === 0 ? '#DEB887' : '#CD853F';
      ctx.fillRect(0, y, 512, 32);
    }
  }

  return new CanvasTexture(canvas);
};

// Determine planet type based on properties
const getPlanetType = (planet: PlanetData): 'rocky' | 'gas' | 'ice' => {
  if (planet.features.radius > 2) return 'gas'; // Large planets are gas giants
  if (planet.features.distance > 5) return 'ice'; // Far planets are ice worlds
  return 'rocky'; // Default to rocky
};

export const Planet = ({ planet }: PlanetProps) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const { setHoveredPlanet, selectPlanet, hoveredPlanet } = usePlanetsStore();
  const [isHovered, setIsHovered] = useState(false);

  const radius = scaleRadius(planet.features.radius);
  const distance = scaleDistance(planet.features.distance);
  const angularVelocity = scalePeriod(planet.features.period);
  const color = getProbabilityColor(planet.probability);

  // Determine planet type and create texture
  const planetType = useMemo(() => getPlanetType(planet), [planet]);
  const planetTexture = useMemo(() => createPlanetTexture(planetType, color), [planetType, color]);

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
          <meshStandardMaterial
            map={planetTexture}
            color={color}
            emissive={color}
            emissiveIntensity={0.05}
            roughness={planetType === 'ice' ? 0.1 : 0.8}
            metalness={planetType === 'rocky' ? 0.3 : 0.1}
          />
        </mesh>

        {/* Atmosphere for gas giants */}
        {planetType === 'gas' && (
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
        {isHovered && (
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
        {planetType === 'gas' && planet.features.radius > 2.5 && (
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
