import { useRef, useMemo } from 'react';
import { Mesh, ShaderMaterial, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { STAR_RADIUS } from '@/utils/scale';

// Custom shader for realistic star surface
const starVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Noise function
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
  }
  
  void main() {
    vec3 pos = vPosition * 2.0 + time * 0.1;
    
    // Create turbulent surface pattern
    float n1 = noise(pos);
    float n2 = noise(pos * 2.0 + time * 0.2);
    float n3 = noise(pos * 4.0 + time * 0.3);
    
    float turbulence = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Mix colors based on turbulence and UV coordinates
    vec3 finalColor = mix(color1, color2, turbulence);
    finalColor = mix(finalColor, color3, sin(vUv.y * 3.14159) * 0.3);
    
    // Add brightness variation
    float brightness = 0.8 + turbulence * 0.4;
    finalColor *= brightness;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const Star = () => {
  const meshRef = useRef<Mesh>(null);
  const glowRef1 = useRef<Mesh>(null);
  const glowRef2 = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);

  // Custom shader material for realistic star surface
  const starMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        time: { value: 0 },
        color1: { value: new Vector3(1.0, 0.4, 0.1) }, // Deep orange
        color2: { value: new Vector3(1.0, 0.8, 0.2) }, // Bright yellow
        color3: { value: new Vector3(1.0, 0.9, 0.7) }, // White-yellow
      },
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    if (meshRef.current) {
      // Gentle pulsing effect with more variation
      const scale = 1 + Math.sin(time * 0.5) * 0.03 + Math.sin(time * 1.2) * 0.02;
      meshRef.current.scale.setScalar(scale);
      
      // Slow rotation
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }

    // Update shader time
    if (starMaterial.uniforms.time) {
      starMaterial.uniforms.time.value = time;
    }

    // Animate glow layers
    if (glowRef1.current) {
      glowRef1.current.rotation.z = time * 0.2;
      const glowScale = 1.3 + Math.sin(time * 0.8) * 0.05;
      glowRef1.current.scale.setScalar(glowScale);
    }

    if (glowRef2.current) {
      glowRef2.current.rotation.z = -time * 0.15;
      const glowScale = 1.6 + Math.sin(time * 0.6) * 0.08;
      glowRef2.current.scale.setScalar(glowScale);
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z = time * 0.05;
      const coronaScale = 2.0 + Math.sin(time * 0.3) * 0.1;
      coronaRef.current.scale.setScalar(coronaScale);
    }
  });

  return (
    <>
      {/* Main star body with custom shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[STAR_RADIUS, 64, 64]} />
        <primitive object={starMaterial} />
      </mesh>
      
      {/* Inner glow layer */}
      <mesh ref={glowRef1} scale={1.3}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Middle glow layer */}
      <mesh ref={glowRef2} scale={1.6}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#ff9500"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Outer corona */}
      <mesh ref={coronaRef} scale={2.0}>
        <sphereGeometry args={[STAR_RADIUS, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced point light for illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        distance={60}
        color="#ffc947"
        decay={2}
      />
      
      {/* Additional ambient light for star */}
      <pointLight
        position={[0, 0, 0]}
        intensity={1}
        distance={30}
        color="#ff7700"
        decay={1}
      />
    </>
  );
};
