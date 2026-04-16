"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { FileText, RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

interface Log {
  _id: string; level: "info" | "warn" | "error"; message: string;
  timestamp: string; serverId: { _id: string; name: string };
}
interface Pagination { total: number; page: number; pages: number; limit: number; }
interface Server { _id: string; name: string; }

const LEVEL_STYLES = {
  info:  { bg: "rgba(59,130,246,0.1)",  text: "#60a5fa",  dot: "#3b82f6"  },
  warn:  { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24",  dot: "#f59e0b"  },
  error: { bg: "rgba(239,68,68,0.1)",   text: "#f87171",  dot: "#ef4444"  },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: 50 });
  const [servers, setServers] = useState<Server[]>([]);
  const [level, setLevel] = useState("all");
  const [serverId, setServerId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      const params: any = { limit: 50, page };
      if (level !== "all") params.level = level;
      if (serverId) params.serverId = serverId;
      const res = await api.get("/logs", { params });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
      setLoading(false);
    } catch { setLoading(false); }
  }, [level, serverId, page]);

  useEffect(() => {
    api.get("/servers").then(res => setServers(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchLogs(); const i = setInterval(fetchLogs, 15000); return () => clearInterval(i); }, [fetchLogs]);

  const displayedLogs = search
    ? logs.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
    : logs;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Level filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} style={{ color: "#64748b" }} />
            {(["all", "info", "warn", "error"] as const).map(l => (
              <button key={l} onClick={() => { setLevel(l); setPage(1); }}
                className={clsx("px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize", {
                  "text-white": level === l,
                  "text-slate-400 hover:text-slate-200": level !== l,
                })}
                style={level === l
                  ? { background: l === "error" ? "rgba(239,68,68,0.2)" : l === "warn" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.2)" }
                  : { background: "rgba(255,255,255,0.04)" }}>
                {l === "all" ? "All" : l}
              </button>
            ))}
          </div>

          {/* Server filter */}
          <select value={serverId} onChange={e => { setServerId(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: "#1e2a45", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}>
            <option value="">All Servers</option>
            {servers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="flex-1 min-w-36 px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.15)", color: "#e2e8f0" }} />

          <button onClick={fetchLogs} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#64748b" }}>
            <RefreshCw size={14} />
          </button>

          <span className="text-xs ml-auto" style={{ color: "#64748b" }}>{pagination.total.toLocaleString()} total logs</span>
        </div>
      </div>

      {/* Log table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left w-20">Level</th>
                <th className="text-left w-32">Server</th>
                <th className="text-left">Message</th>
                <th className="text-left w-36">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-sm" style={{ color: "#64748b" }}>Loading logs...</td></tr>
              ) : displayedLogs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12">
                  <FileText size={32} className="mx-auto mb-2 opacity-30 text-blue-400" />
                  <p className="text-sm" style={{ color: "#64748b" }}>No logs found</p>
                </td></tr>
              ) : (
                displayedLogs.map(log => {
                  const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.info;
                  return (
                    <tr key={log._id}>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
                          <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded"
                            style={{ background: style.bg, color: style.text }}>{log.level}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-white">{log.serverId?.name ?? "—"}</span>
                      </td>
                      <td>
                        <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{log.message}</span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "#64748b" }}>
                          {format(new Date(log.timestamp), "MMM d HH:mm:ss")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs" style={{ color: "#64748b" }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: "#94a3b8" }}>
                <ChevronLeft size={15} />
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: "#94a3b8" }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
