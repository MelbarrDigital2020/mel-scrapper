type Props = {
  password: string;
};

export default function PasswordStrength({ password }: Props) {
  const strength =
    password.length >= 8
      ? password.match(/[A-Z]/) && password.match(/[0-9]/)
        ? "strong"
        : "medium"
      : "weak";

  const color =
    strength === "strong"
      ? "bg-success"
      : strength === "medium"
      ? "bg-warning"
      : "bg-error";

  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-border-light rounded">
        <div className={`h-2 rounded ${color} w-1/3`} />
      </div>
      <p className="text-xs text-text-muted capitalize">
        Password strength: {strength}
      </p>
    </div>
  );
}
