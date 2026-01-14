export default function Divider({ label = "or" }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="flex-1 h-px bg-border-light" />
      <span className="text-sm text-text-muted">{label}</span>
      <div className="flex-1 h-px bg-border-light" />
    </div>
  );
}
