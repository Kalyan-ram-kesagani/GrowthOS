import { useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, Undo2 } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", options = {}) => {
    const id = Date.now() + Math.random();
    const duration = options.duration || 4000;
    setToasts((prev) => [...prev, { id, message, type, action: options.action || null }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toastContainer">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`}
          >
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <AlertCircle size={18} />}
            {toast.type === "info" && <Info size={18} />}
            <span>{toast.message}</span>
            {toast.action && (
              <button
                className="toastAction"
                onClick={() => {
                  toast.action.onClick();
                  removeToast(toast.id);
                }}
              >
                <Undo2 size={14} />
                Undo
              </button>
            )}
            <button className="toastClose" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
