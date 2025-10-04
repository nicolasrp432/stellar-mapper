import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const StarField = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    const colors = new Float32Array(2000 * 3);
    
    for (let i = 0; i < 2000; i++) {
      // Random positions in a sphere
      const radius = Math.random() * 100 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random colors (white to blue-ish)
      const intensity = Math.random() * 0.5 + 0.5;
      colors[i * 3] = intensity; // R
      colors[i * 3 + 1] = intensity; // G
      colors[i * 3 + 2] = Math.min(1, intensity + Math.random() * 0.3); // B (slightly more blue)
    }
    
    return [positions, colors];
  }, []);

  // Animate the star field
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors}>
      <PointMaterial
        size={0.8}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
      />
    </Points>
  );
};

const ShootingStars = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((star, index) => {
        star.position.x -= 0.1 + index * 0.02;
        if (star.position.x < -50) {
          star.position.x = 50;
          star.position.y = (Math.random() - 0.5) * 40;
          star.position.z = (Math.random() - 0.5) * 40;
        }
      });
    }
  });

  const shootingStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <mesh
          key={i}
          position={[
            Math.random() * 100 - 50,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      );
    }
    return stars;
  }, []);

  return <group ref={ref}>{shootingStars}</group>;
};

export const AnimatedStarField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <StarField />
        <ShootingStars />
      </Canvas>
    </div>
  );
};