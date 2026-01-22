import { useCallback, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
};

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback(
    (opts: ConfirmOptions): Promise<boolean> => {
      setOptions(opts);

      return new Promise((resolve) => {
        setResolver(() => resolve);
      });
    },
    []
  );

  const handleConfirm = () => {
    resolver?.(true);
    cleanup();
  };

  const handleCancel = () => {
    resolver?.(false);
    cleanup();
  };

  const cleanup = () => {
    setOptions(null);
    setResolver(null);
  };

  const Dialog = options ? (
    <ConfirmDialog
      open={true}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return Object.assign(confirm, { Dialog });
}
