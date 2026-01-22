import { useState } from "react";
import { FiX } from "react-icons/fi";

type SaveFilterOptions = {
  title?: string;
  placeholder?: string;
};

export function useSaveFilterDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [resolver, setResolver] = useState<
    ((name: string | null) => void) | null
  >(null);

  const openDialog = (opts?: SaveFilterOptions) => {
    setValue("");
    setOpen(true);

    return new Promise<string | null>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const close = () => {
    setOpen(false);
    resolver?.(null);
    setResolver(null);
  };

  const save = () => {
    if (!value.trim()) return;
    resolver?.(value.trim());
    setResolver(null);
    setOpen(false);
  };

  const Dialog = open ? (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background-card rounded-xl shadow-xl border border-border-light p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Save filter</h3>
          <button
            onClick={close}
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
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. SaaS companies in APAC"
            className="w-full h-9 px-3 rounded-lg bg-background border border-border-light text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="h-9 px-4 rounded-lg border border-border-light hover:bg-background"
          >
            Cancel
          </button>

          <button
            onClick={save}
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
  ) : null;

  return Object.assign(openDialog, { Dialog });
}
