import React from 'react';
import { useToast } from '../../hooks/useToast';
import { ToastType } from '../../context/toastContextStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} color="var(--success)" />,
  error: <AlertCircle size={20} color="var(--danger)" />,
  warning: <AlertTriangle size={20} color="var(--warning)" />,
  info: <Info size={20} color="var(--info)" />,
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type} animate-fade-in`}>
          <div className="toast-icon">{icons[toast.type]}</div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
