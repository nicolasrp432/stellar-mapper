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
        <main className="pt-20">
          <ProfessionalView endpoint="/api/analyze" />
        </main>
      </>
    );
  }

  // Didactic mode view
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header onBackToHome={handleBackToHome} showBackButton />

      {/* Main content with top margin for fixed header */}
      <main className="pt-20">
        {/* Mode switcher - Centered */}
        <div className="flex justify-center items-center py-8">
          <div className={`glass-panel ${isMobile ? 'p-1' : 'p-2'} rounded-lg flex ${isMobile ? 'flex-col gap-2' : 'gap-6'}`}>
            <Button
              variant={mode === 'didactic' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'lg'}
              onClick={() => handleSelectMode('didactic')}
              className={`${mode === 'didactic' ? 'bg-primary' : ''} ${isMobile ? 'px-4 py-3 text-sm w-full' : 'px-6 py-3 text-lg'} touch-manipulation`}
            >
              <FlaskConical className={`${isMobile ? 'h-4 w-4 mr-2' : 'h-5 w-5 mr-3'}`} />
              {isMobile ? 'Modo Didáctico' : 'Didactic Mode'}
            </Button>
            <Button
              variant={mode === 'professional' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'lg'}
              onClick={() => handleSelectMode('professional')}
              className={`${mode === 'professional' ? 'bg-primary' : ''} ${isMobile ? 'px-4 py-3 text-sm w-full' : 'px-6 py-3 text-lg'} touch-manipulation`}
            >
              <Telescope className={`${isMobile ? 'h-4 w-4 mr-2' : 'h-5 w-5 mr-3'}`} />
              {isMobile ? 'Modo Profesional' : 'Professional Mode'}
            </Button>
          </div>
        </div>

        {/* 3D Visualization */}
        <ExoplanetSystem
          mode={mode}
          onPlanetSelect={handlePlanetSelect}
          fetchEndpoint="/api/analyze"
          showUI={true}
        />

      </main>

    </div>
  );
};

export default Index;
