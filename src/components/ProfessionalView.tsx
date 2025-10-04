import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { PlanetData } from '@/types/exoplanet';
import { ProfessionalUploader } from './ProfessionalUploader';

// Mock data simulado
const MOCK_EXOPLANETS: PlanetData[] = [
  { id: '1', name: 'Kepler-22b', probability: 0.87, features: { radius: 2.4, period: 290, distance: 8.5 }, isExoplanet: true },
  { id: '2', name: 'Kepler-452b', probability: 0.92, features: { radius: 1.6, period: 385, distance: 10.2 }, isExoplanet: true },
  { id: '3', name: 'KOI-1234', probability: 0.23, features: { radius: 0.8, period: 120, distance: 4.5 }, isExoplanet: false },
  { id: '4', name: 'Kepler-186f', probability: 0.78, features: { radius: 1.1, period: 130, distance: 6.3 }, isExoplanet: true },
  { id: '5', name: 'KOI-5678', probability: 0.15, features: { radius: 0.6, period: 45, distance: 2.1 }, isExoplanet: false },
  { id: '6', name: 'Kepler-442b', probability: 0.89, features: { radius: 1.3, period: 112, distance: 5.8 }, isExoplanet: true },
  { id: '7', name: 'KOI-9012', probability: 0.31, features: { radius: 1.0, period: 200, distance: 7.5 }, isExoplanet: false },
  { id: '8', name: 'Kepler-62f', probability: 0.85, features: { radius: 1.4, period: 267, distance: 9.1 }, isExoplanet: true },
];

export const ProfessionalView = ({ endpoint = '/analyze' }: { endpoint?: string }) => {
  const { planets, setPlanets } = usePlanetsStore();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  // Inicializar con datos mock si no hay planetas
  useEffect(() => {
    if (planets.length === 0) {
      setPlanets(MOCK_EXOPLANETS);
    }
  }, [planets.length, setPlanets]);

  const displayPlanets = planets.length > 0 ? planets : MOCK_EXOPLANETS;

  return (
    <div className="pt-20 min-h-screen bg-background relative">
      {/* Uploader panel */}
      <ProfessionalUploader endpoint={endpoint} />

      {/* Main content - Split view */}
      <div className="ml-[416px] h-screen flex">
        {/* Left side - Data table (70%) */}
        <div className="w-[70%] p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Análisis de Candidatos a Exoplanetas
              </h2>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Probabilidad</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Radio (R⊕)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Período (días)</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPlanets.map((planet, index) => {
                    const isExoplanet = planet.isExoplanet ?? (planet.probability ?? 0) > 0.5;
                    return (
                      <motion.tr
                        key={planet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-border hover:bg-accent/50 cursor-pointer transition-colors ${
                          selectedPlanet?.id === planet.id ? 'bg-accent/30' : ''
                        }`}
                        onClick={() => setSelectedPlanet(planet)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {planet.name || planet.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {((planet.probability ?? 0.5) * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {planet.features.radius.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {planet.features.period.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isExoplanet ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-semibold">Exoplaneta</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-semibold">Falso Positivo</span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right side - 3D Visualization (30%) */}
        <div className="w-[30%] p-6 border-l border-border">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Visualización 3D</h3>
            
            {selectedPlanet ? (
              <div className="flex-1 flex flex-col items-center justify-center glass-panel rounded-lg p-6">
                {/* Animated planet visualization */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className={`w-32 h-32 rounded-full mb-6 ${
                    (selectedPlanet.isExoplanet ?? (selectedPlanet.probability ?? 0) > 0.5)
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50'
                      : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
                </motion.div>

                {/* Planet info */}
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold text-foreground">
                    {selectedPlanet.name || selectedPlanet.id}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Probabilidad: {((selectedPlanet.probability ?? 0.5) * 100).toFixed(0)}%
                  </p>
                  <div className="pt-4 space-y-1 text-xs text-muted-foreground">
                    <p>Radio: {selectedPlanet.features.radius.toFixed(2)} R⊕</p>
                    <p>Período: {selectedPlanet.features.period.toFixed(0)} días</p>
                    <p>Distancia: {selectedPlanet.features.distance.toFixed(1)} AU</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center glass-panel rounded-lg p-6">
                <p className="text-center text-muted-foreground">
                  Selecciona un planeta de la tabla para ver su visualización
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
