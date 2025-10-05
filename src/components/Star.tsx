import { useRef, useMemo } from 'react';
import { Mesh, ShaderMaterial, Vector3, AdditiveBlending, BackSide } from 'three';
import { useFrame } from '@react-three/fiber';

const STAR_RADIUS = 2;

// Custom shader for realistic star surface
const starVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Improved noise functions
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec3 pos = vPosition * 0.5;
    
    // Multiple octaves of noise for realistic surface
    float noise1 = snoise(pos * 2.0 + time * 0.1);
    float noise2 = snoise(pos * 4.0 + time * 0.15) * 0.5;
    float noise3 = snoise(pos * 8.0 + time * 0.2) * 0.25;
    float noise4 = snoise(pos * 16.0 + time * 0.25) * 0.125;
    
    float totalNoise = noise1 + noise2 + noise3 + noise4;
    
    // Create solar flares and hotspots
    float flares = smoothstep(0.4, 1.0, totalNoise);
    float hotspots = smoothstep(0.6, 1.0, totalNoise);
    
    // Fresnel effect for edge glow
    float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    fresnel = pow(fresnel, 2.0);
    
    // Color variations based on temperature
    vec3 coolColor = vec3(1.0, 0.4, 0.1);  // Cooler regions
    vec3 hotColor = vec3(1.0, 0.9, 0.6);   // Hotter regions
    vec3 flareColor = vec3(1.0, 1.0, 0.8); // Solar flares
    
    // Mix colors based on noise
    vec3 surfaceColor = mix(coolColor, hotColor, smoothstep(-0.5, 0.5, totalNoise));
    surfaceColor = mix(surfaceColor, flareColor, flares * 0.7);
    
    // Apply base color tint
    surfaceColor *= color;
    
    // Add fresnel glow
    surfaceColor += fresnel * vec3(1.0, 0.8, 0.4) * 0.3;
    
    // Intensity modulation
    surfaceColor *= intensity * (0.8 + 0.4 * sin(time * 2.0));
    
    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

export const Star = () => {
  const meshRef = useRef<Mesh>(null);
  const innerGlowRef = useRef<Mesh>(null);
  const outerGlowRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);

  // Create custom shader material
  const starMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        time: { value: 0 },
        color: { value: new Vector3(1.0, 0.6, 0.2) }, // Base star color
        intensity: { value: 1.2 }, // Overall brightness
      },
    });
  }, []);

  // Inner glow material (close to surface)
  const innerGlowMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          fresnel = pow(fresnel, 1.5);
          
          // Add some turbulence to the glow
          float turbulence = sin(vPosition.x * 10.0 + time) * sin(vPosition.y * 10.0 + time * 1.1) * 0.1;
          fresnel += turbulence;
          
          vec3 glowColor = vec3(1.0, 0.7, 0.3);
          gl_FragColor = vec4(glowColor, fresnel * 0.8);
        }
      `,
      uniforms: {
        time: { value: 0 }
      },
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true,
    });
  }, []);

  // Outer glow material (atmospheric effect)
  const outerGlowMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 glowColor = vec3(1.0, 0.5, 0.1);
          gl_FragColor = vec4(glowColor, intensity * 0.4);
        }
      `,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true,
    });
  }, []);

  // Corona material (outermost layer)
  const coronaMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.3 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          vec3 coronaColor = vec3(1.0, 0.9, 0.7);
          gl_FragColor = vec4(coronaColor, intensity * 0.2);
        }
      `,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true,
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    if (meshRef.current && starMaterial.uniforms) {
      starMaterial.uniforms.time.value = time;
      
      // Subtle pulsing animation with multiple frequencies
      const pulse = 1 + Math.sin(time * 2) * 0.05 + Math.sin(time * 3.7) * 0.03;
      meshRef.current.scale.setScalar(pulse);
      
      // Slow rotation
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }

    // Update inner glow
    if (innerGlowRef.current && innerGlowMaterial.uniforms) {
      innerGlowMaterial.uniforms.time.value = time;
      innerGlowRef.current.rotation.z += 0.003;
    }

    // Rotate outer glow layers at different speeds
    if (outerGlowRef.current) {
      outerGlowRef.current.rotation.z += 0.002;
      outerGlowRef.current.rotation.x += 0.001;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z -= 0.001;
      coronaRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Main star */}
      <mesh ref={meshRef} material={starMaterial}>
        <sphereGeometry args={[STAR_RADIUS, 64, 64]} />
      </mesh>
      
      {/* Inner glow effect */}
      <mesh ref={innerGlowRef} material={innerGlowMaterial} scale={1.15}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
      </mesh>
      
      {/* Outer glow effect */}
      <mesh ref={outerGlowRef} material={outerGlowMaterial} scale={1.4}>
        <sphereGeometry args={[STAR_RADIUS, 24, 24]} />
      </mesh>
      
      {/* Corona effect */}
      <mesh ref={coronaRef} material={coronaMaterial} scale={2.0}>
        <sphereGeometry args={[STAR_RADIUS, 16, 16]} />
      </mesh>
    </group>
  );
};
