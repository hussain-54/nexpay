import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { cn } from '../components/ui';

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-slide-in pointer-events-auto">
            <div className={cn(
              "px-4 py-2 rounded-full shadow-lg text-sm font-medium border text-center",
              toast.type === 'error' ? "bg-danger/10 border-danger text-danger" : 
              toast.type === 'success' ? "bg-accent/10 border-accent text-accent" :
              "bg-primary/10 border-primary text-primary"
            )}>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
