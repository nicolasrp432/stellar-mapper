import { motion } from 'framer-motion';
import { FlaskConical, Telescope, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onSelectMode: (mode: 'didactic' | 'professional') => void;
}

export const LandingPage = ({ onSelectMode }: LandingPageProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-purple-950 to-black">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Logo icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Rocket className="h-16 w-16 text-cyan-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-2">
            ExoPlanet{' '}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            >
              Explorer
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
        >
          Explora cómo la NASA detecta exoplanetas con datos reales e IA
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          {/* Didactic Button */}
          <Button
            onClick={() => onSelectMode('didactic')}
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-400/70 min-w-[250px]"
          >
            <FlaskConical className="h-6 w-6 mr-3" />
            <span>🌍 Didactic Mode</span>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 0.5 }}
            />
          </Button>

          {/* Professional Button */}
          <Button
            onClick={() => onSelectMode('professional')}
            className="group relative overflow-hidden bg-green-600 hover:bg-green-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-green-400/70 min-w-[250px]"
          >
            <Telescope className="h-6 w-6 mr-3" />
            <span>🔬 Professional Mode</span>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 0.5 }}
            />
          </Button>
        </motion.div>

        {/* Info text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-12 text-sm text-gray-400"
        >
          <p>Modo Didáctico: Experimenta con parámetros interactivos</p>
          <p>Modo Profesional: Analiza datos reales con IA</p>
        </motion.div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};
