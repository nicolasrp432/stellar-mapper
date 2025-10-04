import { useRef, useMemo, useState } from 'react';
import { Mesh, Group } from 'three';
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

export const Planet = ({ planet }: PlanetProps) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { setHoveredPlanet, selectPlanet, hoveredPlanet } = usePlanetsStore();
  const [isHovered, setIsHovered] = useState(false);

  const radius = scaleRadius(planet.features.radius);
  const distance = scaleDistance(planet.features.distance);
  const angularVelocity = scalePeriod(planet.features.period);
  const color = getProbabilityColor(planet.probability);

  // Generate orbit path
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const pos = calculateOrbitalPosition(angle, planet.features.distance);
      points.push(pos);
    }
    return points;
  }, [planet.features.distance]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const angle = clock.elapsedTime * angularVelocity;
      const [x, y, z] = calculateOrbitalPosition(angle, planet.features.distance);
      groupRef.current.position.set(x, y, z);
    }
  });

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
        opacity={0.2}
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
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        
        {/* Planet glow */}
        <mesh scale={1.3}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>

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
