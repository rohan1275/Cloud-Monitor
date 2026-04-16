"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { MetricCard, StatCard } from "@/components/dashboard/MetricCard";
import MetricChart from "@/components/charts/MetricChart";
import {
  Cpu, MemoryStick, HardDrive, Wifi, Server, Bell,
  TrendingUp, Activity, AlertTriangle, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface LatestMetric { cpu: number; memory: number; disk: number; networkIn: number; networkOut: number; }
interface ServerWithMetric { _id: string; name: string; ip: string; status: string; latestMetric: LatestMetric | null; }
interface Alert { _id: string; message: string; severity: string; type: string; createdAt: string; serverId: { name: string }; }
interface ScalingEvent { _id: string; action: string; reason: string; timestamp: string; serverCount: number; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [servers, setServers] = useState<ServerWithMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [scaling, setScaling] = useState<ScalingEvent[]>([]);
  const [metrics1h, setMetrics1h] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [sumRes, srvRes, alertRes, scaleRes] = await Promise.all([
        api.get("/metrics/summary"),
        api.get("/servers"),
        api.get("/alerts?limit=5&acknowledged=false"),
        api.get("/scaling?limit=5"),
      ]);
      setSummary(sumRes.data.data);
      setServers(srvRes.data.data);
      setAlerts(alertRes.data.data);
      setScaling(scaleRes.data.data);
      setLastUpdated(new Date());

      // Fetch 1h metrics for first active server
      const firstServer = srvRes.data.data.find((s: ServerWithMetric) => s.status !== 'down');
      if (firstServer) {
        const mRes = await api.get(`/metrics?serverId=${firstServer._id}&range=1h`);
        setMetrics1h(mRes.data.data);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeServers = servers.filter(s => s.status !== 'down');
  const avgCpu = summary?.avgCpu ?? 0;
  const avgMem = summary?.avgMemory ?? 0;
  const avgDisk = summary?.avgDisk ?? 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Welcome bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0]} 
            <span className="text-2xl origin-bottom-right rotate-12">👋</span>
          </h2>
          <p className="text-base mt-1" style={{ color: "#94a3b8" }}>
            Monitoring {activeServers.length} active server{activeServers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-white/5 text-xs font-semibold" style={{ color: "#94a3b8" }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Updated {format(lastUpdated, "HH:mm:ss")}
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Global CPU" value={avgCpu} icon={<Cpu size={20} />} color="#3b82f6"
          subtext={`Peak: ${Math.max(...servers.map(s => s.latestMetric?.cpu || 0)).toFixed(1)}%`} trend={avgCpu > 50 ? "up" : "stable"} />
        <MetricCard label="Global Memory" value={avgMem} icon={<MemoryStick size={20} />} color="#8b5cf6"
          subtext="Cluster average" trend={avgMem > 50 ? "up" : "stable"} />
        <MetricCard label="Global Disk" value={avgDisk} icon={<HardDrive size={20} />} color="#06b6d4"
          subtext="Persistent storage" />
        <StatCard label="Active Nodes" value={activeServers.length} icon={<Server size={20} />}
          color="#10b981" subtext={`${servers.filter(s => s.status === 'high_load').length} clusters under strain`} />
      </motion.div>

      {/* Charts row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU chart */}
        <div className="glass-card p-6 lg:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-white text-lg">Compute Utilization — Last Hour</h3>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>10s micro-resolution polling</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-sm font-black tracking-widest shadow-inner shadow-blue-500/10"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
              {avgCpu.toFixed(1)}%
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <MetricChart data={metrics1h} dataKey="cpu" color="#3b82f6" label="CPU"
              gradient={["#3b82f6", "#06b6d4"]} />
          </div>
        </div>

        {/* Memory chart */}
        <div className="glass-card p-6 lg:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-purple-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-white text-lg">Memory Saturation — Last Hour</h3>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>10s micro-resolution polling</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-sm font-black tracking-widest shadow-inner shadow-purple-500/10"
              style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
              {avgMem.toFixed(1)}%
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <MetricChart data={metrics1h} dataKey="memory" color="#8b5cf6" label="Memory"
              gradient={["#8b5cf6", "#ec4899"]} />
          </div>
        </div>
      </motion.div>

      {/* Bottom row: Servers + Alerts + Scaling */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server list */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-base">Active Nodes</h3>
            <Link href="/servers" className="text-xs font-bold px-2 py-1 rounded hover:bg-white/5 transition-colors" style={{ color: "#60a5fa" }}>View all</Link>
          </div>
          <div className="space-y-3 relative z-10">
            {activeServers.slice(0, 4).map(srv => (
              <div key={srv._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all group"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${
                  srv.status === 'running' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
                  srv.status === 'high_load' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{srv.name}</div>
                  <div className="text-xs" style={{ color: "#64748b" }}>{srv.ip}</div>
                </div>
                <div className="text-sm font-black" style={{ color: srv.latestMetric && srv.latestMetric.cpu > 80 ? "#f87171" : "#60a5fa" }}>
                  {srv.latestMetric?.cpu.toFixed(0) ?? "--"}%
                </div>
              </div>
            ))}
            {activeServers.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: "#64748b" }}>
                No servers online. <Link href="/servers" className="text-blue-400 font-bold hover:underline">Deploy one</Link>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-base">Security & Health</h3>
            <Link href="/alerts" className="text-xs font-bold px-2 py-1 rounded hover:bg-white/5 transition-colors" style={{ color: "#60a5fa" }}>View all</Link>
          </div>
          <div className="space-y-3 relative z-10">
            {alerts.slice(0, 4).map(alert => (
              <div key={alert._id} className="flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:translate-x-1"
                style={{ 
                  background: alert.severity === 'critical' ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)",
                  borderColor: alert.severity === 'critical' ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"
                }}>
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"
                  style={{ color: alert.severity === 'critical' ? "#f87171" : "#fbbf24" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate text-white">{alert.serverId?.name}</div>
                  <div className="text-xs truncate leading-relaxed mt-0.5" style={{ color: "#cbd5e1" }}>{alert.message}</div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-sm font-semibold text-emerald-400/80 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                ✓ No active alerts detected. Systems optimal.
              </div>
            )}
          </div>
        </div>

        {/* Scaling events */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-base">Orchestration</h3>
            <Link href="/scaling" className="text-xs font-bold px-2 py-1 rounded hover:bg-white/5 transition-colors" style={{ color: "#60a5fa" }}>View all</Link>
          </div>
          <div className="space-y-3 relative z-10">
            {scaling.slice(0, 4).map(evt => (
              <div key={evt._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold shadow-inner ${
                  evt.action === 'scale_up' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {evt.action === 'scale_up' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white tracking-wide">
                    {evt.action === 'scale_up' ? 'Elastic Expansion' : 'Termination'}
                  </div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: "#94a3b8" }}>
                    Capacity shifted to {evt.serverCount} nodes
                  </div>
                </div>
              </div>
            ))}
            {scaling.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: "#64748b" }}>
                Auto-scaling engine idling
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
