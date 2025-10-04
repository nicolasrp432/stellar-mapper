import { useState } from 'react';
import { motion } from 'framer-motion';
import { Telescope, FlaskConical } from 'lucide-react';
import ExoplanetSystem from '@/components/ExoplanetSystem';
import { Button } from '@/components/ui/button';
import { PlanetData } from '@/types/exoplanet';
import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/Header';
import { ProfessionalView } from '@/components/ProfessionalView';

type ViewState = 'landing' | 'didactic' | 'professional';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [mode, setMode] = useState<'didactic' | 'professional'>('didactic');

  const handleSelectMode = (selectedMode: 'didactic' | 'professional') => {
    setMode(selectedMode);
    setCurrentView(selectedMode);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
  };

  const handlePlanetSelect = (planet: PlanetData) => {
    console.log('Planet selected:', planet);
  };

  // Landing page view
  if (currentView === 'landing') {
    return <LandingPage onSelectMode={handleSelectMode} />;
  }

  // Professional mode view
  if (currentView === 'professional') {
    return (
      <>
        <Header onBackToHome={handleBackToHome} showBackButton />
        <ProfessionalView endpoint="/api/analyze" />
      </>
    );
  }

  // Didactic mode view
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header onBackToHome={handleBackToHome} showBackButton />

      {/* Mode switcher */}
      <div className="absolute top-24 right-6 z-50">
        <div className="glass-panel p-1 rounded-lg flex gap-1">
          <Button
            variant={mode === 'didactic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectMode('didactic')}
            className={mode === 'didactic' ? 'bg-primary' : ''}
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            Didactic
          </Button>
          <Button
            variant={mode === 'professional' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectMode('professional')}
            className={mode === 'professional' ? 'bg-primary' : ''}
          >
            <Telescope className="h-4 w-4 mr-2" />
            Professional
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="glass-panel px-6 py-3 rounded-full max-w-2xl">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-foreground">Didactic Mode:</span> Use sliders
            to adjust planet parameters and see real-time changes
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
