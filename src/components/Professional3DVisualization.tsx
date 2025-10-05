import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '@/types/exoplanet';

interface Professional3DVisualizationProps {
  planetData: PlanetData;
}

// Componente para asteroides/rocas (falsos positivos)
const AsteroidObject = ({ planetData }: { planetData: PlanetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const size = Math.max(0.4, Math.min(1.2, planetData.features.radius * 0.2));
  
  // Crear textura detallada para asteroide
  const asteroidTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Función de ruido para asteroides
    const noise = (x: number, y: number, scale: number = 1) => {
      return (Math.sin(x * scale) + Math.cos(y * scale) + Math.sin((x + y) * scale * 0.5)) / 3;
    };
    
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;
    
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const index = (y * 512 + x) * 4;
        
        // Múltiples capas de ruido para superficie rugosa
        const baseNoise = noise(x * 0.02, y * 0.02) * 0.5 + 0.5;
        const detailNoise = noise(x * 0.08, y * 0.08) * 0.3 + 0.7;
        const craterNoise = noise(x * 0.15, y * 0.15) * 0.2 + 0.8;
        
        // Base rocosa gris-marrón
        let r = 80 + baseNoise * 60;
        let g = 60 + baseNoise * 40;
        let b = 40 + baseNoise * 30;
        
        // Añadir variaciones de superficie
        r *= detailNoise;
        g *= detailNoise;
        b *= detailNoise;
        
        // Cráteres y depresiones
        if (craterNoise < 0.7) {
          const craterDepth = (0.7 - craterNoise) * 2;
          r *= (1 - craterDepth * 0.4);
          g *= (1 - craterDepth * 0.4);
          b *= (1 - craterDepth * 0.4);
        }
        
        // Añadir manchas de mineral
        if (Math.random() < 0.1) {
          const metallic = Math.random() * 0.3;
          r += metallic * 100;
          g += metallic * 80;
          b += metallic * 60;
        }
        
        data[index] = Math.min(255, Math.max(0, Math.floor(r)));
        data[index + 1] = Math.min(255, Math.max(0, Math.floor(g)));
        data[index + 2] = Math.min(255, Math.max(0, Math.floor(b)));
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008;
      meshRef.current.rotation.y += 0.012;
      meshRef.current.rotation.z += 0.005;
    }
  });
  
  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        scale={isHovered ? 1.15 : 1}
      >
        {/* Forma irregular para asteroide */}
        <dodecahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          map={asteroidTexture}
          roughness={0.95}
          metalness={0.05}
          color="#654321"
        />
      </mesh>
      
      {/* Información del objeto */}
      <Html position={[0, size + 0.8, 0]} center>
        <div className="bg-red-900/90 text-red-100 px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-red-700/50">
          <div className="text-center">
            <div className="font-bold">Falso Positivo</div>
            <div className="text-xs mt-1 opacity-80">Asteroide o Roca Espacial</div>
            <div className="text-xs mt-2 space-y-1">
              <div>Probabilidad: {Math.round((planetData.probability || 0) * 100)}%</div>
              <div>Tamaño: {planetData.features.radius.toFixed(1)} R⊕</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Componente para exoplanetas (detallado)
const ExoplanetObject = ({ planetData }: { planetData: PlanetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Determinar tipo de planeta
  const planetType = useMemo(() => {
    const r = planetData.features.radius;
    const d = planetData.features.distance;
    
    if (r < 1.25) return 'rocky';
    if (r < 2) return 'super-earth';
    if (d > 5 || r < 4) return 'ice';
    return 'gas';
  }, [planetData]);
  
  // Tamaño más realista según el tipo de planeta
  const radius = useMemo(() => {
    const baseRadius = planetData.features.radius * 0.3;
    switch (planetType) {
      case 'rocky':
        return Math.max(0.5, Math.min(1.8, baseRadius));
      case 'super-earth':
        return Math.max(0.8, Math.min(2.2, baseRadius * 1.2));
      case 'gas':
        return Math.max(1.5, Math.min(3.5, baseRadius * 1.8));
      case 'ice':
        return Math.max(0.4, Math.min(1.5, baseRadius * 0.9));
      default:
        return Math.max(0.6, Math.min(2.5, baseRadius));
    }
  }, [planetData.features.radius, planetType]);
  
  // Crear texturas detalladas del planeta
  const { planetTexture, normalMap, cloudTexture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Función de ruido mejorada para más realismo
    const noise = (x: number, y: number, scale: number = 1, octaves: number = 4) => {
      let value = 0;
      let amplitude = 1;
      let frequency = scale;
      
      for (let i = 0; i < octaves; i++) {
        value += Math.sin(x * frequency) * Math.cos(y * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      return (value + 1) * 0.5; // Normalizar a 0-1
    };
    
    const imageData = ctx.createImageData(1024, 512);
    const data = imageData.data;
    
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const index = (y * 1024 + x) * 4;
        
        // Múltiples capas de ruido para más detalle
        const baseNoise = noise(x * 0.01, y * 0.01, 1, 4);
        const detailNoise = noise(x * 0.05, y * 0.05, 1, 2);
        const microNoise = noise(x * 0.1, y * 0.1, 1, 1);
        
        let r, g, b;
        
        switch (planetType) {
          case 'rocky':
            // Planeta rocoso tipo Tierra con continentes y océanos detallados
            const elevation = baseNoise * 0.7 + detailNoise * 0.2 + microNoise * 0.1;
            const latitude = Math.abs((y - 256) / 256); // Factor de latitud para casquetes polares
            
            if (elevation > 0.55) {
              // Continentes con variación por altura
              if (elevation > 0.8) {
                // Montañas nevadas
                r = Math.floor(200 + elevation * 55);
                g = Math.floor(200 + elevation * 55);
                b = Math.floor(220 + elevation * 35);
              } else if (elevation > 0.7) {
                // Montañas rocosas
                r = Math.floor(120 + elevation * 80);
                g = Math.floor(100 + elevation * 60);
                b = Math.floor(80 + elevation * 40);
              } else {
                // Llanuras y bosques
                r = Math.floor(80 + elevation * 60);
                g = Math.floor(120 + elevation * 80);
                b = Math.floor(40 + elevation * 40);
              }
            } else {
              // Océanos con variación de profundidad
              const depth = 1 - elevation;
              r = Math.floor(20 + depth * 40);
              g = Math.floor(80 + depth * 100);
              b = Math.floor(150 + depth * 105);
            }
            
            // Casquetes polares
            if (latitude > 0.8) {
              const iceIntensity = (latitude - 0.8) * 5;
              r = Math.floor(r * (1 - iceIntensity) + 240 * iceIntensity);
              g = Math.floor(g * (1 - iceIntensity) + 248 * iceIntensity);
              b = Math.floor(b * (1 - iceIntensity) + 255 * iceIntensity);
            }
            break;
            
          case 'super-earth':
            // Super-Tierra con terrenos más extremos
            const superElevation = baseNoise * 0.6 + detailNoise * 0.3 + microNoise * 0.1;
            
            if (superElevation > 0.7) {
              // Mesetas altas y cañones
              r = Math.floor(150 + superElevation * 80);
              g = Math.floor(100 + superElevation * 60);
              b = Math.floor(60 + superElevation * 40);
            } else if (superElevation > 0.4) {
              // Desiertos y llanuras
              r = Math.floor(180 + superElevation * 60);
              g = Math.floor(140 + superElevation * 80);
              b = Math.floor(80 + superElevation * 60);
            } else {
              // Lagos y mares internos
              r = Math.floor(60 + superElevation * 80);
              g = Math.floor(120 + superElevation * 100);
              b = Math.floor(180 + superElevation * 75);
            }
            break;
            
          case 'gas':
            // Gigante gaseoso con bandas atmosféricas complejas
            const bandY = Math.sin(y * 0.02) * 0.5 + 0.5;
            const turbulence = noise(x * 0.03, y * 0.08, 1, 3);
            const storm = noise(x * 0.1, y * 0.1, 1, 2);
            
            // Diferentes bandas atmosféricas
            if (bandY > 0.8) {
              // Banda polar
              r = Math.floor((180 + turbulence * 75) * (0.9 + storm * 0.1));
              g = Math.floor((160 + turbulence * 60) * (0.8 + storm * 0.2));
              b = Math.floor((140 + turbulence * 50) * (0.7 + storm * 0.3));
            } else if (bandY > 0.6) {
              // Banda templada
              r = Math.floor((220 + turbulence * 35) * (0.8 + storm * 0.2));
              g = Math.floor((180 + turbulence * 50) * (0.7 + storm * 0.3));
              b = Math.floor((120 + turbulence * 60) * (0.6 + storm * 0.4));
            } else if (bandY > 0.4) {
              // Banda ecuatorial
              r = Math.floor((255 * (0.9 + turbulence * 0.1)) * (0.9 + storm * 0.1));
              g = Math.floor((200 + turbulence * 55) * (0.8 + storm * 0.2));
              b = Math.floor((150 + turbulence * 70) * (0.7 + storm * 0.3));
            } else {
              // Banda sur
              r = Math.floor((200 + turbulence * 55) * (0.8 + storm * 0.2));
              g = Math.floor((150 + turbulence * 70) * (0.7 + storm * 0.3));
              b = Math.floor((100 + turbulence * 80) * (0.6 + storm * 0.4));
            }
            
            // Tormentas grandes (manchas)
            if (storm > 0.8) {
              const stormIntensity = (storm - 0.8) * 5;
              r = Math.floor(r * (1 - stormIntensity * 0.3) + 255 * stormIntensity * 0.3);
              g = Math.floor(g * (1 - stormIntensity * 0.2) + 100 * stormIntensity * 0.2);
              b = Math.floor(b * (1 - stormIntensity * 0.1) + 50 * stormIntensity * 0.1);
            }
            break;
            
          case 'ice':
            // Mundo helado con grietas y variaciones
            const iceNoise = baseNoise * 0.5 + detailNoise * 0.3 + microNoise * 0.2;
            const cracks = noise(x * 0.08, y * 0.08, 1, 2);
            
            // Base helada
            r = Math.floor(220 + iceNoise * 35);
            g = Math.floor(240 + iceNoise * 15);
            b = Math.floor(255);
            
            // Grietas y fisuras
            if (cracks > 0.7) {
              const crackDepth = (cracks - 0.7) * 3.33;
              r = Math.floor(r * (1 - crackDepth * 0.4) + 100 * crackDepth * 0.4);
              g = Math.floor(g * (1 - crackDepth * 0.3) + 150 * crackDepth * 0.3);
              b = Math.floor(b * (1 - crackDepth * 0.2) + 200 * crackDepth * 0.2);
            }
            
            // Regiones más cálidas (azul claro)
            if (iceNoise < 0.3) {
              const warmth = (0.3 - iceNoise) * 3.33;
              r = Math.floor(r * (1 - warmth * 0.2) + 180 * warmth * 0.2);
              g = Math.floor(g * (1 - warmth * 0.1) + 220 * warmth * 0.1);
              b = Math.floor(b); // Mantener el azul
            }
            break;
        }
        
        data[index] = Math.min(255, Math.max(0, r));
        data[index + 1] = Math.min(255, Math.max(0, g));
        data[index + 2] = Math.min(255, Math.max(0, b));
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const planetTexture = new THREE.CanvasTexture(canvas);
    planetTexture.wrapS = planetTexture.wrapT = THREE.RepeatWrapping;
    
    // Crear mapa normal para relieve
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 512;
    normalCanvas.height = 256;
    const normalCtx = normalCanvas.getContext('2d')!;
    const normalImageData = normalCtx.createImageData(512, 256);
    const normalData = normalImageData.data;
    
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 512; x++) {
        const index = (y * 512 + x) * 4;
        const height = noise(x * 0.02, y * 0.02, 1, 3);
        
        // Calcular normales para el relieve
        const strength = planetType === 'rocky' || planetType === 'super-earth' ? 2.0 : 0.5;
        normalData[index] = Math.floor((height * strength + 0.5) * 255);
        normalData[index + 1] = Math.floor((height * strength + 0.5) * 255);
        normalData[index + 2] = 255;
        normalData[index + 3] = 255;
      }
    }
    
    normalCtx.putImageData(normalImageData, 0, 0);
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    
    // Crear textura de nubes para planetas rocosos
    let cloudTexture = null;
    if (planetType === 'rocky' || planetType === 'super-earth') {
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 512;
      cloudCanvas.height = 256;
      const cloudCtx = cloudCanvas.getContext('2d')!;
      const cloudImageData = cloudCtx.createImageData(512, 256);
      const cloudData = cloudImageData.data;
      
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 512; x++) {
          const index = (y * 512 + x) * 4;
          const cloudNoise = noise(x * 0.03, y * 0.03, 1, 3);
          const cloudDensity = cloudNoise > 0.6 ? (cloudNoise - 0.6) * 2.5 : 0;
          
          cloudData[index] = 255;
          cloudData[index + 1] = 255;
          cloudData[index + 2] = 255;
          cloudData[index + 3] = Math.floor(cloudDensity * 180);
        }
      }
      
      cloudCtx.putImageData(cloudImageData, 0, 0);
      cloudTexture = new THREE.CanvasTexture(cloudCanvas);
      cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
    }
    
    return { planetTexture, normalMap, cloudTexture };
  }, [planetType]);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.003;
    }
  });
  
  const getTypeDescription = () => {
    switch (planetType) {
      case 'rocky': return 'Planeta Rocoso';
      case 'super-earth': return 'Super-Tierra';
      case 'gas': return 'Gigante Gaseoso';
      case 'ice': return 'Mundo Helado';
      default: return 'Exoplaneta';
    }
  };
  
  return (
    <group>
      {/* Planeta principal */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        scale={isHovered ? 1.05 : 1}
      >
        <sphereGeometry args={[radius, planetType === 'gas' ? 32 : 128, planetType === 'gas' ? 16 : 64]} />
        <meshStandardMaterial
          map={planetTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(
            planetType === 'rocky' || planetType === 'super-earth' ? 1.5 : 
            planetType === 'ice' ? 0.8 : 0.3,
            planetType === 'rocky' || planetType === 'super-earth' ? 1.5 : 
            planetType === 'ice' ? 0.8 : 0.3
          )}
          roughness={
            planetType === 'ice' ? 0.1 : 
            planetType === 'gas' ? 0.9 : 
            planetType === 'rocky' ? 0.8 : 0.7
          }
          metalness={
            planetType === 'ice' ? 0.05 : 
            planetType === 'gas' ? 0.0 : 
            planetType === 'super-earth' ? 0.2 : 0.1
          }
          emissive={planetType === 'gas' ? '#FF4500' : '#000000'}
          emissiveIntensity={planetType === 'gas' ? 0.1 : 0}
        />
      </mesh>
      
      {/* Capa de nubes para planetas rocosos */}
      {cloudTexture && (planetType === 'rocky' || planetType === 'super-earth') && (
        <mesh scale={1.02}>
          <sphereGeometry args={[radius, 64, 32]} />
          <meshBasicMaterial
            map={cloudTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Atmósfera (para planetas que la tengan) */}
      {(planetType === 'rocky' || planetType === 'super-earth' || planetType === 'gas') && (
        <mesh ref={atmosphereRef} scale={1.05}>
          <sphereGeometry args={[radius, 32, 16]} />
          <meshBasicMaterial
            color={planetType === 'gas' ? '#FFA500' : '#87CEEB'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Anillos detallados para gigantes gaseosos */}
      {planetType === 'gas' && (
        <group>
          {/* Anillo principal */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.4, radius * 2.0, 128]} />
            <meshBasicMaterial
              color="#D2691E"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Anillo secundario */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 2.1, radius * 2.4, 64]} />
            <meshBasicMaterial
              color="#CD853F"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Anillo interno */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.1, radius * 1.35, 64]} />
            <meshBasicMaterial
              color="#F4A460"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* División de Cassini (espacio entre anillos) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 2.0, radius * 2.1, 32]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
      
      {/* Información del planeta */}
      <Html position={[0, radius + 1.2, 0]} center>
        <div className="bg-green-900/90 text-green-100 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border border-green-700/50">
          <div className="text-center">
            <div className="font-bold text-green-300">✓ Exoplaneta Confirmado</div>
            <div className="text-sm mt-1">{getTypeDescription()}</div>
            <div className="text-xs mt-3 space-y-1 text-left">
              <div><span className="font-semibold">Probabilidad:</span> {Math.round((planetData.probability || 0) * 100)}%</div>
              <div><span className="font-semibold">Radio:</span> {planetData.features.radius.toFixed(1)} R⊕</div>
              <div><span className="font-semibold">Período:</span> {planetData.features.period.toFixed(1)} días</div>
              <div><span className="font-semibold">Distancia:</span> {planetData.features.distance.toFixed(1)} UA</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Componente principal de la escena
const Scene = ({ planetData }: { planetData: PlanetData }) => {
  const isExoplanet = planetData.isExoplanet ?? (planetData.probability ?? 0) > 0.5;
  
  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#4169E1" />
      
      {/* Campo de estrellas */}
      <Stars radius={100} depth={50} count={2000} factor={4} fade />
      
      {/* Objeto 3D según el tipo */}
      {isExoplanet ? (
        <ExoplanetObject planetData={planetData} />
      ) : (
        <AsteroidObject planetData={planetData} />
      )}
      
      {/* Controles */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        autoRotate={false}
      />
    </>
  );
};

export const Professional3DVisualization = ({ planetData }: Professional3DVisualizationProps) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Scene planetData={planetData} />
      </Canvas>
      
      {/* Controles de ayuda */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
        <div className="space-y-1">
          <div>🖱️ Clic y arrastra: Rotar</div>
          <div>🔍 Scroll: Zoom</div>
          <div>⚡ Clic derecho: Mover</div>
        </div>
      </div>
    </div>
  );
};