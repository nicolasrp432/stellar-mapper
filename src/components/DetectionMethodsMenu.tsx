import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Activity, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Play,
  Target,
  Waves,
  Search
} from 'lucide-react';

interface DetectionMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
  animationComponent: React.ComponentType<{ isActive: boolean }>;
  stats: {
    discovered: number;
    percentage: number;
    sensitivity: string;
  };
}

interface DetectionMethodsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onMethodSelect: (methodId: string) => void;
  onStartTransitSimulation: () => void;
  selectedMethod: string | null;
}

// Animation Components for each detection method
const TransitAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden">
      {/* Star */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-8 h-8 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={isActive ? { scale: [1, 0.8, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Planet */}
      <motion.div
        className="absolute top-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-1/2"
        animate={isActive ? { x: [-20, 120, 240] } : { x: -20 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Light curve visualization */}
      <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-700 rounded">
        <motion.div
          className="h-full bg-blue-400 rounded"
          animate={isActive ? { width: ["0%", "100%"] } : { width: "0%" }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

const RadialVelocityAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Central Star */}
      <motion.div
        className="w-6 h-6 bg-yellow-400 rounded-full"
        animate={isActive ? { 
          x: [0, 5, -5, 0],
          scale: [1, 1.1, 0.9, 1]
        } : { x: 0, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Orbital path */}
      <motion.div
        className="absolute w-16 h-16 border border-green-400 rounded-full opacity-30"
        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Planet */}
      <motion.div
        className="absolute w-2 h-2 bg-green-500 rounded-full"
        animate={isActive ? {
          x: [8, 0, -8, 0, 8],
          y: [0, 8, 0, -8, 0]
        } : { x: 8, y: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Spectral lines */}
      <div className="absolute right-2 top-2 bottom-2 w-8 bg-gray-700 rounded flex flex-col justify-center space-y-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-0.5 bg-green-400 rounded"
            animate={isActive ? { 
              width: ["60%", "80%", "40%", "60%"],
              x: [0, 2, -2, 0]
            } : { width: "60%", x: 0 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "easeInOut" 
            }}
          />
        ))}
      </div>
    </div>
  );
};

const MicrolensingAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden">
      {/* Background star */}
      <motion.div
        className="absolute right-8 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"
        animate={isActive ? { 
          scale: [1, 2, 3, 2, 1],
          opacity: [0.5, 0.8, 1, 0.8, 0.5]
        } : { scale: 1, opacity: 0.5 }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Lensing star system */}
      <motion.div
        className="absolute top-1/2 transform -translate-y-1/2"
        animate={isActive ? { x: [0, 180] } : { x: 0 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        {/* Lensing star */}
        <div className="w-3 h-3 bg-purple-400 rounded-full" />
        {/* Planet */}
        <div className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
      </motion.div>
      
      {/* Light rays */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute right-8 top-1/2 w-20 h-0.5 bg-gradient-to-l from-white to-transparent transform -translate-y-1/2"
          style={{ rotate: `${(i - 1) * 15}deg` }}
          animate={isActive ? { 
            opacity: [0.2, 0.8, 1, 0.8, 0.2],
            scaleX: [0.5, 1.2, 1.5, 1.2, 0.5]
          } : { opacity: 0.2, scaleX: 0.5 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut" 
          }}
        />
      ))}
    </div>
  );
};

const detectionMethods: DetectionMethod[] = [
  {
    id: 'transit',
    name: 'Transit Method',
    icon: Eye,
    description: 'Detects planets when they pass in front of their star',
    details: [
      'Measures the decrease in starlight (0.01-1%)',
      'Allows determination of planet size and orbit',
      'Most successful method: >75% of known exoplanets',
      'Used by missions like Kepler, TESS, and James Webb'
    ],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    animationComponent: TransitAnimation,
    stats: {
      discovered: 3800,
      percentage: 76,
      sensitivity: 'Large and close planets'
    }
  },
  {
    id: 'radial-velocity',
    name: 'Radial Velocity',
    icon: Activity,
    description: 'Detects the star’s "wobble" caused by the planet’s gravity',
    details: [
      'Measures Doppler shifts in the stellar spectrum',
      'Allows determination of the planet’s minimum mass',
      'First successful method (51 Pegasi b, 1995)',
      'Precision up to 1 m/s in stellar velocity'
    ],
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    animationComponent: RadialVelocityAnimation,
    stats: {
      discovered: 950,
      percentage: 19,
      sensitivity: 'Massive and close planets'
    }
  },
  {
    id: 'microlensing',
    name: 'Gravitational Microlensing',
    icon: Zap,
    description: 'Uses the gravitational lensing effect to detect planets',
    details: [
      'Amplifies light from background stars',
      'Detects unique and very distant planets',
      'Sensitive to Earth-mass planets',
      'Unique and unrepeatable events'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    animationComponent: MicrolensingAnimation,
    stats: {
      discovered: 180,
      percentage: 3.6,
      sensitivity: 'Cold and distant planets'
    }
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
  const [animatingMethod, setAnimatingMethod] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && isOpen) {
      const interval = setInterval(() => {
        const currentIndex = detectionMethods.findIndex(m => m.id === animatingMethod);
        const nextIndex = (currentIndex + 1) % detectionMethods.length;
        const nextMethod = detectionMethods[nextIndex];
        
        setAnimatingMethod(nextMethod.id);
        setExpandedMethod(nextMethod.id);
        onMethodSelect(nextMethod.id);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [autoPlay, isOpen, animatingMethod, onMethodSelect]);

  const handleMethodClick = (methodId: string) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
      setAnimatingMethod(null);
    } else {
      setExpandedMethod(methodId);
      setAnimatingMethod(methodId);
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
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">
                    Detection Methods
                  </h2>
                  <motion.button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoPlay 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">
                  Explore the different techniques for finding exoplanets
                </p>

                {/* Global Statistics */}
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Confirmed Exoplanets
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">5,000+</div>
                      <div className="text-gray-400">Total Discovered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">4,000+</div>
                      <div className="text-gray-400">Planetary Systems</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Methods List */}
              <div className="space-y-4">
                {detectionMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  const AnimationComponent = method.animationComponent;
                  const isExpanded = expandedMethod === method.id;
                  const isSelected = selectedMethod === method.id;
                  const isAnimating = animatingMethod === method.id;

                  return (
                    <motion.div
                      key={method.id}
                      className={`border rounded-lg transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
                            <div className="p-4 pt-0 space-y-4">
                              {/* Animation Component */}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <AnimationComponent isActive={isAnimating} />
                              </motion.div>

                              {/* Statistics */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-800/30 rounded-lg p-3"
                              >
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <div className={`text-lg font-bold ${method.color}`}>
                                      {method.stats.discovered.toLocaleString()}
                                    </div>
                                    <div className="text-gray-400">Discovered</div>
                                  </div>
                                  <div>
                                    <div className={`text-lg font-bold ${method.color}`}>
                                      {method.stats.percentage}%
                                    </div>
                                    <div className="text-gray-400">Of the total</div>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                  <div className="text-xs text-gray-400">
                                    <span className="font-medium">Sensibility:</span> {method.stats.sensitivity}
                                  </div>
                                </div>
                              </motion.div>

                              {/* Details */}
                              <div className="space-y-2">
                                {method.details.map((detail, detailIndex) => (
                                  <motion.div
                                    key={detailIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + detailIndex * 0.1 }}
                                    className="flex items-start gap-2 text-sm text-gray-300"
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                      method.color.replace('text-', 'bg-')
                                    }`} />
                                    <span>{detail}</span>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-2">
                                {method.id === 'transit' && (
                                  <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    onClick={onStartTransitSimulation}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Simular Tránsito
                                  </motion.button>
                                )}

                                {/* Interactive Demo Button */}
                                <motion.button
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.7 }}
                                  onClick={() => setAnimatingMethod(isAnimating ? null : method.id)}
                                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                    isAnimating
                                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Target className="w-4 h-4" />
                                  {isAnimating ? 'Pausar Demo' : 'Ver Demo'}
                                </motion.button>

                                {/* Coming Soon for other methods */}
                                {method.id !== 'transit' && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 text-gray-400 rounded-lg text-sm border border-gray-600"
                                  >
                                    <Search className="w-4 h-4" />
                                    Full simulation coming soon
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Enhanced Footer */}
              <div className="mt-8 space-y-4">
                {/* Quick Stats */}
                <motion.div
                  className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-blue-400" />
                    Detection Progress
                  </h4>
                  <div className="space-y-2">
                    {detectionMethods.map((method, index) => (
                      <div key={method.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{method.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${method.bgColor.replace('/20', '')}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${method.stats.percentage}%` }}
                              transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                            />
                          </div>
                          <span className={`font-medium ${method.color}`}>
                            {method.stats.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Did You Know */}
                <motion.div
                  className="bg-gray-800/50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-400" />
                    Did You Know That ...?
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The first confirmed exoplanet around a Sun-like star was
                    <span className="text-blue-400 font-medium"> 51 Pegasi b</span> in 1995, 
                    discovered using the radial velocity method. 
                    Since then, we have found more than 5,000 extrasolar worlds.
                  </p>
                </motion.div>

                {/* Auto-play Status */}
                {autoPlay && (
                  <motion.div
                    className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Automatic mode active
                    </div>
                  </motion.div>
                )}
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