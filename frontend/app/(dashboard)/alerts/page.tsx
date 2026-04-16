"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Bell, CheckCheck, Trash2, Filter, AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import clsx from "clsx";

interface Alert {
  _id: string; message: string; severity: string; type: string;
  value: number; threshold: number; acknowledged: boolean;
  createdAt: string; serverId: { name: string; ip: string };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "critical" | "warning">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      if (filter === "unread") params.acknowledged = "false";
      if (filter === "critical" || filter === "warning") params.severity = filter; // we'll filter client-side too
      const res = await api.get("/alerts", { params });
      setAlerts(res.data.data);
      setUnreadCount(res.data.unreadCount);
      setLoading(false);
    } catch { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchAlerts(); const i = setInterval(fetchAlerts, 15000); return () => clearInterval(i); }, [fetchAlerts]);

  const ack = async (id: string) => {
    await api.patch(`/alerts/${id}/acknowledge`);
    fetchAlerts();
    toast.success("Alert acknowledged");
  };

  const ackAll = async () => {
    await api.patch("/alerts/acknowledge-all");
    fetchAlerts();
    toast.success("All alerts acknowledged");
  };

  const del = async (id: string) => {
    await api.delete(`/alerts/${id}`);
    fetchAlerts();
    toast.success("Alert removed");
  };

  const displayed = alerts.filter(a => {
    if (filter === "critical") return a.severity === "critical";
    if (filter === "warning") return a.severity === "warning";
    if (filter === "unread") return !a.acknowledged;
    return true;
  });

  const typeIcon: Record<string, string> = { cpu: "🖥️", memory: "🧠", disk: "💾" };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(["all", "unread", "critical", "warning"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize", {
                "text-white": filter === f,
                "text-slate-400 hover:text-white": filter !== f,
              })}
              style={filter === f ? { background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {f === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAlerts} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#64748b" }}>
            <RefreshCw size={15} />
          </button>
          {unreadCount > 0 && (
            <button id="ack-all-btn" onClick={ackAll}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
              <CheckCheck size={13} /> Acknowledge All
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Alerts", value: alerts.length, color: "#3b82f6" },
          { label: "Unacknowledged", value: unreadCount, color: "#ef4444" },
          { label: "Critical", value: alerts.filter(a => a.severity === "critical").length, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: "#64748b" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Alerts list */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "#64748b" }}>Loading alerts...</div>
        ) : displayed.length === 0 ? (
          <div className="p-16 text-center">
            <Bell size={36} className="mx-auto mb-3 opacity-30 text-green-400" />
            <p className="text-sm text-green-400 font-medium">No alerts found</p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>Your infrastructure is operating normally</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Severity</th>
                <th className="text-left">Server</th>
                <th className="text-left">Metric</th>
                <th className="text-left">Value / Threshold</th>
                <th className="text-left">Time</th>
                <th className="text-left">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(alert => (
                <tr key={alert._id} className={alert.acknowledged ? "opacity-50" : ""}>
                  <td>
                    <div className="flex items-center gap-2">
                      {alert.severity === "critical"
                        ? <ShieldAlert size={14} className="text-red-400" />
                        : <AlertTriangle size={14} className="text-amber-400" />}
                      <span className={clsx("text-xs px-2 py-0.5 rounded-full font-semibold", {
                        "bg-red-400/10 text-red-400": alert.severity === "critical",
                        "bg-amber-400/10 text-amber-400": alert.severity === "warning",
                      })}>
                        {alert.severity}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-white">{alert.serverId?.name ?? "—"}</div>
                    <div className="text-xs" style={{ color: "#64748b" }}>{alert.serverId?.ip}</div>
                  </td>
                  <td>
                    <span className="text-xs">{typeIcon[alert.type]} {alert.type?.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="font-bold text-xs" style={{ color: alert.severity === "critical" ? "#f87171" : "#fbbf24" }}>
                      {alert.value?.toFixed(1)}%
                    </span>
                    <span className="text-xs ml-1" style={{ color: "#64748b" }}>/ {alert.threshold}%</span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: "#64748b" }}>
                      {format(new Date(alert.createdAt), "MMM d, HH:mm")}
                    </span>
                  </td>
                  <td>
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full", {
                      "bg-green-500/10 text-green-400": alert.acknowledged,
                      "bg-slate-500/10 text-slate-400": !alert.acknowledged,
                    })}>
                      {alert.acknowledged ? "Acknowledged" : "Active"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!alert.acknowledged && (
                        <button onClick={() => ack(alert._id)} title="Acknowledge"
                          className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" style={{ color: "#64748b" }}>
                          <CheckCheck size={13} />
                        </button>
                      )}
                      <button onClick={() => del(alert._id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#64748b" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
