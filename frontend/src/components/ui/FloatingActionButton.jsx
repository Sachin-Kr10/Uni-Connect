import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingActionButton = ({ onClick, icon: Icon = Plus, className = '' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`fixed bottom-24 lg:bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-tertiary-500 text-white flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(79,70,229,0.5)] hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.6)] transition-shadow ${className}`}
      style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
    >
      <Icon className="w-6 h-6 stroke-[2.5px]" />
    </motion.button>
  );
};

export default FloatingActionButton;
