import React, { useState, useCallback } from 'react';
import { ToastContext, ToastMessage, ToastType } from './toastContextStore';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((msg: string, title = 'Success') => showToast('success', msg, title), [showToast]);
  const error = useCallback((msg: string, title = 'Error') => showToast('error', msg, title), [showToast]);
  const warning = useCallback((msg: string, title = 'Warning') => showToast('warning', msg, title), [showToast]);
  const info = useCallback((msg: string, title = 'Information') => showToast('info', msg, title), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};
