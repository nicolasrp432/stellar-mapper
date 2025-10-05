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
  
  // Crear textura rugosa para asteroide
  const asteroidTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;
    
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const index = (y * 256 + x) * 4;
        const noise = Math.random() * 0.5 + 0.3;
        
        // Colores grises/marrones para asteroide
        data[index] = Math.floor((70 + Math.random() * 50) * noise);     // R
        data[index + 1] = Math.floor((50 + Math.random() * 40) * noise); // G
        data[index + 2] = Math.floor((30 + Math.random() * 30) * noise); // B
        data[index + 3] = 255; // A
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
  
  const radius = Math.max(0.6, Math.min(2.5, planetData.features.radius * 0.3));
  
  // Determinar tipo de planeta
  const planetType = useMemo(() => {
    const r = planetData.features.radius;
    const d = planetData.features.distance;
    
    if (r < 1.25) return 'rocky';
    if (r < 2) return 'super-earth';
    if (d > 5 || r < 4) return 'ice';
    return 'gas';
  }, [planetData]);
  
  // Crear textura del planeta
  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(512, 256);
    const data = imageData.data;
    
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 512; x++) {
        const index = (y * 512 + x) * 4;
        const noise = (Math.sin(x * 0.02) + Math.sin(y * 0.02)) * 0.5 + 0.5;
        
        let r, g, b;
        
        switch (planetType) {
          case 'rocky':
            // Planeta rocoso tipo Tierra
            if (noise > 0.6) {
              // Continentes
              r = Math.floor(139 + noise * 50);
              g = Math.floor(69 + noise * 80);
              b = Math.floor(19 + noise * 30);
            } else {
              // Océanos
              r = Math.floor(30 + noise * 40);
              g = Math.floor(144 + noise * 60);
              b = Math.floor(255 * (0.6 + noise * 0.4));
            }
            break;
            
          case 'super-earth':
            // Super-Tierra con variaciones
            r = Math.floor((100 + noise * 80));
            g = Math.floor((150 + noise * 60));
            b = Math.floor((80 + noise * 100));
            break;
            
          case 'gas':
            // Gigante gaseoso con bandas
            const band = Math.sin(y * 0.1) * 0.5 + 0.5;
            r = Math.floor((255 * (0.8 + band * 0.2)));
            g = Math.floor((200 * (0.7 + band * 0.3)));
            b = Math.floor((150 * (0.6 + band * 0.4)));
            break;
            
          case 'ice':
            // Mundo helado
            r = Math.floor((200 + noise * 55));
            g = Math.floor((230 + noise * 25));
            b = Math.floor((255));
            break;
        }
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
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
        scale={isHovered ? 1.1 : 1}
      >
        <sphereGeometry args={[radius, 64, 32]} />
        <meshStandardMaterial
          map={planetTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
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
      
      {/* Anillos para gigantes gaseosos */}
      {planetType === 'gas' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 2.2, 64]} />
          <meshBasicMaterial
            color="#D2691E"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
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