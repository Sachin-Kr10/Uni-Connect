import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-primary-600',
};

const Toast = ({ toast, onDismiss }) => {
  const Icon = icons[toast.type] || Info;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="flex items-center gap-3 px-5 py-4 bg-[var(--color-surface-lowest)] text-[var(--color-on-surface)] rounded-2xl shadow-xl border border-[var(--color-outline-variant)]/20 backdrop-blur-xl max-w-sm w-full"
    >
      <div className={`w-8 h-8 rounded-xl ${colors[toast.type] || colors.info} flex items-center justify-center text-white shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm font-semibold flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] p-1 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
