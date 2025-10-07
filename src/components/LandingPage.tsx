import { motion } from 'framer-motion';
import { FlaskConical, Telescope, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedStarField } from './AnimatedStarField';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandingPageProps {
  onSelectMode: (mode: 'didactic' | 'professional') => void;
}

export const LandingPage = ({ onSelectMode }: LandingPageProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Deep space gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
      
      {/* Enhanced animated star field background */}
      <AnimatedStarField />
      
      {/* Central cross light effect - inspired by reference image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Vertical light beam */}
        <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-yellow-300/90 to-transparent blur-sm" />
        <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-100/80 to-transparent" />
        
        {/* Horizontal light beam */}
        <div className="absolute h-1 w-full bg-gradient-to-r from-transparent via-yellow-300/90 to-transparent blur-sm" />
        <div className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-100/80 to-transparent" />
        
        {/* Central bright core */}
        <div className="absolute w-8 h-8 bg-white/90 rounded-full blur-md" />
        <div className="absolute w-4 h-4 bg-yellow-100 rounded-full blur-sm" />
        <div className="absolute w-2 h-2 bg-white rounded-full" />
        
        {/* Radial glow effect */}
        <div className="absolute w-96 h-96 bg-gradient-radial from-orange-400/20 via-yellow-300/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute w-64 h-64 bg-gradient-radial from-white/30 via-yellow-200/20 to-transparent rounded-full blur-2xl" />
      </motion.div>
      
      {/* Enhanced atmospheric overlays for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Main content */}
      <div className={`relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto ${isMobile ? 'py-8' : ''}`}>
        {/* Logo icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className={`flex justify-center ${isMobile ? 'mb-6' : 'mb-8'}`}
        >
          <div className={`${isMobile ? 'p-4' : 'p-6'} bg-white/10 backdrop-blur-sm rounded-full border border-white/20`}>
            <Rocket className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-cyan-400`} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`${isMobile ? 'mb-4' : 'mb-6'}`}
        >
          <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-7xl'} font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]`}>
            Exo {' '}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text"
              style={{
                color: '#60a5fa', // Fallback color (blue-400)
                textShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(147, 51, 234, 0.6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                // Ensure text is visible if gradient fails
                background: 'linear-gradient(to right, #67e8f9, #60a5fa, #c084fc)',
                backgroundSize: '100%',
                backgroundRepeat: 'repeat'
              }}
            >
              Vision
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className={`${isMobile ? 'text-lg mb-8' : 'text-xl md:text-2xl mb-12'} text-blue-100 max-w-3xl mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] [text-shadow:_1px_1px_3px_rgb(0_0_0_/_90%)]`}
        >
          Explore how NASA detects exoplanets using real data and AI

        </motion.p>

        {/* Enhanced Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className={`flex flex-col ${isMobile ? 'gap-6 px-4' : 'lg:flex-row gap-12'} justify-center items-center mt-12`}
        >
          {/* Didactic Button */}
          <motion.div
            whileHover={!isMobile ? { scale: 1.05, y: -5 } : {}}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              onClick={() => onSelectMode('didactic')}
              size={isMobile ? "default" : "lg"}
              className={`group relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 text-white font-bold ${isMobile ? 'px-6 py-4 w-full max-w-sm' : 'px-10 py-6'} rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 border border-cyan-400/20 touch-manipulation`}
            >
              <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <FlaskConical className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'} group-hover:rotate-12 transition-transform duration-300`} />
                </div>
                <div className="text-left">
                  <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>Didactic Mode</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90 font-medium`}>Learn about exoplanets</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <Sparkles className="absolute top-2 right-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>

          {/* Professional Button */}
          <motion.div
            whileHover={!isMobile ? { scale: 1.05, y: -5 } : {}}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              onClick={() => onSelectMode('professional')}
              size={isMobile ? "default" : "lg"}
              className={`group relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 hover:from-purple-400 hover:via-pink-400 hover:to-rose-500 text-white font-bold ${isMobile ? 'px-6 py-4 w-full max-w-sm' : 'px-10 py-6'} rounded-2xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 border border-purple-400/20 touch-manipulation`}
            >
              <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <Telescope className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'} group-hover:rotate-12 transition-transform duration-300`} />
                </div>
                <div className="text-left">
                  <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>Profesional Mode</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90 font-medium`}>Analysis with AI</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <Sparkles className="absolute top-2 right-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Additional info text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-blue-200/90 text-center mt-8 max-w-2xl mx-auto drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]"
        >
          Discover how scientists detect distant worlds using real data from space missions like Kepler and TESS
        </motion.p>

        {/* Info text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-12 text-sm text-blue-300/80 drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]"
        >
          <p>Didactic Mode: Experiment with iterative parameters</p>
          <p>Profesional Mode: Analyze real data with AI</p>
        </motion.div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};
