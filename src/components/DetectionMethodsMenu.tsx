import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Activity, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Play
} from 'lucide-react';

interface DetectionMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
}

interface DetectionMethodsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onMethodSelect: (methodId: string) => void;
  onStartTransitSimulation: () => void;
  selectedMethod: string | null;
}

const detectionMethods: DetectionMethod[] = [
  {
    id: 'transit',
    name: 'Método de Tránsito',
    icon: Eye,
    description: 'Detecta planetas cuando pasan frente a su estrella',
    details: [
      'Mide la disminución del brillo estelar',
      'Permite determinar el tamaño del planeta',
      'Método más exitoso hasta la fecha',
      'Usado por misiones como Kepler y TESS'
    ],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    id: 'radial-velocity',
    name: 'Velocidad Radial',
    icon: Activity,
    description: 'Detecta el "bamboleo" de la estrella por la gravedad del planeta',
    details: [
      'Mide cambios en el espectro de la estrella',
      'Permite determinar la masa del planeta',
      'Primer método en descubrir exoplanetas',
      'Efectivo para planetas masivos cercanos'
    ],
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    id: 'microlensing',
    name: 'Microlente Gravitacional',
    icon: Zap,
    description: 'Usa el efecto de lente gravitacional para detectar planetas',
    details: [
      'Amplifica la luz de estrellas distantes',
      'Detecta planetas únicos y lejanos',
      'No requiere tránsitos repetidos',
      'Sensible a planetas de masa terrestre'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  }
];

export const DetectionMethodsMenu = ({ 
  isOpen, 
  onToggle, 
  onMethodSelect, 
  onStartTransitSimulation,
  selectedMethod 
}: DetectionMethodsMenuProps) => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleMethodClick = (methodId: string) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
      onMethodSelect(methodId);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 p-3 bg-gray-900 border border-gray-700 rounded-r-lg shadow-lg transition-all duration-300 ${
          isOpen ? 'left-80' : 'left-0'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </motion.button>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-30 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  Métodos de Detección
                </h2>
                <p className="text-sm text-gray-400">
                  Explora las diferentes técnicas para encontrar exoplanetas
                </p>
              </div>

              {/* Methods List */}
              <div className="space-y-4">
                {detectionMethods.map((method) => {
                  const IconComponent = method.icon;
                  const isExpanded = expandedMethod === method.id;
                  const isSelected = selectedMethod === method.id;

                  return (
                    <motion.div
                      key={method.id}
                      className={`border rounded-lg transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      layout
                    >
                      {/* Method Header */}
                      <button
                        onClick={() => handleMethodClick(method.id)}
                        className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${method.bgColor}`}>
                          <IconComponent className={`w-5 h-5 ${method.color}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">
                            {method.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {method.description}
                          </p>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-3">
                              {/* Details */}
                              <div className="space-y-2">
                                {method.details.map((detail, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-2 text-sm text-gray-300"
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                    <span>{detail}</span>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Action Button for Transit Method */}
                              {method.id === 'transit' && (
                                <motion.button
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                  onClick={onStartTransitSimulation}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                >
                                  <Play className="w-4 h-4" />
                                  Simular Tránsito
                                </motion.button>
                              )}

                              {/* Coming Soon for other methods */}
                              {method.id !== 'transit' && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm"
                                >
                                  <Info className="w-4 h-4" />
                                  Simulación próximamente
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">
                  ¿Sabías que...?
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Cada método de detección nos proporciona información diferente 
                  sobre los exoplanetas. Combinando múltiples técnicas, los 
                  astrónomos pueden caracterizar completamente estos mundos distantes.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>
    </>
  );
};