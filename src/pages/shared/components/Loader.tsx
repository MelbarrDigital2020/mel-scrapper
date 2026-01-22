type LoaderProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

export default function Loader({ size = "md", label }: LoaderProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}
      />
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );
}
