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
    title: '¿Qué es un Exoplaneta?',
    icon: Globe,
    illustration: ExoplanetSystemSVG,
    content: [
      {
        subtitle: 'Definición',
        text: 'Un exoplaneta es un planeta que orbita una estrella diferente al Sol. También se les conoce como planetas extrasolares. Estos mundos distantes pueden ser muy diferentes a los planetas de nuestro sistema solar.',
      },
      {
        subtitle: 'Diversidad de Mundos',
        text: 'Los exoplanetas presentan una increíble diversidad: desde súper-Tierras rocosas hasta gigantes gaseosos más grandes que Júpiter, pasando por mundos oceánicos y planetas con atmósferas exóticas.',
      },
      {
        subtitle: 'Zona Habitable',
        text: 'Algunos exoplanetas se encuentran en la "zona habitable" de su estrella, donde las temperaturas permiten la existencia de agua líquida en superficie, un ingrediente clave para la vida tal como la conocemos.',
      },
      {
        subtitle: 'Descubrimientos Históricos',
        text: 'Hasta la fecha se han confirmado más de 5,400 exoplanetas en más de 4,000 sistemas estelares. El primer exoplaneta alrededor de una estrella similar al Sol fue 51 Pegasi b, descubierto en 1995.',
      },
    ],
  },
  'planet-types': {
    title: 'Tipos de Exoplanetas',
    icon: Star,
    illustration: PlanetTypesSVG,
    content: [
      {
        subtitle: 'Planetas Rocosos',
        text: 'Similares a la Tierra y Marte, estos planetas tienen superficies sólidas compuestas principalmente de roca y metal. Las súper-Tierras son planetas rocosos más grandes que la Tierra.',
      },
      {
        subtitle: 'Gigantes Gaseosos',
        text: 'Planetas masivos compuestos principalmente de hidrógeno y helio, como Júpiter y Saturno. Los "Júpiteres calientes" orbitan muy cerca de sus estrellas.',
      },
      {
        subtitle: 'Mundos Helados',
        text: 'Planetas fríos con superficies cubiertas de hielo, similares a Europa o Encélado. Algunos pueden tener océanos subterráneos bajo su corteza helada.',
      },
      {
        subtitle: 'Planetas Oceánicos',
        text: 'Mundos completamente cubiertos por océanos profundos, sin continentes visibles. Estos planetas podrían albergar formas de vida acuática.',
      },
    ],
  },
  'detection-methods': {
    title: 'Métodos de Detección',
    icon: Telescope,
    content: [
      {
        subtitle: 'Método de Tránsito (85%)',
        text: 'El método más exitoso. Detecta la disminución periódica del brillo estelar cuando un planeta pasa frente a su estrella. Misiones como Kepler y TESS han revolucionado este campo.',
      },
      {
        subtitle: 'Velocidad Radial (12%)',
        text: 'Mide el "bamboleo" gravitacional de una estrella causado por un planeta en órbita. Detecta cambios en el espectro estelar debido al efecto Doppler.',
      },
      {
        subtitle: 'Imagen Directa (1%)',
        text: 'Captura fotografías directas de exoplanetas, generalmente gigantes gaseosos jóvenes y calientes que orbitan lejos de estrellas brillantes.',
      },
      {
        subtitle: 'Microlente Gravitacional (2%)',
        text: 'Utiliza el efecto de lente gravitacional cuando un sistema planetario pasa frente a una estrella distante, amplificando temporalmente su luz.',
      },
    ],
  },
  'transit-method': {
    title: 'Método de Tránsito',
    icon: Eye,
    illustration: TransitMethodSVG,
    content: [
      {
        subtitle: 'Principio Físico',
        text: 'Cuando un planeta pasa frente a su estrella desde nuestra perspectiva, bloquea una pequeña fracción de la luz estelar, creando un eclipse parcial que podemos detectar.',
      },
      {
        subtitle: 'Curva de Luz',
        text: 'La disminución del brillo se registra como una "curva de luz" que muestra una caída característica en forma de U. La profundidad del tránsito revela el tamaño del planeta.',
      },
      {
        subtitle: 'Información Derivada',
        text: 'Del análisis del tránsito obtenemos: radio del planeta, período orbital, inclinación de la órbita, y con múltiples tránsitos, podemos estudiar la atmósfera planetaria.',
      },
      {
        subtitle: 'Limitaciones',
        text: 'Solo detecta planetas cuyas órbitas están alineadas con nuestra línea de visión. La probabilidad de alineación es mayor para planetas cercanos a su estrella.',
      },
    ],
  },
  'radial-velocity': {
    title: 'Velocidad Radial',
    icon: Waves,
    illustration: RadialVelocitySVG,
    content: [
      {
        subtitle: 'Efecto Doppler',
        text: 'Un planeta en órbita hace que su estrella se "bambolee" ligeramente. Este movimiento causa cambios en el espectro estelar debido al efecto Doppler: azul cuando se acerca, rojo cuando se aleja.',
      },
      {
        subtitle: 'Medición Precisa',
        text: 'Los espectrógrafos modernos pueden detectar cambios de velocidad de apenas 1 metro por segundo, equivalente a la velocidad de una persona caminando.',
      },
      {
        subtitle: 'Masa Planetaria',
        text: 'Este método permite determinar la masa mínima del planeta. Planetas más masivos causan bamboleos más pronunciados en su estrella.',
      },
      {
        subtitle: 'Sesgo de Detección',
        text: 'Favorece la detección de planetas masivos en órbitas cercanas. Los primeros exoplanetas descubiertos fueron "Júpiteres calientes" por esta razón.',
      },
    ],
  },
  'microlensing': {
    title: 'Microlente Gravitacional',
    icon: Search,
    content: [
      {
        subtitle: 'Relatividad General',
        text: 'Basado en la predicción de Einstein: la gravedad curva el espacio-tiempo. Una estrella con planetas actúa como una lente gravitacional, amplificando la luz de una estrella más distante.',
      },
      {
        subtitle: 'Eventos Únicos',
        text: 'Cada evento de microlente es único e irrepetible, durando desde días hasta meses. La presencia de un planeta crea una anomalía característica en la curva de amplificación.',
      },
      {
        subtitle: 'Planetas Lejanos',
        text: 'Único método capaz de detectar planetas a grandes distancias de la Tierra, incluso en el centro galáctico. Puede encontrar planetas de baja masa y planetas "flotantes" sin estrella.',
      },
      {
        subtitle: 'Desafíos',
        text: 'Requiere monitoreo continuo del cielo y no permite estudios de seguimiento del mismo planeta. Los eventos son impredecibles y no repetibles.',
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
                <span>Explora la visualización 3D para aprender más</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};