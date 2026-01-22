import { createContext, useContext, useState, type ReactNode } from "react";
import {
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiX,
} from "react-icons/fi";

type ToastType = "success" | "info" | "warning" | "error";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🔔 Toast Container (TOP RIGHT) */}
      <div className="fixed top-5 right-5 z-[999] space-y-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}

/* ================= TOAST ITEM ================= */

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const config = {
    success: {
      icon: <FiCheckCircle className="text-green-600" />,
      border: "border-green-400",
      bg: "bg-green-50",
    },
    info: {
      icon: <FiInfo className="text-blue-600" />,
      border: "border-blue-400",
      bg: "bg-blue-50",
    },
    warning: {
      icon: <FiAlertTriangle className="text-yellow-600" />,
      border: "border-yellow-400",
      bg: "bg-yellow-50",
    },
    error: {
      icon: <FiXCircle className="text-red-600" />,
      border: "border-red-400",
      bg: "bg-red-50",
    },
  }[toast.type];

  return (
    <div
      className={`w-[360px] flex items-start gap-3 p-4 rounded-xl border
        shadow-lg animate-slide-in ${config.border} ${config.bg}`}
    >
      <div className="mt-0.5 text-xl">{config.icon}</div>

      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-text-secondary mt-0.5">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="text-text-secondary hover:text-black transition"
      >
        <FiX />
      </button>
    </div>
  );
}
