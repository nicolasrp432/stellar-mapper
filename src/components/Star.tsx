import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { STAR_RADIUS } from '@/utils/scale';

export const Star = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      {/* Main star body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[STAR_RADIUS, 64, 64]} />
        <meshStandardMaterial
          emissive="#ff9500"
          emissiveIntensity={2}
          color="#ffc947"
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={1.3}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#ff9500"
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh scale={1.6}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#ff9500"
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {/* Point light for illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        distance={50}
        color="#ffc947"
      />
    </>
  );
};
