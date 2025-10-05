import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const StarField = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions and colors
  const [positions, colors] = useMemo(() => {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // Random positions in a large sphere
      const radius = Math.random() * 150 + 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Realistic star colors (white, blue-white, yellow, orange, red)
      const starType = Math.random();
      let r, g, b;
      
      if (starType < 0.1) {
        // Red giants (rare)
        r = 1.0; g = 0.4; b = 0.2;
      } else if (starType < 0.3) {
        // Orange stars
        r = 1.0; g = 0.7; b = 0.4;
      } else if (starType < 0.6) {
        // Yellow stars (like our Sun)
        r = 1.0; g = 1.0; b = 0.8;
      } else if (starType < 0.85) {
        // White stars
        r = 1.0; g = 1.0; b = 1.0;
      } else {
        // Blue-white stars (hot)
        r = 0.8; g = 0.9; b = 1.0;
      }
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    
    return [positions, colors];
  }, []);

  // Animate the star field
  useFrame((state) => {
    if (ref.current) {
      // Very slow rotation for subtle movement
      ref.current.rotation.x = state.clock.elapsedTime * 0.002;
      ref.current.rotation.y = state.clock.elapsedTime * 0.001;
    }
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        size={1.5}
        transparent
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
      <bufferAttribute
        attach="geometry-attributes-color"
        array={colors}
        count={colors.length / 3}
        itemSize={3}
      />
    </Points>
  );
};

const ShootingStars = () => {
  const ref = useRef<THREE.Group>(null);
  const trailsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((star, index) => {
        const speed = 0.3 + index * 0.1;
        star.position.x -= speed;
        star.position.y -= speed * 0.2; // Slight downward trajectory
        
        if (star.position.x < -80) {
          star.position.x = 80 + Math.random() * 20;
          star.position.y = (Math.random() - 0.3) * 60; // Bias towards upper sky
          star.position.z = (Math.random() - 0.5) * 60;
        }
      });
    }
  });

  const shootingStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        <group key={i}>
          {/* Main shooting star */}
          <mesh
            position={[
              Math.random() * 100 - 50,
              (Math.random() - 0.3) * 60,
              (Math.random() - 0.5) * 60
            ]}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          {/* Trail effect */}
          <mesh
            position={[
              Math.random() * 100 - 50 + 2,
              (Math.random() - 0.3) * 60 + 0.4,
              (Math.random() - 0.5) * 60
            ]}
          >
            <cylinderGeometry args={[0.02, 0.08, 3, 8]} />
            <meshBasicMaterial 
              color="#87CEEB" 
              transparent 
              opacity={0.4}
            />
          </mesh>
        </group>
      );
    }
    return stars;
  }, []);

  return <group ref={ref}>{shootingStars}</group>;
};

const NebulaEffect = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current && ref.current.material) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.01;
      const material = ref.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -100]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial
        color="#4B0082"
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const AnimatedStarField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ 
          antialias: false, 
          alpha: true, 
          powerPreference: "low-power",
          stencil: false,
          depth: false
        }}
        performance={{ min: 0.5 }}
      >
        {/* Subtle ambient lighting */}
        <ambientLight intensity={0.1} />
        
        {/* Background nebula effect */}
        <NebulaEffect />
        
        {/* Main star field */}
        <StarField />
        
        {/* Shooting stars */}
        <ShootingStars />
      </Canvas>
    </div>
  );
};