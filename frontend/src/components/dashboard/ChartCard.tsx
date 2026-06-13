import { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  interpretation,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  interpretation: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card ${className}`}>
      <div className="px-5 pt-4 pb-1">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        )}
      </div>
      <div className="px-2 pt-2 pb-1 h-72">{children}</div>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-600 italic">
        {interpretation}
      </div>
    </div>
  );
}
