import { FiCheckCircle, FiXCircle } from "react-icons/fi";

type Props = {
  password: string;
};

export default function PasswordStrength({ password }: Props) {
  const rules = [
    {
      label: "8–20 characters",
      valid: password.length >= 8 && password.length <= 20,
    },
    {
      label: "At least one capital letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "No spaces",
      valid: !/\s/.test(password),
    },
  ];

  const passedRules = rules.filter((r) => r.valid).length;

  const strength =
    passedRules >= 4
      ? "strong"
      : passedRules >= 2
      ? "medium"
      : "weak";

  const barColor =
    strength === "strong"
      ? "bg-success"
      : strength === "medium"
      ? "bg-warning"
      : "bg-error";

  const barWidth =
    strength === "strong"
      ? "w-full"
      : strength === "medium"
      ? "w-2/3"
      : "w-1/3";

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="h-2 w-full bg-border-light rounded">
          <div
            className={`h-2 rounded transition-all duration-300 ${barColor} ${barWidth}`}
          />
        </div>
        <p className="text-xs text-text-muted mt-1 capitalize">
          Password strength: {strength}
        </p>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-secondary">
          Password must include:
        </p>

        {rules.map((rule) => (
          <div
            key={rule.label}
            className="flex items-center gap-2 text-sm"
          >
            {rule.valid ? (
              <FiCheckCircle className="text-success" />
            ) : (
              <FiXCircle className="text-error" />
            )}
            <span
              className={
                rule.valid ? "text-success" : "text-error"
              }
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
