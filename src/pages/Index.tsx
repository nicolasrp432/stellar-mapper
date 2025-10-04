import { useState } from 'react';
import { motion } from 'framer-motion';
import { Telescope, FlaskConical } from 'lucide-react';
import ExoplanetSystem from '@/components/ExoplanetSystem';
import { Button } from '@/components/ui/button';
import { PlanetData } from '@/types/exoplanet';
import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/Header';
import { ProfessionalView } from '@/components/ProfessionalView';
import { useIsMobile } from '@/hooks/use-mobile';

type ViewState = 'landing' | 'didactic' | 'professional';

const Index = () => {
  const isMobile = useIsMobile();
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
      <div className={`absolute ${isMobile ? 'top-20 right-2' : 'top-24 right-6'} z-50`}>
        <div className={`glass-panel ${isMobile ? 'p-0.5' : 'p-1'} rounded-lg flex gap-1`}>
          <Button
            variant={mode === 'didactic' ? 'default' : 'ghost'}
            size={isMobile ? 'sm' : 'sm'}
            onClick={() => handleSelectMode('didactic')}
            className={`${mode === 'didactic' ? 'bg-primary' : ''} ${isMobile ? 'px-2 py-1 text-xs' : ''} touch-manipulation`}
          >
            <FlaskConical className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {isMobile ? 'Didáctico' : 'Didactic'}
          </Button>
          <Button
            variant={mode === 'professional' ? 'default' : 'ghost'}
            size={isMobile ? 'sm' : 'sm'}
            onClick={() => handleSelectMode('professional')}
            className={`${mode === 'professional' ? 'bg-primary' : ''} ${isMobile ? 'px-2 py-1 text-xs' : ''} touch-manipulation`}
          >
            <Telescope className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {isMobile ? 'Pro' : 'Professional'}
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`absolute ${isMobile ? 'bottom-4 left-2 right-2' : 'bottom-6 left-1/2 transform -translate-x-1/2'} z-50`}
      >
        <div className={`glass-panel ${isMobile ? 'px-3 py-2' : 'px-6 py-3'} rounded-full ${isMobile ? '' : 'max-w-2xl'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-center text-muted-foreground`}>
            <span className="font-medium text-foreground">
              {isMobile ? 'Modo Didáctico:' : 'Didactic Mode:'}
            </span> 
            {isMobile ? ' Ajusta parámetros planetarios' : ' Use sliders to adjust planet parameters and see real-time changes'}
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
