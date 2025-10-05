import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, Upload, FileText, BarChart3 } from 'lucide-react';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { PlanetData } from '@/types/exoplanet';
import { ProfessionalUploader } from './ProfessionalUploader';
import { Professional3DVisualization } from './Professional3DVisualization';
import { useIsMobile } from '@/hooks/use-mobile';

// CSV simulado basado en datos reales
const SIMULATED_CSV_DATA: PlanetData[] = [
  { id: '1', name: 'Kepler-22b', probability: 0.91, features: { radius: 2.4, period: 289.9, distance: 8.5, depth: 400, snr: 18.2 }, isExoplanet: true },
  { id: '2', name: 'KOI-351c', probability: 0.82, features: { radius: 1.8, period: 331.6, distance: 7.2, depth: 120, snr: 9.1 }, isExoplanet: true },
  { id: '3', name: 'KIC-8462852', probability: 0.25, features: { radius: 1.0, period: 700.0, distance: 12.1, depth: 40, snr: 2.5 }, isExoplanet: false },
  { id: '4', name: 'Kepler-9b', probability: 0.88, features: { radius: 1.2, period: 19.2, distance: 2.1, depth: 210, snr: 11.0 }, isExoplanet: true },
  { id: '5', name: 'TESS-1013', probability: 0.33, features: { radius: 0.8, period: 4.2, distance: 1.5, depth: 60, snr: 3.3 }, isExoplanet: false },
  { id: '6', name: 'Kepler-10c', probability: 0.76, features: { radius: 1.4, period: 45.3, distance: 3.8, depth: 80, snr: 4.8 }, isExoplanet: true },
  { id: '7', name: 'KOI-12b', probability: 0.20, features: { radius: 0.9, period: 17.3, distance: 2.0, depth: 30, snr: 2.0 }, isExoplanet: false },
  { id: '8', name: 'WASP-12b', probability: 0.95, features: { radius: 1.8, period: 1.1, distance: 0.8, depth: 600, snr: 23.7 }, isExoplanet: true },
  { id: '9', name: 'TOI-700d', probability: 0.74, features: { radius: 1.1, period: 37.4, distance: 3.2, depth: 90, snr: 5.6 }, isExoplanet: true },
  { id: '10', name: 'K2-18b', probability: 0.68, features: { radius: 2.3, period: 33.0, distance: 2.8, depth: 70, snr: 4.0 }, isExoplanet: true },
];

export const ProfessionalView = ({ endpoint = '/analyze' }: { endpoint?: string }) => {
  const { planets, setPlanets } = usePlanetsStore();
  const isMobile = useIsMobile();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hasUploadedData, setHasUploadedData] = useState(false);

  // Show data only after upload
  useEffect(() => {
    if (!hasUploadedData) {
      setSelectedPlanet(null);
    }
  }, [hasUploadedData]);

  const displayPlanets = planets.length > 0 ? planets : [];
  const showData = hasUploadedData && displayPlanets.length > 0;

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Uploader panel */}
      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : -300, y: isMobile ? -300 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        className={"fixed left-4 bottom-4 w-96 glass-panel overflow-hidden z-40 touch-manipulation"}
        style={{ top: '2rem' }}
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

              {/* Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {displayPlanets.slice(0, 6).map((planet, index) => {
                  const isExoplanet = planet.isExoplanet ?? (planet.probability ?? 0) > 0.5;
                  return (
                    <motion.div
                      key={planet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        isExoplanet 
                          ? "bg-green-900/20 border-green-400/30 hover:bg-green-900/30" 
                          : "bg-red-900/20 border-red-400/30 hover:bg-red-900/30"
                      }`}
                      onClick={() => setSelectedPlanet(planet)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-white text-sm">
                          {planet.name || `Candidato ${index + 1}`}
                        </h4>
                        {isExoplanet ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-300">Probabilidad</span>
                          <span className={`text-sm font-bold ${isExoplanet ? 'text-green-400' : 'text-red-400'}`}>
                            {Math.round((planet.probability ?? 0.5) * 100)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isExoplanet ? 'bg-green-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${(planet.probability ?? 0.5) * 100}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-2">
                          <div>Radio: {planet.features.radius.toFixed(1)} R⊕</div>
                          <div>Período: {planet.features.period.toFixed(1)} días</div>
                        </div>
                        
                        <div className={`text-xs font-medium mt-2 ${isExoplanet ? 'text-green-400' : 'text-red-400'}`}>
                          {isExoplanet ? "✓ Exoplaneta" : "✗ Falso positivo"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-400`} />
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-green-400`}>
                                  {isMobile ? 'Exo' : 'Exoplaneta'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <XCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-400`} />
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-red-400`}>
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
