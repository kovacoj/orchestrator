import { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: { label: string; tone?: "neutral" | "warning" };
  children: ReactNode;
}) {
  const toneClass = badge?.tone === "warning" ? "chip-warning" : "chip-neutral";
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className={`chip ${toneClass} shrink-0 mt-1`}>{badge.label}</span>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
