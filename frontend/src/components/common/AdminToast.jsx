import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './AdminToast.css';

/**
 * AdminToast — slide-in notification for admin panel actions.
 *
 * Usage in any admin page:
 *   const [toast, setToast] = useState(null);
 *   setToast({ type: 'success', message: 'User deleted successfully.' });
 *   <AdminToast toast={toast} onDismiss={() => setToast(null)} />
 *
 * @param {{ type: 'success'|'error'|'warning'|'info', message: string } | null} toast
 * @param {() => void} onDismiss
 */
export default function AdminToast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3800);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={17} />,
    warning: <AlertTriangle size={17} />,
    error:   <XCircle size={17} />,
    info:    <Info size={17} />,
  };

  return (
    <div
      className={`admin-toast admin-toast--${toast.type || 'success'}`}
      role="status"
      aria-live="polite"
    >
      <span className="admin-toast__icon">{icons[toast.type] || icons.success}</span>
      <span className="admin-toast__message">{toast.message}</span>
      <button
        className="admin-toast__close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        <X size={13} />
      </button>
    </div>
  );
}
