import { useEffect, useState } from 'react';
import { Scene3D } from './Scene3D';
import { PlanetDetailPanel } from './PlanetDetailPanel';
import { DidacticControls } from './DidacticControls';
import { ProfessionalUploader } from './ProfessionalUploader';
import { ExoplanetSystemProps, PlanetData } from '@/types/exoplanet';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { useFetchPlanets } from '@/hooks/useFetchPlanets';
import { Button } from '@/components/ui/button';
import { PauseCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const DEFAULT_DIDACTIC_PLANETS: PlanetData[] = [
  {
    id: 'planet-1',
    name: 'Kepler-22b',
    probability: 0.82,
    features: {
      radius: 2.4,
      period: 289.9,
      distance: 8.5,
      depth: 250,
      duration: 5.2,
      snr: 12.5,
    },
  },
  {
    id: 'planet-2',
    name: 'HD 209458b',
    probability: 0.95,
    features: {
      radius: 1.38,
      period: 3.5,
      distance: 3.2,
      depth: 1500,
      duration: 3.0,
      snr: 18.2,
    },
  },
  {
    id: 'planet-3',
    name: 'TRAPPIST-1e',
    probability: 0.65,
    features: {
      radius: 0.92,
      period: 6.1,
      distance: 4.5,
      depth: 80,
      duration: 1.8,
      snr: 8.7,
    },
  },
];

export const ExoplanetSystem = ({
  mode = 'didactic',
  planets: externalPlanets,
  fetchEndpoint = '/analyze',
  onPlanetSelect,
  width = '100%',
  height = '100vh',
  showUI = true,
}: ExoplanetSystemProps) => {
  const { planets, setPlanets, selectPlanet } = usePlanetsStore();
  const { planets: fetchedPlanets, loading } = useFetchPlanets(
    fetchEndpoint,
    mode === 'professional' && !externalPlanets
  );
  const isMobile = useIsMobile();
  const [paused, setPaused] = useState(false);
  const [realisticMode, setRealisticMode] = useState(true);

  const togglePause = () => setPaused((p) => !p);
  const resetPositions = () => {
    if (mode === 'didactic') {
      setPlanets(DEFAULT_DIDACTIC_PLANETS);
    }
  };
  const toggleMode = () => setRealisticMode((m) => !m);

  // Initialize planets based on mode
  useEffect(() => {
    if (mode === 'didactic' && planets.length === 0) {
      setPlanets(DEFAULT_DIDACTIC_PLANETS);
    } else if (mode === 'professional') {
      if (externalPlanets) {
        setPlanets(externalPlanets);
      } else if (fetchedPlanets.length > 0) {
        setPlanets(fetchedPlanets);
      }
    }
  }, [mode, externalPlanets, fetchedPlanets]);

  // Handle planet selection callback
  useEffect(() => {
    const unsubscribe = usePlanetsStore.subscribe((state) => {
      if (state.selectedPlanet && onPlanetSelect) {
        onPlanetSelect(state.selectedPlanet);
      }
    });
    return unsubscribe;
  }, [onPlanetSelect]);

  // WebGL fallback check
  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  };

  if (!supportsWebGL()) {
    return (
      <div
        className="flex items-center justify-center bg-background"
        style={{ width, height }}
      >
        <div className="glass-panel p-8 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">WebGL Not Supported</h2>
          <p className="text-muted-foreground">
            Your browser does not support WebGL, which is required for 3D visualization.
            Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[400px] h-[calc(100vh-200px)]" style={{ width, height }}>
      {/* 3D Scene Container with proper sizing */}
      <div className="absolute inset-0 w-full h-full">
        <Scene3D paused={paused} realisticMode={realisticMode} />
      </div>
      
      {/* Scene Controls - Bottom Center */}
      {mode === 'didactic' && (
        <div className={`absolute ${isMobile ? 'bottom-5 left-2 right-2' : 'bottom-5 left-1/2 -translate-x-1/2'} z-40`}>
          <div className={`glass-panel p-2 rounded-lg flex ${isMobile ? 'flex-col gap-2' : 'gap-4'} justify-center`}>
            <Button
              variant={paused ? 'default' : 'ghost'}
              size={isMobile ? 'sm' : 'default'}
              onClick={togglePause}
              className={`${isMobile ? 'w-full' : ''} touch-manipulation`}
            >
              <PauseCircle className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {paused ? 'Reanudar' : 'Pausar'}
            </Button>
            <Button
              variant={'ghost'}
              size={isMobile ? 'sm' : 'default'}
              onClick={resetPositions}
              className={`${isMobile ? 'w-full' : ''} touch-manipulation`}
            >
              <RefreshCcw className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              Reiniciar órbitas
            </Button>
            <Button
              variant={realisticMode ? 'default' : 'ghost'}
              size={isMobile ? 'sm' : 'default'}
              onClick={toggleMode}
              className={`${isMobile ? 'w-full' : ''} touch-manipulation`}
            >
              <Sparkles className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {realisticMode ? 'Modo realista' : 'Modo simplificado'}
            </Button>
          </div>
        </div>
      )}

      {/* 2D UI Overlay */}
      {showUI && (
        <>
          <PlanetDetailPanel />
          
          {mode === 'didactic' && <DidacticControls />}
          {mode === 'professional' && <ProfessionalUploader endpoint={fetchEndpoint} />}
          
          {loading && (
            <div className="fixed top-4 right-4 glass-panel px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading planets...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExoplanetSystem;
