import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Coffee,
  FlaskConical,
  FileText,
  ShieldCheck,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
  { to: "/competitors", label: "Competitors", icon: Coffee },
  { to: "/labs", label: "Research Labs", icon: FlaskConical },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/data-quality", label: "Data Quality", icon: ShieldCheck },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            SF
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              Signal Foundry
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Reputation Monitor
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500">
        Built for the hackathon demo. Artificial data only.
      </div>
    </aside>
  );
}
