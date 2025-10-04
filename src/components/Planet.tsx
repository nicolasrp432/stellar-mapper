import { useRef, useMemo } from 'react';
import { Mesh, Group } from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Line } from '@react-three/drei';
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
  const { setHoveredPlanet, selectPlanet } = usePlanetsStore();

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
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredPlanet(null);
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
      </group>
    </>
  );
};
