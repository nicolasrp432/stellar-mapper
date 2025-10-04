import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Plot from 'react-plotly.js';
import { Button } from '@/components/ui/button';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { getProbabilityColor } from '@/utils/scale';

export const PlanetDetailPanel = () => {
  const { selectedPlanet, selectPlanet } = usePlanetsStore();

  if (!selectedPlanet) return null;

  // Generate synthetic light curve data
  const generateLightCurve = () => {
    const depth = selectedPlanet.features.depth || 100;
    const duration = selectedPlanet.features.duration || 2;
    const period = selectedPlanet.features.period;
    
    const time: number[] = [];
    const flux: number[] = [];
    
    for (let t = 0; t <= period * 2; t += 0.1) {
      time.push(t);
      
      // Simple transit model
      const phase = t % period;
      const transitStart = period / 2 - duration / 2;
      const transitEnd = period / 2 + duration / 2;
      
      if (phase >= transitStart && phase <= transitEnd) {
        flux.push(1 - depth / 1000000);
      } else {
        flux.push(1 + (Math.random() - 0.5) * 0.0001);
      }
    }
    
    return { time, flux };
  };

  const { time, flux } = generateLightCurve();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 top-4 bottom-4 w-96 glass-panel p-6 overflow-y-auto z-40"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedPlanet.name || selectedPlanet.id}
            </h2>
            {selectedPlanet.probability !== undefined && (
              <div
                className="text-sm font-medium mt-1"
                style={{ color: getProbabilityColor(selectedPlanet.probability) }}
              >
                Detection Probability: {(selectedPlanet.probability * 100).toFixed(1)}%
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectPlanet(null)}
            className="hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Physical Properties
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Radius</div>
                <div className="text-lg font-semibold">
                  {selectedPlanet.features.radius.toFixed(2)} R⊕
                </div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Period</div>
                <div className="text-lg font-semibold">
                  {selectedPlanet.features.period.toFixed(1)} d
                </div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Distance</div>
                <div className="text-lg font-semibold">
                  {selectedPlanet.features.distance.toFixed(2)} AU
                </div>
              </div>
              {selectedPlanet.features.snr && (
                <div className="glass-panel p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">SNR</div>
                  <div className="text-lg font-semibold">
                    {selectedPlanet.features.snr.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedPlanet.features.depth && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Transit Light Curve
              </h3>
              <div className="glass-panel p-2 rounded-lg">
                <Plot
                  data={[
                    {
                      x: time,
                      y: flux,
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: getProbabilityColor(selectedPlanet.probability), width: 2 },
                    },
                  ]}
                  layout={{
                    autosize: true,
                    height: 200,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    xaxis: {
                      title: 'Time (days)',
                      color: '#9ca3af',
                      gridcolor: 'rgba(156,163,175,0.1)',
                    },
                    yaxis: {
                      title: 'Relative Flux',
                      color: '#9ca3af',
                      gridcolor: 'rgba(156,163,175,0.1)',
                    },
                    font: { family: 'Inter, sans-serif', size: 10 },
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Additional Data
            </h3>
            <div className="glass-panel p-4 rounded-lg space-y-2 text-sm">
              {selectedPlanet.features.depth && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transit Depth:</span>
                  <span className="font-medium">{selectedPlanet.features.depth} ppm</span>
                </div>
              )}
              {selectedPlanet.features.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transit Duration:</span>
                  <span className="font-medium">{selectedPlanet.features.duration.toFixed(2)} h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
