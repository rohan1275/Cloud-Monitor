"use client";
import { useAuth } from "@/context/AuthContext";
import { Bell, RefreshCw, Wifi } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Topbar({ title }: { title: string }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/alerts?limit=1");
        setUnread(res.data.unreadCount || 0);
      } catch {}
    };
    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 30000);
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(alertInterval); clearInterval(timeInterval); };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 mt-4 mb-8 rounded-2xl glass-card sticky top-4 z-20 shadow-xl border"
      style={{
        background: "rgba(13, 20, 36, 0.6)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}>
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
          <span className="text-xs" style={{ color: "#64748b" }}>
            Live — {time.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Wifi size={12} className="text-green-400" />
          <span className="text-xs font-medium text-green-400">Connected</span>
        </div>

        {/* Alerts bell */}
        <Link href="/alerts" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell size={18} style={{ color: "#94a3b8" }} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: "#ef4444", color: "white", fontSize: "10px" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
