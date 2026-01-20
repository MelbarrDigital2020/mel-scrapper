type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
};

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  readOnly = false,
  disabled = false,
}: Props) {
  const isDisabled = readOnly || disabled;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">{label}</label>

      <div className="relative">
        {icon && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2
              ${isDisabled ? "text-text-muted" : "text-text-muted"}`}
          >
            {icon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full rounded-lg border border-border-light
            px-3 py-2 text-text-primary
            ${icon ? "pl-10" : ""}

            ${
              isDisabled
                ? "bg-background-section text-text-muted cursor-not-allowed focus:ring-0"
                : "bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            }`}
        />
      </div>
    </div>
  );
}
