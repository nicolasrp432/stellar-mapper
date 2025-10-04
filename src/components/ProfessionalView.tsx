import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, Upload, FileText, BarChart3 } from 'lucide-react';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { PlanetData } from '@/types/exoplanet';
import { ProfessionalUploader } from './ProfessionalUploader';
import { Professional3DVisualization } from './Professional3DVisualization';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hasUploadedData, setHasUploadedData] = useState(false);

  // Show mock data only after upload simulation or if data exists
  useEffect(() => {
    if (planets.length === 0 && hasUploadedData) {
      setPlanets(MOCK_EXOPLANETS);
    }
  }, [planets.length, setPlanets, hasUploadedData]);

  const displayPlanets = planets.length > 0 ? planets : [];
  const showData = displayPlanets.length > 0;

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Uploader panel */}
      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : -300, y: isMobile ? -300 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        className={`fixed ${
          isMobile 
            ? 'left-2 right-2 top-2 h-auto max-h-[40vh]' 
            : 'left-4 top-4 bottom-4 w-96'
        } glass-panel overflow-hidden z-40 touch-manipulation`}
      >
        <ProfessionalUploader 
          endpoint={endpoint} 
          onDataUploaded={() => setHasUploadedData(true)}
        />
      </motion.div>

      {!showData ? (
        /* No data state - Upload prompt */
        <div className="ml-[416px] h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="mb-8">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Modo Profesional
              </h2>
              <p className="text-muted-foreground">
                Sube un archivo CSV para comenzar el análisis de candidatos a exoplanetas
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Formato CSV</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  El archivo debe contener columnas para: nombre, radio, período, distancia, y probabilidad
                </p>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Análisis Avanzado</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Visualización 3D realista, clasificación automática, y métricas detalladas
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Data view - Responsive layout */
        <div className={`${isMobile ? 'pt-[45vh] px-2' : 'ml-[416px]'} h-full ${isMobile ? 'block' : 'flex'}`}>
          {/* Data table section */}
          <div className={`${isMobile ? 'w-full mb-4' : 'w-[60%]'} ${isMobile ? 'p-3' : 'p-6'} overflow-y-auto`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Análisis de Candidatos a Exoplanetas
                </h2>
                <div className="ml-auto text-sm text-muted-foreground">
                  {displayPlanets.length} candidatos analizados
                </div>
              </div>

              {/* Statistics cards */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2 mb-4' : 'grid-cols-3 gap-4 mb-6'}`}>
                <div className="glass-panel p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {displayPlanets.filter(p => (p.isExoplanet ?? (p.probability ?? 0) > 0.5)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Exoplanetas</div>
                </div>
                <div className="glass-panel p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {displayPlanets.filter(p => !(p.isExoplanet ?? (p.probability ?? 0) > 0.5)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Falsos Positivos</div>
                </div>
                <div className="glass-panel p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(displayPlanets.reduce((acc, p) => acc + (p.probability ?? 0.5), 0) / displayPlanets.length * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confianza Promedio</div>
                </div>
              </div>

              {/* Table */}
              <div className="glass-panel rounded-lg overflow-hidden">
                <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
                  <table className={`w-full ${isMobile ? 'min-w-[600px]' : ''}`}>
                    <thead className="bg-primary/10 border-b border-border">
                      <tr>
                        <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-left font-semibold text-foreground`}>Nombre</th>
                        <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-left font-semibold text-foreground`}>Probabilidad</th>
                        <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-left font-semibold text-foreground`}>Radio (R⊕)</th>
                        <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-left font-semibold text-foreground`}>Período (días)</th>
                        <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-center font-semibold text-foreground`}>Estado</th>
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
                          className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors touch-manipulation ${
                            selectedPlanet?.id === planet.id ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => setSelectedPlanet(planet)}
                        >
                          <td className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} font-medium text-foreground`}>
                            {planet.name || `Candidato ${index + 1}`}
                          </td>
                          <td className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`${isMobile ? 'w-12 h-1.5' : 'w-16 h-2'} bg-muted rounded-full overflow-hidden`}>
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                                  style={{ width: `${(planet.probability ?? 0.5) * 100}%` }}
                                />
                              </div>
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
                                {((planet.probability ?? 0.5) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-muted-foreground`}>
                            {planet.features.radius.toFixed(2)}
                          </td>
                          <td className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} text-muted-foreground`}>
                            {planet.features.period.toFixed(1)}
                          </td>
                          <td className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'} text-center`}>
                            {isExoplanet ? (
                              <div className="flex items-center justify-center gap-1">
                                <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
                                <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-green-500`}>
                                  {isMobile ? 'Exo' : 'Exoplaneta'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <XCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-red-500`} />
                                <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-red-500`}>
                                  {isMobile ? 'Falso' : 'Falso Positivo'}
                                </span>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            </motion.div>
          </div>

          {/* Right side - 3D Visualization (40%) */}
          <div className={`${isMobile ? 'w-full mt-4' : 'w-[40%]'} ${isMobile ? '' : 'border-l border-border'}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full flex flex-col"
            >
              <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-border`}>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-foreground`}>Visualización 3D</h3>
                {selectedPlanet && (
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    {selectedPlanet.name || selectedPlanet.id}
                  </p>
                )}
              </div>
              
              <div className="flex-1">
                {selectedPlanet ? (
                  <div className={`${isMobile ? 'h-48' : 'h-full'}`}>
                    <Professional3DVisualization planetData={selectedPlanet} />
                  </div>
                ) : (
                  <div className={`h-full flex items-center justify-center ${isMobile ? 'p-4' : 'p-6'}`}>
                    <div className="text-center">
                      <Info className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground mx-auto mb-4`} />
                      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {isMobile ? 'Selecciona un candidato' : 'Selecciona un candidato de la tabla para ver su visualización 3D'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
