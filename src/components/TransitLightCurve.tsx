import { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

interface TransitData {
  time: number;
  flux: number;
}

interface TransitLightCurveProps {
  isActive: boolean;
  planetRadius: number;
  orbitalPeriod: number;
  onInfoClick: () => void;
}

export const TransitLightCurve = ({ 
  isActive, 
  planetRadius, 
  orbitalPeriod,
  onInfoClick 
}: TransitLightCurveProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [transitData, setTransitData] = useState<TransitData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate realistic transit data based on planet parameters
  const generateTransitData = (time: number): TransitData => {
    const period = orbitalPeriod * 10; // Scale for visualization
    const transitDuration = period * 0.1; // Transit lasts 10% of period
    const transitDepth = (planetRadius / 10) * 0.02; // Depth based on planet size
    
    // Normalize time to period
    const phaseTime = time % period;
    let flux = 1.0; // Baseline flux
    
    // Check if we're in transit
    const transitStart = period * 0.45;
    const transitEnd = period * 0.55;
    
    if (phaseTime >= transitStart && phaseTime <= transitEnd) {
      // Create smooth transit curve using a parabolic dip
      const transitProgress = (phaseTime - transitStart) / (transitEnd - transitStart);
      const transitShape = 4 * transitProgress * (1 - transitProgress); // Parabolic shape
      flux = 1.0 - (transitDepth * transitShape);
    }
    
    // Add realistic noise
    flux += (Math.random() - 0.5) * 0.001;
    
    return { time, flux };
  };

  // Animation loop
  useEffect(() => {
    if (isPlaying && isActive) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          const newDataPoint = generateTransitData(newTime);
          
          setTransitData(prevData => {
            const newData = [...prevData, newDataPoint];
            // Keep only last 200 points for performance
            return newData.slice(-200);
          });
          
          return newTime;
        });
      }, 50); // 20 FPS
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isActive, planetRadius, orbitalPeriod]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setTransitData([]);
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            Curva de Luz de Tránsito
          </h3>
          <button
            onClick={onInfoClick}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pausar' : 'Iniciar'}
          </button>
          
          <button
            onClick={handleReset}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plot */}
      <div className="bg-gray-800 rounded-lg p-2">
        <Plot
          data={[
            {
              x: transitData.map(d => d.time),
              y: transitData.map(d => d.flux),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { 
                color: '#3b82f6', 
                size: 3,
                opacity: 0.8 
              },
              line: { 
                color: '#3b82f6', 
                width: 2 
              },
              name: 'Flujo Estelar',
            },
          ]}
          layout={{
            width: 500,
            height: 300,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff', size: 12 },
            xaxis: {
              title: 'Tiempo (horas)',
              gridcolor: '#374151',
              zerolinecolor: '#374151',
              color: '#9ca3af',
            },
            yaxis: {
              title: 'Flujo Relativo',
              gridcolor: '#374151',
              zerolinecolor: '#374151',
              color: '#9ca3af',
              range: [0.98, 1.005],
            },
            margin: { l: 60, r: 20, t: 20, b: 50 },
            showlegend: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
        />
      </div>

      {/* Info Panel */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400">Radio del Planeta</div>
          <div className="text-white font-semibold">{planetRadius.toFixed(1)} R⊕</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400">Período Orbital</div>
          <div className="text-white font-semibold">{orbitalPeriod.toFixed(1)} días</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400">Profundidad</div>
          <div className="text-white font-semibold">
            {((planetRadius / 10) * 0.02 * 100).toFixed(3)}%
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>Observa:</strong> Cuando el planeta pasa frente a la estrella, 
          el brillo disminuye creando una característica "curva de tránsito". 
          La profundidad del dip nos indica el tamaño relativo del planeta.
        </p>
      </div>
    </motion.div>
  );
};