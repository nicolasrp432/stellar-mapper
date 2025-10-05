import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Telescope, Zap, Eye, Star, Orbit, Waves, Search, BookOpen, ArrowRight } from 'lucide-react';

interface ExoplanetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: 'what-is-exoplanet' | 'detection-methods' | 'transit-method' | 'radial-velocity' | 'microlensing' | 'planet-types';
}

// SVG Illustration Components
const ExoplanetSystemSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-32 mb-4">
    {/* Star */}
    <circle cx="100" cy="100" r="20" fill="#FFD700" className="animate-pulse">
      <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Orbital paths */}
    <ellipse cx="100" cy="100" rx="60" ry="15" fill="none" stroke="#4A90E2" strokeWidth="1" opacity="0.5" />
    <ellipse cx="100" cy="100" rx="100" ry="25" fill="none" stroke="#4A90E2" strokeWidth="1" opacity="0.3" />
    <ellipse cx="100" cy="100" rx="140" ry="35" fill="none" stroke="#4A90E2" strokeWidth="1" opacity="0.2" />
    
    {/* Planets */}
    <circle cx="160" cy="100" r="4" fill="#8B4513">
      <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="8s" repeatCount="indefinite" />
    </circle>
    <circle cx="200" cy="100" r="8" fill="#FF6B35">
      <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="15s" repeatCount="indefinite" />
    </circle>
    <circle cx="240" cy="100" r="6" fill="#4A90E2">
      <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="25s" repeatCount="indefinite" />
    </circle>
    
    {/* Labels */}
    <text x="100" y="140" textAnchor="middle" fill="#FFF" fontSize="12">Estrella</text>
    <text x="300" y="50" fill="#FFF" fontSize="10">Exoplanetas</text>
  </svg>
);

const TransitMethodSVG = () => (
  <svg viewBox="0 0 400 150" className="w-full h-24 mb-4">
    {/* Star */}
    <circle cx="200" cy="75" r="30" fill="#FFD700" />
    
    {/* Planet transit */}
    <circle cx="150" cy="75" r="8" fill="#333" opacity="0.8">
      <animateTransform attributeName="transform" type="translate" values="-100 0;100 0;-100 0" dur="6s" repeatCount="indefinite" />
    </circle>
    
    {/* Light rays */}
    <g stroke="#FFD700" strokeWidth="2" opacity="0.6">
      <line x1="120" y1="45" x2="80" y2="20" />
      <line x1="120" y1="105" x2="80" y2="130" />
      <line x1="280" y1="45" x2="320" y2="20" />
      <line x1="280" y1="105" x2="320" y2="130" />
    </g>
    
    {/* Observer */}
    <circle cx="350" cy="75" r="5" fill="#4A90E2" />
    <text x="350" y="95" textAnchor="middle" fill="#FFF" fontSize="10">Tierra</text>
  </svg>
);

const RadialVelocitySVG = () => (
  <svg viewBox="0 0 400 150" className="w-full h-24 mb-4">
    {/* Star wobble */}
    <circle cx="200" cy="75" r="15" fill="#FFD700">
      <animateTransform attributeName="transform" type="translate" values="0 0;10 0;0 0;-10 0;0 0" dur="4s" repeatCount="indefinite" />
    </circle>
    
    {/* Planet orbit */}
    <circle cx="250" cy="75" r="6" fill="#8B4513">
      <animateTransform attributeName="transform" type="rotate" values="0 200 75;360 200 75" dur="4s" repeatCount="indefinite" />
    </circle>
    
    {/* Orbital path */}
    <ellipse cx="200" cy="75" rx="50" ry="12" fill="none" stroke="#4A90E2" strokeWidth="1" opacity="0.5" />
    
    {/* Velocity arrows */}
    <g stroke="#FF6B35" strokeWidth="2" fill="#FF6B35">
      <line x1="180" y1="60" x2="170" y2="60" markerEnd="url(#arrowhead)" />
      <line x1="220" y1="90" x2="230" y2="90" markerEnd="url(#arrowhead)" />
    </g>
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#FF6B35" />
      </marker>
    </defs>
    
    <text x="200" y="120" textAnchor="middle" fill="#FFF" fontSize="10">Bamboleo estelar</text>
  </svg>
);

const PlanetTypesSVG = () => (
  <svg viewBox="0 0 400 120" className="w-full h-20 mb-4">
    {/* Rocky planet */}
    <circle cx="80" cy="60" r="15" fill="#8B4513" />
    <text x="80" y="85" textAnchor="middle" fill="#FFF" fontSize="10">Rocoso</text>
    
    {/* Gas giant */}
    <circle cx="200" cy="60" r="25" fill="#FF6B35" />
    <ellipse cx="200" cy="60" rx="35" ry="3" fill="#D2691E" opacity="0.7" />
    <text x="200" y="95" textAnchor="middle" fill="#FFF" fontSize="10">Gigante Gaseoso</text>
    
    {/* Ice world */}
    <circle cx="320" cy="60" r="12" fill="#87CEEB" />
    <text x="320" y="85" textAnchor="middle" fill="#FFF" fontSize="10">Mundo Helado</text>
  </svg>
);

// Type definition for modal content
interface ModalContentItem {
  title: string;
  icon: React.ComponentType<any>;
  illustration?: React.ComponentType;
  content: Array<{
    subtitle: string;
    text: string;
  }>;
}

type ModalContentMap = {
  [K in ExoplanetInfoModalProps['topic']]: ModalContentItem;
};

const modalContent: ModalContentMap = {
  'what-is-exoplanet': {
    title: 'What is an Exoplanet?',
    icon: Globe,
    illustration: ExoplanetSystemSVG,
    content: [
      {
        subtitle: 'Definition',
        text: 'An exoplanet is a planet that orbits a star other than the Sun. They are also known as extrasolar planets. These distant worlds can be very different from the planets in our solar system.',
      },
      {
        subtitle: 'Diversity of Worlds',
        text: 'Exoplanets exhibit an incredible diversity: from rocky super-Earths to gas giants larger than Jupiter, including ocean worlds and planets with exotic atmospheres.',
      },
      {
        subtitle: 'Habitable Zone',
        text: 'Some exoplanets are located in the "habitable zone" of their star, where temperatures allow the presence of liquid water on the surface, a key ingredient for life as we know it.',
      },
      {
        subtitle: 'Historical Discoveries',
        text: 'To date, more than 5,400 exoplanets have been confirmed in over 4,000 star systems. The first exoplanet around a Sun-like star was 51 Pegasi b, discovered in 1995.',
      },
    ],
  },
  'planet-types': {
    title: 'Tipos de Exoplanet Types',
    icon: Star,
    illustration: PlanetTypesSVG,
    content: [
      {
        subtitle: 'Rocky Planets',
        text: 'Similar to Earth and Mars, these planets have solid surfaces made primarily of rock and metal. Super-Earths are rocky planets larger than Earth.',
      },
      {
        subtitle: 'Gas Giants',
        text: 'Massive planets composed mainly of hydrogen and helium, like Jupiter and Saturn. "Hot Jupiters" orbit very close to their stars.',
      },
      {
        subtitle: 'Ice Worlds',
        text: 'Cold planets with surfaces covered in ice, similar to Europa or Enceladus. Some may have underground oceans beneath their icy crust.',
      },
      {
        subtitle: 'Ocean Worlds',
        text: 'Worlds completely covered by deep oceans, with no visible continents. These planets could harbor aquatic forms of life.',
      },
    ],
  },
  'detection-methods': {
    title: 'Detection Methods',
    icon: Telescope,
    content: [
      {
        subtitle: 'Transit Method (85%)',
        text: 'The most successful method. It detects the periodic dimming of a star’s brightness when a planet passes in front of it. Missions like Kepler and TESS have revolutionized this field.',
      },
      {
        subtitle: 'Radial Velocity (12%)',
        text: 'It measures the gravitational "wobble" of a star caused by an orbiting planet. It detects changes in the stellar spectrum due to the Doppler effect.',
      },
      {
        subtitle: 'Direct Imaging (1%)',
        text: 'It captures direct photographs of exoplanets, usually young and hot gas giants orbiting far from bright stars.',
      },
      {
        subtitle: 'Gravitational Microlensing (2%)',
        text: 'It uses the gravitational lensing effect when a planetary system passes in front of a distant star, temporarily amplifying its light.',
      },
    ],
  },
  'transit-method': {
    title: 'Transit Method',
    icon: Eye,
    illustration: TransitMethodSVG,
    content: [
      {
        subtitle: 'Physical Principle',
        text: 'When a planet passes in front of its star from our perspective, it blocks a small fraction of the starlight, creating a partial eclipse that we can detect.',
      },
      {
        subtitle: 'Light Curve',
        text: 'The decrease in brightness is recorded as a "light curve" showing a characteristic U-shaped dip. The transit depth reveals the size of the planet.',
      },
      {
        subtitle: 'Derived Information',
        text: 'From transit analysis we obtain: planet radius, orbital period, orbit inclination, and with multiple transits, we can study the planetary atmosphere.',
      },
      {
        subtitle: 'Limitations',
        text: 'It only detects planets whose orbits are aligned with our line of sight. The probability of alignment is higher for planets closer to their star.',
      },
    ],
  },
  'radial-velocity': {
    title: 'Radial Velocity',
    icon: Waves,
    illustration: RadialVelocitySVG,
    content: [
      {
        subtitle: 'Doppler Effect',
        text: 'An orbiting planet causes its star to "wobble" slightly. This movement causes changes in the stellar spectrum due to the Doppler effect: blue when approaching, red when receding.',
      },
      {
        subtitle: 'Precise Measurement',
        text: 'Modern spectrographs can detect velocity changes of just 1 meter per second, equivalent to the speed of a walking person.',
      },
      {
        subtitle: 'Planetary Mass',
        text: 'This method allows determination of the planet’s minimum mass. More massive planets cause more pronounced wobbles in their star.',
      },
      {
        subtitle: 'Detection Bias',
        text: 'Favors detection of massive planets in close orbits. The first exoplanets discovered were "hot Jupiters" for this reason.',
      },
    ],
  },
  'microlensing': {
    title: 'Gravitational Microlensing',
    icon: Search,
    content: [
      {
        subtitle: 'General Relativity',
        text: 'Based on Einstein’s prediction: gravity curves space-time. A star with planets acts as a gravitational lens, amplifying the light of a more distant star.',
      },
      {
        subtitle: 'Unique Events',
        text: 'Each microlensing event is unique and unrepeatable, lasting from days to months. The presence of a planet creates a characteristic anomaly in the amplification curve.',
      },
      {
        subtitle: 'Distant Planets',
        text: 'The only method capable of detecting planets at great distances from Earth, even in the galactic center. It can find low-mass planets and "free-floating" planets without a star.',
      },
      {
        subtitle: 'Challenges',
        text: 'Requires continuous sky monitoring and does not allow follow-up studies of the same planet. Events are unpredictable and not repeatable.',
      },
    ],
  },

};

export const ExoplanetInfoModal = ({ isOpen, onClose, topic }: ExoplanetInfoModalProps) => {
  if (!topic || !isOpen) return null;

  const content = modalContent[topic];
  const IconComponent = content.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <IconComponent className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">{content.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh]">
              {/* Illustration */}
              {content.illustration && (
                <div className="p-6 bg-gray-800 border-b border-gray-700">
                  <div className="flex justify-center">
                    <content.illustration />
                  </div>
                </div>
              )}
              
              {/* Text Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {content.content.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold text-blue-400 flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {section.subtitle}
                      </h3>
                      <p className="text-gray-300 leading-relaxed ml-5 text-sm">
                        {section.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4" />
                <span>Explore the 3D visualization to learn more</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};