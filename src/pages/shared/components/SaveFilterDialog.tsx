import { FiX } from "react-icons/fi";

type Props = {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function SaveFilterDialog({
  open,
  value,
  onChange,
  onCancel,
  onSave,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background-card rounded-xl shadow-xl border border-border-light p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Save filter</h3>
          <button
            onClick={onCancel}
            className="h-8 w-8 rounded-lg hover:bg-background flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs text-text-secondary">
            Filter name
          </label>
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. SaaS companies in APAC"
            className="w-full h-9 px-3 rounded-lg bg-background border border-border-light text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-border-light hover:bg-background"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={!value.trim()}
            className={`h-9 px-4 rounded-lg text-white font-medium transition
              ${
                value.trim()
                  ? "bg-primary hover:brightness-110"
                  : "bg-primary/40 cursor-not-allowed"
              }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
