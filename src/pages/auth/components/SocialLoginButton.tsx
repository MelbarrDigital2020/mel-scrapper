import type { ReactNode } from "react";

type Props = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
};

export default function SocialLoginButton({
  label,
  icon,
  onClick,
}: Props) {
  return (
     <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2
        border border-border-light rounded-lg py-2 px-4
        text-sm font-medium text-text-primary
        hover:bg-background-section transition
        focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Icon */}
      <span className="text-text-muted">{icon}</span>

      {/* Label */}
      <span>{label}</span>
    </button>
  );
}
