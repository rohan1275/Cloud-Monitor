"use client";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/servers": "Servers",
  "/alerts": "Alerts",
  "/scaling": "Auto Scaling",
  "/logs": "Logs",
  "/ai": "AI Insights",
  "/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#080d1a" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm" style={{ color: "#64748b" }}>Loading CloudMonitor...</p>
        </div>
      </div>
    );
  }

  const title = PAGE_TITLES[pathname] || "CloudMonitor";

  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Abstract Background Glows */}
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pr-4">
        <Topbar title={title} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto fade-in pb-10">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
