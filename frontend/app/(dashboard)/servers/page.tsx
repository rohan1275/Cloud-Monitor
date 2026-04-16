"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Server, Plus, Trash2, RefreshCw, Cpu, MemoryStick, HardDrive, Loader2, X, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import clsx from "clsx";

interface ServerObj {
  _id: string; name: string; ip: string; region: string; type: string;
  status: string; isSimulated: boolean; createdAt: string;
  latestMetric: { cpu: number; memory: number; disk: number } | null;
}

const REGIONS = ["us-east-1","us-west-2","eu-west-1","eu-central-1","ap-southeast-1","ap-south-1"];
const TYPES   = ["t2.micro","t2.small","t2.medium","t3.medium","m5.large","c5.xlarge"];

function AddServerModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: "", ip: "", region: "us-east-1", type: "t2.micro" });
  const [loading, setLoading] = useState(false);

  const randomIP = () => `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/servers", form);
      toast.success(`Server "${form.name}" added!`);
      onAdded();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add server");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="glass-card w-full max-w-md p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white">Add New Server</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Server Name</label>
            <input id="server-name" type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}
              placeholder="prod-server-01" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
              IP Address
              <button type="button" onClick={() => setForm(p => ({...p, ip: randomIP()}))} className="ml-2 text-blue-400 normal-case font-normal">
                (random)
              </button>
            </label>
            <input id="server-ip" type="text" value={form.ip} onChange={e => setForm(p => ({...p, ip: e.target.value}))} required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}
              placeholder="10.0.0.1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Region</label>
              <select value={form.region} onChange={e => setForm(p => ({...p, region: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#1e2a45", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Instance Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#1e2a45", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>Cancel</button>
            <button id="add-server-submit" type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "white" }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Adding..." : "Add Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServersPage() {
  const [servers, setServers] = useState<ServerObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      const res = await api.get("/servers");
      setServers(res.data.data);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchServers();
    const i = setInterval(fetchServers, 10000);
    return () => clearInterval(i);
  }, [fetchServers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/servers/${id}`);
      toast.success(`"${name}" removed`);
      fetchServers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove server");
    } finally { setDeleting(null); }
  };

  const statusColors: Record<string, string> = { running: "status-running", down: "status-down", high_load: "status-high_load" };
  const statusLabels: Record<string, string> = { running: "Running", down: "Down", high_load: "High Load" };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "#64748b" }}>
            {servers.length} server{servers.length !== 1 ? "s" : ""} total • {servers.filter(s=>s.status==='running').length} running
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchServers} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#64748b" }}>
            <RefreshCw size={16} />
          </button>
          <button id="add-server-btn" onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "white" }}>
            <Plus size={15} /> Add Server
          </button>
        </div>
      </div>

      {/* Server grid */}
      {servers.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Server size={40} className="mx-auto mb-4 opacity-30" style={{ color: "#3b82f6" }} />
          <h3 className="font-semibold text-white mb-2">No servers yet</h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>Add your first server to start monitoring</p>
          <button onClick={() => setShowModal(true)} className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            Add Server
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {servers.map(srv => {
            const m = srv.latestMetric;
            return (
              <div key={srv._id} className="glass-card p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-xs px-2 py-0.5 rounded-full font-semibold", statusColors[srv.status] || "status-running")}>
                        {statusLabels[srv.status] || srv.status}
                      </span>
                      {srv.isSimulated && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                          Simulated
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white">{srv.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "#64748b" }}>
                      <Globe size={11} /> {srv.ip} &bull; {srv.region} &bull; {srv.type}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(srv._id, srv.name)} disabled={deleting === srv._id}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#64748b" }}>
                    {deleting === srv._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>

                {/* Metrics */}
                {m ? (
                  <div className="space-y-2.5">
                    {[
                      { label: "CPU", value: m.cpu, color: "#3b82f6", icon: <Cpu size={11} /> },
                      { label: "Memory", value: m.memory, color: "#8b5cf6", icon: <MemoryStick size={11} /> },
                      { label: "Disk", value: m.disk, color: "#06b6d4", icon: <HardDrive size={11} /> },
                    ].map(({ label, value, color, icon }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1 text-xs" style={{ color: "#94a3b8" }}>{icon} {label}</div>
                          <span className="text-xs font-bold" style={{ color: value > 80 ? "#f87171" : color }}>{value.toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${value}%`, background: value > 80 ? "#ef4444" : value > 65 ? "#f59e0b" : color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-center py-4" style={{ color: "#64748b" }}>Waiting for first metric...</div>
                )}

                <div className="text-xs pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                  Added {format(new Date(srv.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddServerModal onClose={() => setShowModal(false)} onAdded={fetchServers} />}
    </div>
  );
}
