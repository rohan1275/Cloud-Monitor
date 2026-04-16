"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { TrendingUp, TrendingDown, RefreshCw, Server, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

interface ScalingEvent {
  _id: string; action: "scale_up" | "scale_down"; reason: string;
  affectedServerName: string; serverCount: number; avgCpu: number; timestamp: string;
}
interface Stats { scaleUpCount: number; scaleDownCount: number; totalEvents: number; }

export default function ScalingPage() {
  const [events, setEvents] = useState<ScalingEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<"all" | "scale_up" | "scale_down">("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [evtRes, statRes] = await Promise.all([
        api.get("/scaling?limit=50"),
        api.get("/scaling/stats"),
      ]);
      setEvents(evtRes.data.data);
      setStats(statRes.data.data);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i); }, [fetchData]);

  const displayed = filter === "all" ? events : events.filter(e => e.action === filter);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Scale Up Events", value: stats?.scaleUpCount ?? 0, color: "#3b82f6", icon: <TrendingUp size={16} /> },
          { label: "Scale Down Events", value: stats?.scaleDownCount ?? 0, color: "#f59e0b", icon: <TrendingDown size={16} /> },
          { label: "Total Events", value: stats?.totalEvents ?? 0, color: "#06b6d4", icon: <Activity size={16} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, color }}>{icon}</div>
            </div>
            <div className="text-3xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "scale_up", "scale_down"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", {
                "text-white": filter === f,
                "text-slate-400 hover:text-white": filter !== f,
              })}
              style={filter === f
                ? { background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {f === "all" ? "All Events" : f === "scale_up" ? "↑ Scale Up" : "↓ Scale Down"}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#64748b" }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Timeline */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-5">Scaling History</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={36} className="mx-auto mb-3 opacity-30" style={{ color: "#3b82f6" }} />
            <p className="text-sm" style={{ color: "#64748b" }}>No scaling events yet</p>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>Events appear when CPU thresholds are crossed</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "rgba(59,130,246,0.2)" }} />
            <div className="space-y-4">
              {displayed.map((evt, i) => (
                <div key={evt._id} className="flex gap-4 relative">
                  {/* Icon */}
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2", {
                    "border-blue-500/40 bg-blue-500/10": evt.action === "scale_up",
                    "border-amber-500/40 bg-amber-500/10": evt.action === "scale_down",
                  })}>
                    {evt.action === "scale_up"
                      ? <TrendingUp size={16} className="text-blue-400" />
                      : <TrendingDown size={16} className="text-amber-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-xs font-bold", {
                            "text-blue-400": evt.action === "scale_up",
                            "text-amber-400": evt.action === "scale_down",
                          })}>
                            {evt.action === "scale_up" ? "↑ SCALED UP" : "↓ SCALED DOWN"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                            {evt.serverCount} servers
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{evt.reason}</p>
                        {evt.affectedServerName && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Server size={11} style={{ color: "#64748b" }} />
                            <span className="text-xs font-mono" style={{ color: "#64748b" }}>{evt.affectedServerName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#64748b" }}>
                        <Clock size={11} />
                        {format(new Date(evt.timestamp), "MMM d, HH:mm:ss")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
