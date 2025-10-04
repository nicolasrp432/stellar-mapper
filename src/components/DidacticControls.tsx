import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { PlanetData } from '@/types/exoplanet';

export const DidacticControls = () => {
  const { planets, updatePlanet, addPlanet, removePlanet } = usePlanetsStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    planets.length > 0 ? planets[0].id : null
  );

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
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 top-4 bottom-4 w-80 glass-panel p-6 overflow-y-auto z-40"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Didactic Controls</h2>
        <Button
          size="sm"
          onClick={handleAddPlanet}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        {planets.map((planet) => (
          <div
            key={planet.id}
            className={`glass-panel p-3 rounded-lg cursor-pointer transition-all ${
              selectedId === planet.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedId(planet.id)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{planet.name || planet.id}</span>
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

      {selectedPlanet && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-lg space-y-1 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Adjust parameters below to see real-time changes in the 3D visualization.
                Larger radius = deeper transit, shorter period = faster orbit.
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
            label="Radius (Earth radii)"
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

          {selectedPlanet.features.depth !== undefined && (
            <ControlSlider
              label="Transit Depth (ppm)"
              value={selectedPlanet.features.depth}
              min={10}
              max={5000}
              step={10}
              onChange={(v) => updateFeature('depth', v)}
              unit="ppm"
            />
          )}

          {selectedPlanet.features.duration !== undefined && (
            <ControlSlider
              label="Transit Duration (hours)"
              value={selectedPlanet.features.duration}
              min={0.5}
              max={12}
              step={0.1}
              onChange={(v) => updateFeature('duration', v)}
              unit="h"
            />
          )}
        </div>
      )}
    </motion.div>
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
