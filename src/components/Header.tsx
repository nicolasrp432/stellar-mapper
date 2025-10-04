import { motion } from 'framer-motion';
import { Orbit, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onBackToHome?: () => void;
  showBackButton?: boolean;
}

export const Header = ({ onBackToHome, showBackButton = false }: HeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Orbit className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ExoPlanet Explorer</h1>
            <p className="text-xs text-gray-400">NASA Data Visualization</p>
          </div>
        </div>

        {showBackButton && onBackToHome && (
          <Button
            onClick={onBackToHome}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
        )}
      </div>
    </motion.header>
  );
};
