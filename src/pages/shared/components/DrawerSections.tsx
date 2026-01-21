import React from "react";

export function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase text-text-secondary">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Info({ label, value }: any) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export function Divider() {
  return <div className="h-px bg-border-light" />;
}
