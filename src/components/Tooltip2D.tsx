import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanetData } from '@/types/exoplanet';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { scaleDistance } from '@/utils/scale';

export const Tooltip2D = () => {
  const { hoveredPlanet } = usePlanetsStore();
  const { camera, gl } = useThree();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!hoveredPlanet) return;

    const updatePosition = () => {
      const planet = hoveredPlanet;
      const distance = scaleDistance(planet.features.distance);
      
      // Calculate current orbital position (approximate)
      const angle = Date.now() * 0.001 * (2 * Math.PI / (planet.features.period * 0.05));
      const worldPos = {
        x: Math.cos(angle) * distance,
        y: 0,
        z: Math.sin(angle) * distance,
      };

      // Project 3D position to 2D screen space
      const vector = camera.localToWorld(
        { x: worldPos.x, y: worldPos.y, z: worldPos.z } as any
      );
      camera.worldToLocal(vector);
      
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      // Simple screen projection
      const x = rect.left + rect.width / 2 + (worldPos.x / 10) * rect.width / 2;
      const y = rect.top + rect.height / 2 - (worldPos.y / 10) * rect.height / 2;

      setPosition({ x, y });
    };

    const interval = setInterval(updatePosition, 50);
    return () => clearInterval(interval);
  }, [hoveredPlanet, camera, gl]);

  return (
    <AnimatePresence>
      {hoveredPlanet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed pointer-events-none z-50 glass-panel px-4 py-3 rounded-lg max-w-xs"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold text-foreground">
              {hoveredPlanet.name || hoveredPlanet.id}
            </div>
            {hoveredPlanet.probability !== undefined && (
              <div className="text-sm text-muted-foreground">
                Probability: {(hoveredPlanet.probability * 100).toFixed(1)}%
              </div>
            )}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>Radius: {hoveredPlanet.features.radius.toFixed(2)} R⊕</div>
              <div>Period: {hoveredPlanet.features.period.toFixed(1)} days</div>
              <div>Distance: {hoveredPlanet.features.distance.toFixed(1)} AU</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
