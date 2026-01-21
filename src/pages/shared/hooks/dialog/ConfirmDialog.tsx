import { type ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background-card rounded-xl shadow-xl border border-border-light p-6">
        <h3 className="text-lg font-semibold">{title}</h3>

        {description && (
          <p className="mt-2 text-sm text-text-secondary">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-border-light hover:bg-background transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`h-9 px-4 rounded-lg font-medium transition
              ${
                variant === "danger"
                  ? "bg-black text-white hover:opacity-90"
                  : "bg-primary text-white hover:brightness-110"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
