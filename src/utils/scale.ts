// Scaling constants for the 3D scene
export const SCALE_RADIUS = 0.3; // Planet visual size multiplier
export const SCALE_DISTANCE = 2.5; // Orbital distance multiplier
export const SCALE_PERIOD = 0.05; // Orbital speed factor (smaller = faster)
export const STAR_RADIUS = 1.5; // Star size

// Convert features to scene values
export const scaleRadius = (radius: number): number => {
  return Math.max(0.1, radius * SCALE_RADIUS);
};

export const scaleDistance = (distance: number): number => {
  return Math.max(3, distance * SCALE_DISTANCE);
};

export const scalePeriod = (period: number): number => {
  // Convert period (days) to angular velocity
  return (2 * Math.PI) / (period * SCALE_PERIOD);
};

// Color based on probability
export const getProbabilityColor = (probability?: number): string => {
  if (!probability) return '#6b7280'; // gray for unknown
  if (probability < 0.4) return '#ef4444'; // red (low)
  if (probability < 0.7) return '#3b82f6'; // blue (medium)
  return '#10b981'; // green (high)
};

// Calculate orbital position
export const calculateOrbitalPosition = (
  angle: number,
  distance: number
): [number, number, number] => {
  const scaledDistance = scaleDistance(distance);
  return [
    Math.cos(angle) * scaledDistance,
    0,
    Math.sin(angle) * scaledDistance,
  ];
};
