import { useState, useEffect, useRef, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Info, Settings, Download, X } from 'lucide-react';

interface TransitData {
  time: number;
  flux: number;
  phase: number;
}

interface TransitLightCurveProps {
  isActive: boolean;
  planetRadius: number;
  orbitalPeriod: number;
  onInfoClick: () => void;
  onClose: () => void;
}

interface TransitParameters {
  starRadius: number;
  planetRadius: number;
  orbitalPeriod: number;
  semiMajorAxis: number;
  inclination: number;
  limbDarkening: number;
  stellarNoise: number;
  instrumentalNoise: number;
}

export const TransitLightCurve = ({ 
  isActive, 
  planetRadius, 
  orbitalPeriod,
  onInfoClick,
  onClose
}: TransitLightCurveProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [transitData, setTransitData] = useState<TransitData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'realtime' | 'full' | 'folded'>('realtime');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced transit parameters with realistic defaults
  const [parameters, setParameters] = useState<TransitParameters>({
    starRadius: 1.0, // Solar radii
    planetRadius: planetRadius,
    orbitalPeriod: orbitalPeriod,
    semiMajorAxis: Math.pow(orbitalPeriod / 365.25, 2/3) * 215, // Kepler's 3rd law approximation
    inclination: 89.5, // degrees (nearly edge-on for transit)
    limbDarkening: 0.6, // Typical for Sun-like stars
    stellarNoise: 0.0001, // Stellar variability
    instrumentalNoise: 0.00005, // Instrumental precision
  });

  // Physics-based transit model with limb darkening
  const calculateTransitFlux = (phase: number, params: TransitParameters): number => {
    const { starRadius, planetRadius, semiMajorAxis, inclination, limbDarkening } = params;
    
    // Convert phase to orbital position
    const theta = phase * 2 * Math.PI;
    
    // Calculate planet position in sky plane
    const x = semiMajorAxis * Math.cos(theta);
    const y = semiMajorAxis * Math.sin(theta) * Math.cos(inclination * Math.PI / 180);
    const z = semiMajorAxis * Math.sin(theta) * Math.sin(inclination * Math.PI / 180);
    
    // Distance from star center in sky plane
    const d = Math.sqrt(x * x + y * y);
    
    // Check if planet is in front of star (z > 0) and overlapping
    if (z <= 0 || d > starRadius + planetRadius) {
      return 1.0; // No transit
    }
    
    // Calculate overlapping area with limb darkening
    let flux = 1.0;
    
    if (d < starRadius - planetRadius) {
      // Planet completely inside star
      const planetArea = Math.PI * planetRadius * planetRadius;
      const starArea = Math.PI * starRadius * starRadius;
      
      // Apply limb darkening correction
      const r = d / starRadius;
      const limbDarkeningFactor = 1 - limbDarkening * (1 - Math.sqrt(1 - r * r));
      
      flux = 1.0 - (planetArea / starArea) * limbDarkeningFactor;
    } else if (d < starRadius + planetRadius) {
      // Partial overlap - more complex calculation
      const r1 = starRadius;
      const r2 = planetRadius;
      
      // Area of intersection of two circles
      const d1 = (d * d + r1 * r1 - r2 * r2) / (2 * d);
      const d2 = d - d1;
      
      const area1 = r1 * r1 * Math.acos(d1 / r1) - d1 * Math.sqrt(r1 * r1 - d1 * d1);
      const area2 = r2 * r2 * Math.acos(d2 / r2) - d2 * Math.sqrt(r2 * r2 - d2 * d2);
      
      const overlapArea = area1 + area2;
      const starArea = Math.PI * r1 * r1;
      
      // Apply limb darkening
      const r = d / starRadius;
      const limbDarkeningFactor = 1 - limbDarkening * (1 - Math.sqrt(Math.max(0, 1 - r * r)));
      
      flux = 1.0 - (overlapArea / starArea) * limbDarkeningFactor;
    }
    
    return Math.max(0, flux);
  };

  // Generate realistic transit data with enhanced physics
  const generateTransitData = (time: number): TransitData => {
    const period = parameters.orbitalPeriod;
    const phase = (time / period) % 1.0;
    
    // Calculate base flux from transit model
    let flux = calculateTransitFlux(phase, parameters);
    
    // Add realistic noise components
    // Stellar variability (correlated noise)
    const stellarVariation = parameters.stellarNoise * Math.sin(time * 0.1) * 0.5;
    
    // Instrumental noise (white noise)
    const instrumentalNoise = (Math.random() - 0.5) * parameters.instrumentalNoise * 2;
    
    // Systematic trends (very slow)
    const systematicTrend = parameters.instrumentalNoise * 0.1 * Math.sin(time * 0.01);
    
    flux += stellarVariation + instrumentalNoise + systematicTrend;
    
    return { time, flux, phase };
  };

  // Generate full transit curve for folded view
  const generateFullTransitCurve = useMemo(() => {
    const points: TransitData[] = [];
    const numPoints = 1000;
    
    for (let i = 0; i < numPoints; i++) {
      const phase = (i / numPoints) - 0.5; // Center around transit
      const time = phase * parameters.orbitalPeriod;
      const flux = calculateTransitFlux(phase + 0.5, parameters);
      
      // Add minimal noise for clean view
      const noise = (Math.random() - 0.5) * parameters.instrumentalNoise * 0.5;
      points.push({ time, flux: flux + noise, phase: phase + 0.5 });
    }
    
    return points;
  }, [parameters]);

  // Update parameters when props change
  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      planetRadius: planetRadius,
      orbitalPeriod: orbitalPeriod,
      semiMajorAxis: Math.pow(orbitalPeriod / 365.25, 2/3) * 215,
    }));
  }, [planetRadius, orbitalPeriod]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && isActive && viewMode === 'realtime') {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          const newDataPoint = generateTransitData(newTime);
          
          setTransitData(prevData => {
            const newData = [...prevData, newDataPoint];
            // Keep only last 500 points for better visualization
            return newData.slice(-500);
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
  }, [isPlaying, isActive, viewMode, parameters]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setTransitData([]);
  };

  const handleViewModeChange = (mode: 'realtime' | 'full' | 'folded') => {
    setViewMode(mode);
    if (mode !== 'realtime') {
      setIsPlaying(false);
    }
  };

  const exportData = () => {
    const dataToExport = viewMode === 'folded' ? generateFullTransitCurve : transitData;
    const csv = 'Time,Flux,Phase\n' + 
      dataToExport.map(d => `${d.time},${d.flux},${d.phase}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transit_data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate transit statistics
  const transitStats = useMemo(() => {
    const depth = (parameters.planetRadius / parameters.starRadius) ** 2;
    const duration = (parameters.orbitalPeriod * 24) * 
      Math.sqrt(1 - ((parameters.semiMajorAxis * Math.cos(parameters.inclination * Math.PI / 180)) / parameters.starRadius) ** 2) / 
      (Math.PI * parameters.semiMajorAxis / parameters.starRadius);
    
    return {
      depth: depth * 100, // percentage
      duration: duration, // hours
      snr: depth / Math.sqrt(parameters.stellarNoise ** 2 + parameters.instrumentalNoise ** 2),
    };
  }, [parameters]);

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
            Simulador de Curva de Luz de Tránsito
          </h3>
          <button
            onClick={onInfoClick}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mr-2">
            {(['realtime', 'full', 'folded'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {mode === 'realtime' && 'Tiempo Real'}
                {mode === 'full' && 'Completa'}
                {mode === 'folded' && 'Plegada'}
              </button>
            ))}
          </div>

          {viewMode === 'realtime' && (
            <>
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
            </>
          )}

          <button
            onClick={exportData}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Exportar datos"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-2"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 bg-gray-800 rounded-lg p-3"
        >
          <h4 className="text-sm font-semibold text-white mb-2">Configuración Avanzada</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Ruido Estelar (%)</label>
              <input
                type="range"
                min="0.001"
                max="0.01"
                step="0.001"
                value={parameters.stellarNoise}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  stellarNoise: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <span className="text-white font-mono">{(parameters.stellarNoise * 100).toFixed(3)}%</span>
            </div>
            
            <div>
              <label className="text-gray-400 block mb-1">Ruido Instrumental (%)</label>
              <input
                type="range"
                min="0.0001"
                max="0.005"
                step="0.0001"
                value={parameters.instrumentalNoise}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  instrumentalNoise: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <span className="text-white font-mono">{(parameters.instrumentalNoise * 100).toFixed(4)}%</span>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Inclinación (°)</label>
              <input
                type="range"
                min="85"
                max="95"
                step="0.1"
                value={parameters.inclination}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  inclination: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <span className="text-white font-mono">{parameters.inclination.toFixed(1)}°</span>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Coef. Oscurecimiento</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={parameters.limbDarkening}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  limbDarkening: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <span className="text-white font-mono">{parameters.limbDarkening.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plot */}
      <div className="bg-gray-800 rounded-lg p-2">
        <Plot
          data={[
            {
              x: (viewMode === 'folded' ? generateFullTransitCurve : transitData).map(d => 
                viewMode === 'folded' ? d.phase : d.time
              ),
              y: (viewMode === 'folded' ? generateFullTransitCurve : transitData).map(d => d.flux),
              type: 'scatter',
              mode: viewMode === 'realtime' ? 'lines+markers' : 'lines',
              marker: { 
                color: '#3b82f6', 
                size: viewMode === 'realtime' ? 3 : 2,
                opacity: 0.8 
              },
              line: { 
                color: '#3b82f6', 
                width: 2 
              },
              name: 'Flujo Observado',
            },
            ...(viewMode === 'folded' ? [{
              x: generateFullTransitCurve.map(d => d.phase),
              y: generateFullTransitCurve.map(d => calculateTransitFlux(d.phase, parameters)),
              type: 'scatter' as const,
              mode: 'lines' as const,
              line: { color: '#EF4444', width: 2, dash: 'dash' },
              name: 'Modelo Teórico'
            }] : [])
          ]}
          layout={{
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff', size: 12 },
            xaxis: {
              title: viewMode === 'folded' ? 'Fase Orbital' : 'Tiempo (horas)',
              gridcolor: '#374151',
              zerolinecolor: '#374151',
              color: '#9ca3af',
            },
            yaxis: {
              title: 'Flujo Relativo',
              gridcolor: '#374151',
              zerolinecolor: '#374151',
              color: '#9ca3af',
              range: viewMode === 'folded' ? [1 - transitStats.depth/100 * 1.5, 1.002] : [0.98, 1.005],
            },
            margin: { l: 60, r: 20, t: 20, b: 50 },
            showlegend: viewMode === 'folded',
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%', height: '350px' }}
        />
      </div>

      {/* Statistics Panel */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Radio del Planeta</div>
          <div className="text-white font-semibold">{planetRadius.toFixed(1)} R⊕</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Período Orbital</div>
          <div className="text-white font-semibold">{orbitalPeriod.toFixed(1)} días</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Profundidad</div>
          <div className="text-white font-semibold">
            {transitStats.depth.toFixed(3)}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-gray-400 text-xs">Duración</div>
          <div className="text-white font-semibold">
            {transitStats.duration.toFixed(1)}h
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-gray-400 text-xs">SNR</div>
          <div className="text-white font-semibold">
            {transitStats.snr.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Dynamic Description */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>
            {viewMode === 'realtime' && 'Tiempo Real: '}
            {viewMode === 'full' && 'Curva Completa: '}
            {viewMode === 'folded' && 'Curva Plegada: '}
          </strong>
          {viewMode === 'realtime' && 'Observa cómo el brillo estelar disminuye cuando el planeta pasa frente a la estrella. La profundidad del tránsito revela el tamaño relativo del planeta.'}
          {viewMode === 'full' && 'Visualiza múltiples tránsitos observados a lo largo del tiempo. Los tránsitos periódicos confirman la presencia del exoplaneta.'}
          {viewMode === 'folded' && 'Todos los tránsitos se superponen por fase orbital. La línea roja muestra el modelo teórico comparado con las observaciones.'}
        </p>
      </div>
    </motion.div>
  );
};