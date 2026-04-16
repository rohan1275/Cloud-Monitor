"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Server, Bell, TrendingUp, FileText,
  Cpu, Settings, LogOut, Activity, ChevronRight, Zap
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/scaling", label: "Auto Scaling", icon: TrendingUp },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/ai", label: "AI Insights", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sticky top-4 h-[calc(100vh-32px)] w-60 flex-shrink-0 flex flex-col z-30 ml-4 mr-6 rounded-2xl border shadow-2xl glass-card my-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "rgba(59,130,246,0.12)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">CloudMonitor</div>
          <div className="text-xs" style={{ color: "#64748b" }}>Infrastructure</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold px-3 mb-3" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          MONITORING
        </div>
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx("sidebar-item", { active: pathname === href })}>
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {pathname === href && <ChevronRight size={14} className="opacity-50" />}
          </Link>
        ))}

        <div className="text-xs font-semibold px-3 pt-4 mb-3" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          INTELLIGENCE
        </div>
        {navItems.slice(5, 6).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx("sidebar-item", { active: pathname === href })}>
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", fontSize: "10px" }}>AI</span>
          </Link>
        ))}

        <div className="text-xs font-semibold px-3 pt-4 mb-3" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          SYSTEM
        </div>
        {navItems.slice(6).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx("sidebar-item", { active: pathname === href })}>
            <Icon size={16} />
            <span className="flex-1">{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "rgba(59,130,246,0.08)" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(59,130,246,0.07)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs truncate" style={{ color: "#64748b" }}>{user?.role}</div>
          </div>
          <button onClick={logout} className="p-1 rounded hover:text-red-400 transition-colors"
            style={{ color: "#64748b" }} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
