import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import Overview from "./pages/Overview";
import Alerts from "./pages/Alerts";
import Locations from "./pages/Locations";
import Predictions from "./pages/Predictions";
import Competitors from "./pages/Competitors";
import Labs from "./pages/Labs";
import Reports from "./pages/Reports";
import DataQuality from "./pages/DataQuality";

export default function App() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
