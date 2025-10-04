import { create } from 'zustand';
import { PlanetData } from '@/types/exoplanet';

interface PlanetsState {
  planets: PlanetData[];
  selectedPlanet: PlanetData | null;
  hoveredPlanet: PlanetData | null;
  setPlanets: (planets: PlanetData[]) => void;
  updatePlanet: (id: string, updates: Partial<PlanetData>) => void;
  addPlanet: (planet: PlanetData) => void;
  removePlanet: (id: string) => void;
  selectPlanet: (planet: PlanetData | null) => void;
  setHoveredPlanet: (planet: PlanetData | null) => void;
}

export const usePlanetsStore = create<PlanetsState>((set) => ({
  planets: [],
  selectedPlanet: null,
  hoveredPlanet: null,
  
  setPlanets: (planets) => set({ planets }),
  
  updatePlanet: (id, updates) =>
    set((state) => ({
      planets: state.planets.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  addPlanet: (planet) =>
    set((state) => ({
      planets: [...state.planets, planet],
    })),
  
  removePlanet: (id) =>
    set((state) => ({
      planets: state.planets.filter((p) => p.id !== id),
      selectedPlanet: state.selectedPlanet?.id === id ? null : state.selectedPlanet,
    })),
  
  selectPlanet: (planet) => set({ selectedPlanet: planet }),
  
  setHoveredPlanet: (planet) => set({ hoveredPlanet: planet }),
}));
