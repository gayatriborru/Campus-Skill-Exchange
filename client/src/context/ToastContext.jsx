import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Award, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toastSuccess = useCallback(
    (message, title = 'Success') => addToast({ type: 'success', title, message }),
    [addToast]
  );

  const toastError = useCallback(
    (message, title = 'Error') => addToast({ type: 'error', title, message }),
    [addToast]
  );

  const toastInfo = useCallback(
    (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    [addToast]
  );

  const toastBadge = useCallback(
    (badgeName, message = 'You unlocked a new campus badge!') =>
      addToast({ type: 'badge', title: `🎉 Badge Unlocked: ${badgeName}`, message, duration: 6000 }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        toastSuccess,
        toastError,
        toastInfo,
        toastBadge,
      }}
    >
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10'
                : t.type === 'badge'
                ? 'bg-gradient-to-r from-amber-50/95 to-indigo-50/95 border-amber-300 text-slate-900 shadow-amber-500/20 ring-1 ring-amber-300/50'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-500/10'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === 'badge' && <Award className="w-5 h-5 text-amber-600 animate-bounce" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-brand-600" />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-sm font-semibold leading-tight">{t.title}</h4>}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
