import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSettings();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => {
        const type = toast.type || 'success';

        return (
          <div
            key={toast.id}
            className={`toast toast-${type}`}
            role="alert"
          >
            {type === 'error' && (
              <AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0 }} />
            )}
            {type === 'warning' && (
              <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
            )}
            {type === 'info' && (
              <Info size={20} style={{ color: '#2563EB', flexShrink: 0 }} />
            )}
            {type === 'success' && (
              <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0 }} />
            )}

            <span style={{ flexGrow: 1, lineHeight: 1.45, fontWeight: 600 }}>
              {toast.message}
            </span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'currentColor',
                opacity: 0.8,
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'opacity 0.15s ease'
              }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
