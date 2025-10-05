import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Info, Play, Settings, BookOpen, Eye, EyeOff, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { PlanetData } from '@/types/exoplanet';
import { ExoplanetInfoModal } from './ExoplanetInfoModal';
import { TransitLightCurve } from './TransitLightCurve';
import { DetectionMethodsMenu } from './DetectionMethodsMenu';
import { PlanetParameterSliders } from './PlanetParameterSliders';
import { useIsMobile } from '@/hooks/use-mobile';

export const DidacticControls = () => {
  const { planets, updatePlanet, addPlanet, removePlanet } = usePlanetsStore();
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(
    planets.length > 0 ? planets[0].id : null
  );
  const [visible, setVisible] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalTopic, setModalTopic] = useState<'what-is-exoplanet' | 'detection-methods' | 'transit-method' | 'radial-velocity' | 'microlensing' | 'planet-types' | null>(null);
  const [showTransitCurve, setShowTransitCurve] = useState(false);
  const [showDetectionMethods, setShowDetectionMethods] = useState(false);
  const [showParameterSliders, setShowParameterSliders] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'education' | 'detection'>('controls');

  const selectedPlanet = planets.find((p) => p.id === selectedId);

  const handleAddPlanet = () => {
    const newPlanet: PlanetData = {
      id: `planet-${Date.now()}`,
      name: `Planet ${planets.length + 1}`,
      probability: 0.5,
      features: {
        radius: 1.0,
        period: 365,
        distance: 5.0,
        depth: 100,
        duration: 3,
        snr: 5.0,
      },
    };
    addPlanet(newPlanet);
    setSelectedId(newPlanet.id);
  };

  const handleRemovePlanet = (id: string) => {
    removePlanet(id);
    if (selectedId === id) {
      setSelectedId(planets.length > 1 ? planets[0].id : null);
    }
  };

  const updateFeature = (key: keyof PlanetData['features'], value: number) => {
    if (!selectedId) return;
    updatePlanet(selectedId, {
      features: {
        ...selectedPlanet?.features!,
        [key]: value,
      },
    });
  };

  const updateProbability = (value: number) => {
    if (!selectedId) return;
    updatePlanet(selectedId, { probability: value });
  };

  return (
    <>
      {/* Floating button to show panel when hidden */}
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed left-4 top-20 bg-gray-800 text-white rounded-full p-3 z-50 shadow-lg hover:bg-gray-700 transition-all"
        >
          <Eye className="h-5 w-5" />
        </button>
      )}

      {visible && (
      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : -300, y: isMobile ? 300 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        className={`fixed ${
          isMobile 
            ? 'left-2 right-2 bottom-2 h-[60vh]' 
            : 'left-4 bottom-4 w-72'
        } glass-panel overflow-hidden z-40 flex flex-col touch-manipulation`}
        style={{ top: "4rem" }}
        
      >
        {/* Header with tabs */}
        <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-white/10`}>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold`}>Didactic Explorer</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setVisible(!visible)}
                className="inline-flex items-center justify-center gap-2 h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
              >
                {visible ? <EyeOff className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} /> : <Eye className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />}
              </button>
              <Button
                size="sm"
                onClick={handleAddPlanet}
                className={`${isMobile ? 'h-9 px-3' : 'h-8 px-2'} bg-primary hover:bg-primary/90 touch-manipulation`}
              >
                <Plus className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`flex gap-1 bg-black/20 rounded-lg ${isMobile ? 'p-1.5' : 'p-1'}`}>
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 ${isMobile ? 'px-3 py-2' : 'px-2 py-1'} rounded ${isMobile ? 'text-sm' : 'text-xs'} font-medium transition-all touch-manipulation ${
                activeTab === 'controls'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mx-auto ${isMobile ? 'mb-1' : 'mb-1'}`} />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 ${isMobile ? 'px-3 py-2' : 'px-2 py-1'} rounded ${isMobile ? 'text-sm' : 'text-xs'} font-medium transition-all touch-manipulation ${
                activeTab === 'education'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mx-auto ${isMobile ? 'mb-1' : 'mb-1'}`} />
              Learn
            </button>
            <button
              onClick={() => setActiveTab('detection')}
              className={`flex-1 ${isMobile ? 'px-3 py-2' : 'px-2 py-1'} rounded ${isMobile ? 'text-sm' : 'text-xs'} font-medium transition-all touch-manipulation ${
                activeTab === 'detection'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Play className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mx-auto ${isMobile ? 'mb-1' : 'mb-1'}`} />
              Detection
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'controls' && (
            <div className="space-y-4">
              {/* Planet List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Planets</h3>
                {planets.map((planet) => (
                  <div
                    key={planet.id}
                    className={`glass-panel p-3 rounded-lg cursor-pointer transition-all ${
                      selectedId === planet.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedId(planet.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{planet.name || planet.id}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlanet(planet.id);
                        }}
                        className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Controls */}
              {selectedPlanet && (
                <div className="space-y-4">
                  <div className="glass-panel p-3 rounded-lg bg-primary/10 border-primary/30">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Adjust the parameters to see real-time changes in the 3D visualization.
                      </p>
                    </div>
                  </div>

                  <ControlSlider
                    label="Probability"
                    value={selectedPlanet.probability || 0.5}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={updateProbability}
                    unit="%"
                    displayMultiplier={100}
                  />

                  <ControlSlider
                    label="Radious (Earth)"
                    value={selectedPlanet.features.radius}
                    min={0.3}
                    max={10}
                    step={0.1}
                    onChange={(v) => updateFeature('radius', v)}
                    unit="R⊕"
                  />

                  <ControlSlider
                    label="Orbital Period (days)"
                    value={selectedPlanet.features.period}
                    min={1}
                    max={1000}
                    step={1}
                    onChange={(v) => updateFeature('period', v)}
                    unit="d"
                  />

                  <ControlSlider
                    label="Distance (AU)"
                    value={selectedPlanet.features.distance}
                    min={1}
                    max={20}
                    step={0.5}
                    onChange={(v) => updateFeature('distance', v)}
                    unit="AU"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setModalTopic('what-is-exoplanet');
                    setShowInfoModal(true);
                  }}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  What is an Exoplanet?
                </Button>

                <Button
                  onClick={() => {
                    setModalTopic('planet-types');
                    setShowInfoModal(true);
                  }}
                  className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Exoplanetas types
                </Button>

                <Button
                  onClick={() => setShowDetectionMethods(true)}
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Detection Methods
                </Button>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Specific Methods
                  </h4>
                  
                  <Button
                    onClick={() => {
                      setShowTransitCurve(true);
                    }}
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-sm"
                    size="sm"
                  >
                    <Play className="h-3 w-3 mr-2" />
                    Transit Method
                  </Button>

                  <Button
                    onClick={() => {
                      setModalTopic('radial-velocity');
                      setShowInfoModal(true);
                    }}
                    className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-sm"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Radial Speed
                  </Button>

                  <Button
                    onClick={() => {
                      setModalTopic('microlensing');
                      setShowInfoModal(true);
                    }}
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-sm"
                    size="sm"
                  >
                    <BookOpen className="h-3 w-3 mr-2" />
                    Gravitational Microlensing
                  </Button>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Datos del Planeta Seleccionado</h4>
                  {selectedPlanet ? (
                    <div className="space-y-1 text-xs">
                      <div>Radious: {selectedPlanet.features.radius.toFixed(1)} R⊕</div>
                      <div>Period: {selectedPlanet.features.period} días</div>
                      <div>Distance: {selectedPlanet.features.distance} UA</div>
                      <div>Probability: {((selectedPlanet.probability || 0.5) * 100).toFixed(0)}%</div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Select a planet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detection' && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-lg bg-primary/10 border-primary/30">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Detection Methods
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Explore how scientists detect exoplanets using different techniques.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowTransitCurve(true)}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Transit Method
                </Button>

                <Button
                  onClick={() => {
                    setModalTopic('radial-velocity');
                    setShowInfoModal(true);
                  }}
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Radial Speed
                </Button>

                <Button
                  onClick={() => {
                    setModalTopic('microlensing');
                    setShowInfoModal(true);
                  }}
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gravitational Microlensing
                </Button>
              </div>

              {selectedPlanet && (
                <div className="glass-panel p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Planeta Analysis</h4>
                  <div className="space-y-1 text-xs">
                    <div>Transit Depth: ~{(selectedPlanet.features.radius * selectedPlanet.features.radius * 100).toFixed(0)} ppm</div>
                    <div>Duration: ~{(selectedPlanet.features.radius * 2).toFixed(1)} hours</div>
                    <div>Type: {selectedPlanet.features.radius < 1.5 ? 'Rocoso' : selectedPlanet.features.radius < 4 ? 'Neptuno' : 'Gigante Gaseoso'}</div>
                    <div>Detectability: {selectedPlanet.probability && selectedPlanet.probability > 0.7 ? 'Alta' : selectedPlanet.probability && selectedPlanet.probability > 0.4 ? 'Media' : 'Baja'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      )}

      {/* Modals and Overlays */}
      <ExoplanetInfoModal 
        isOpen={showInfoModal} 
        onClose={() => {
          setShowInfoModal(false);
          setModalTopic(null);
        }}
        topic={modalTopic}
      />

      {showTransitCurve && (
        <TransitLightCurve
          isActive={showTransitCurve}
          planetRadius={selectedPlanet?.features.radius || 1.0}
          orbitalPeriod={selectedPlanet?.features.period || 365}
          onInfoClick={() => {
            setModalTopic('transit-method');
            setShowInfoModal(true);
          }}
          onClose={() => setShowTransitCurve(false)}
        />
      )}

      {showDetectionMethods && (
        <DetectionMethodsMenu
          isOpen={showDetectionMethods}
          onToggle={() => setShowDetectionMethods(!showDetectionMethods)}
          onMethodSelect={(methodId) => {
            // Handle method selection if needed
          }}
          onStartTransitSimulation={() => {
            setShowDetectionMethods(false);
            setShowTransitCurve(true);
          }}
          selectedMethod={null}
        />
      )}

      {showParameterSliders && selectedPlanet && (
        <PlanetParameterSliders
          isVisible={showParameterSliders}
          onParametersChange={(params) => {
            updatePlanet(selectedPlanet.id, {
              features: {
                ...selectedPlanet.features,
                radius: params.radius,
                distance: params.distance,
                period: params.period
              }
            });
          }}
          initialParams={{
            radius: selectedPlanet.features.radius,
            distance: selectedPlanet.features.distance,
            period: selectedPlanet.features.period
          }}
        />
      )}
    </>
  );
};

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  displayMultiplier?: number;
}

const ControlSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  displayMultiplier = 1,
}: ControlSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className="text-sm font-semibold text-foreground">
          {(value * displayMultiplier).toFixed(displayMultiplier === 100 ? 0 : 2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="control-slider"
      />
    </div>
  );
};
