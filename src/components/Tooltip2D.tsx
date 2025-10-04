import { usePlanetsStore } from '@/hooks/usePlanetsStore';

export const Tooltip2D = () => {
  const { hoveredPlanet } = usePlanetsStore();

  if (!hoveredPlanet) return null;

  return null; // Tooltip is now handled by Planet component hover
};
