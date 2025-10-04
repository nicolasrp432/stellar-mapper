import { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, Telescope, FlaskConical } from 'lucide-react';
import ExoplanetSystem from '@/components/ExoplanetSystem';
import { Button } from '@/components/ui/button';
import { PlanetData } from '@/types/exoplanet';

const Index = () => {
  const [mode, setMode] = useState<'didactic' | 'professional'>('didactic');

  const handlePlanetSelect = (planet: PlanetData) => {
    console.log('Planet selected:', planet);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 glass-panel rounded-lg">
              <Orbit className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ExoPlanet Explorer</h1>
              <p className="text-sm text-muted-foreground">
                Interactive 3D Visualization System
              </p>
            </div>
          </div>

          <div className="glass-panel p-1 rounded-lg flex gap-1">
            <Button
              variant={mode === 'didactic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('didactic')}
              className={mode === 'didactic' ? 'bg-primary' : ''}
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Didactic
            </Button>
            <Button
              variant={mode === 'professional' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('professional')}
              className={mode === 'professional' ? 'bg-primary' : ''}
            >
              <Telescope className="h-4 w-4 mr-2" />
              Professional
            </Button>
          </div>
        </motion.div>
      </header>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="glass-panel px-6 py-3 rounded-full max-w-2xl">
          <p className="text-sm text-center text-muted-foreground">
            {mode === 'didactic' ? (
              <>
                <span className="font-medium text-foreground">Didactic Mode:</span> Use sliders
                to adjust planet parameters and see real-time changes
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">Professional Mode:</span> Upload
                CSV data and map columns for automated detection
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* 3D Visualization */}
      <ExoplanetSystem
        mode={mode}
        onPlanetSelect={handlePlanetSelect}
        fetchEndpoint="/api/analyze"
        showUI={true}
      />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/50" />
    </div>
  );
};

export default Index;
