import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, Globe, Clock, Ruler } from 'lucide-react';

interface PlanetParameters {
  radius: number;
  distance: number;
  period: number;
}

interface PlanetParameterSlidersProps {
  isVisible: boolean;
  onParametersChange: (params: PlanetParameters) => void;
  initialParams?: PlanetParameters;
}

const defaultParams: PlanetParameters = {
  radius: 1.0, // Earth radii
  distance: 1.0, // AU
  period: 365, // days
};

export const PlanetParameterSliders = ({ 
  isVisible, 
  onParametersChange,
  initialParams = defaultParams 
}: PlanetParameterSlidersProps) => {
  const [params, setParams] = useState<PlanetParameters>(initialParams);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update parameters when they change
  useEffect(() => {
    onParametersChange(params);
  }, [params, onParametersChange]);

  const handleParameterChange = (key: keyof PlanetParameters, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetParameters = () => {
    setParams(defaultParams);
  };

  const calculateTransitDepth = () => {
    // Transit depth = (Planet radius / Star radius)^2
    // Assuming Sun-like star with radius = 1 solar radius = 109 Earth radii
    const starRadiusInEarthRadii = 109;
    const depth = Math.pow(params.radius / starRadiusInEarthRadii, 2) * 100;
    return depth.toFixed(4);
  };

  const getHabitableZoneStatus = () => {
    if (params.distance >= 0.95 && params.distance <= 1.37) {
      return { status: 'Zona Habitable', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    } else if (params.distance < 0.95) {
      return { status: 'Muy Caliente', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    } else {
      return { status: 'Muy Frío', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    }
  };

  if (!isVisible) return null;

  const habitableZone = getHabitableZoneStatus();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-30"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Parámetros del Planeta</h3>
              <p className="text-xs text-gray-400">Ajusta y observa los cambios</p>
            </div>
          </div>
          
          <button
            onClick={resetParameters}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Resetear valores"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="p-4 space-y-6">
        {/* Planet Radius */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <label className="text-sm font-medium text-white">Radio del Planeta</label>
            </div>
            <span className="text-sm text-blue-400 font-mono">
              {params.radius.toFixed(2)} R⊕
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={params.radius}
              onChange={(e) => handleParameterChange('radius', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1 R⊕</span>
              <span>10 R⊕</span>
            </div>
          </div>
        </div>

        {/* Orbital Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-green-400" />
              <label className="text-sm font-medium text-white">Distancia Orbital</label>
            </div>
            <span className="text-sm text-green-400 font-mono">
              {params.distance.toFixed(2)} AU
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={params.distance}
              onChange={(e) => handleParameterChange('distance', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1 AU</span>
              <span>5 AU</span>
            </div>
          </div>
        </div>

        {/* Orbital Period */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-white">Período Orbital</label>
            </div>
            <span className="text-sm text-purple-400 font-mono">
              {params.period.toFixed(0)} días
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="1000"
              step="1"
              value={params.period}
              onChange={(e) => handleParameterChange('period', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 día</span>
              <span>1000 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Properties */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        <h4 className="text-sm font-semibold text-white mb-3">Propiedades Calculadas</h4>
        
        {/* Transit Depth */}
        <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-300">Profundidad del Tránsito</span>
          <span className="text-sm font-mono text-yellow-400">
            {calculateTransitDepth()}%
          </span>
        </div>

        {/* Habitable Zone Status */}
        <div className={`flex justify-between items-center p-2 rounded-lg ${habitableZone.bgColor}`}>
          <span className="text-sm text-gray-300">Zona de Habitabilidad</span>
          <span className={`text-sm font-semibold ${habitableZone.color}`}>
            {habitableZone.status}
          </span>
        </div>

        {/* Planet Type */}
        <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-300">Tipo de Planeta</span>
          <span className="text-sm font-semibold text-blue-400">
            {params.radius < 1.5 ? 'Rocoso' : params.radius < 4 ? 'Neptuno' : 'Gigante Gaseoso'}
          </span>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-4 border-t border-gray-700">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-200 leading-relaxed">
            <strong>Tip:</strong> Ajusta los parámetros para ver cómo afectan 
            la curva de luz del tránsito. Planetas más grandes crean dips más profundos, 
            mientras que órbitas más cercanas tienen períodos más cortos.
          </p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </motion.div>
  );
};