import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Star } from './Star';
import { Planet } from './Planet';
import { Tooltip2D } from './Tooltip2D';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';

export const Scene3D = () => {
  const { planets } = usePlanetsStore();

  return (
    <Canvas
      camera={{ position: [0, 15, 15], fov: 60 }}
      style={{ background: 'transparent' }}
    >
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Background stars */}
      <Stars radius={300} depth={60} count={5000} factor={4} fade speed={0.5} />
      
      {/* Central star */}
      <Star />
      
      {/* Planets */}
      {planets.map((planet) => (
        <Planet key={planet.id} planet={planet} />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minPolarAngle={Math.PI / 2 - 0.3}
      />
      
      {/* Tooltip (must be inside Canvas to use R3F hooks) */}
      <Tooltip2D />
    </Canvas>
  );
};
