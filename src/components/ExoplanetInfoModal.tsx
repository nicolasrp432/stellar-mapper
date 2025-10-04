import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Telescope, Zap, Eye } from 'lucide-react';

interface ExoplanetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: 'what-is-exoplanet' | 'detection-methods' | 'transit-method' | null;
}

const modalContent = {
  'what-is-exoplanet': {
    title: '¿Qué es un Exoplaneta?',
    icon: Globe,
    content: [
      {
        subtitle: 'Definición',
        text: 'Un exoplaneta es un planeta que orbita una estrella diferente al Sol. También se les conoce como planetas extrasolares.',
      },
      {
        subtitle: 'Características',
        text: 'Los exoplanetas pueden ser rocosos como la Tierra, gigantes gaseosos como Júpiter, o mundos helados. Algunos podrían tener condiciones habitables.',
      },
      {
        subtitle: 'Descubrimientos',
        text: 'Hasta la fecha se han confirmado más de 5,000 exoplanetas. El primer exoplaneta alrededor de una estrella similar al Sol fue descubierto en 1995.',
      },
    ],
  },
  'detection-methods': {
    title: 'Métodos de Detección',
    icon: Telescope,
    content: [
      {
        subtitle: 'Método de Tránsito',
        text: 'Detecta la disminución del brillo de una estrella cuando un planeta pasa frente a ella. Es el método más exitoso.',
      },
      {
        subtitle: 'Velocidad Radial',
        text: 'Mide el "bamboleo" de una estrella causado por la atracción gravitacional de un planeta en órbita.',
      },
      {
        subtitle: 'Microlente Gravitacional',
        text: 'Utiliza el efecto de lente gravitacional cuando un planeta amplifica la luz de una estrella distante.',
      },
    ],
  },
  'transit-method': {
    title: 'Método de Tránsito',
    icon: Eye,
    content: [
      {
        subtitle: 'Principio',
        text: 'Cuando un planeta pasa frente a su estrella (desde nuestra perspectiva), bloquea una pequeña cantidad de luz estelar.',
      },
      {
        subtitle: 'Curva de Luz',
        text: 'Esta disminución del brillo se registra como una "curva de luz" que muestra el cambio en el flujo luminoso a lo largo del tiempo.',
      },
      {
        subtitle: 'Información Obtenida',
        text: 'Del análisis del tránsito podemos determinar el tamaño del planeta, su período orbital y la distancia a su estrella.',
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
            className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl"
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
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {content.content.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <h3 className="text-lg font-semibold text-blue-400">
                    {section.subtitle}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {section.text}
                  </p>
                </motion.div>
              ))}
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