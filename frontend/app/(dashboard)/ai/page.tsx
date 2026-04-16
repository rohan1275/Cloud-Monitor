"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Cpu, Brain, TrendingUp, TrendingDown, Minus, RefreshCw, Zap, Server, AlertTriangle, CheckCircle, Shield } from "lucide-react";

interface Insights {
  trend: "rising" | "stable" | "falling";
  trendDescription: string;
  prediction: string;
  recommendation: string;
  riskLevel: "low" | "medium" | "high";
  insights: string[];
  predictedCpuIn1h: number;
  shouldScale: boolean;
  scaleDirection: "up" | "down" | "none";
}

const RISK_CONFIG = {
  low:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)", icon: <CheckCircle size={16} />, label: "Low Risk" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", icon: <AlertTriangle size={16} />, label: "Medium Risk" },
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",  icon: <Shield size={16} />, label: "High Risk" },
};

const TREND_CONFIG = {
  rising:  { icon: <TrendingUp size={18} />, color: "#f87171", label: "Rising" },
  stable:  { icon: <Minus size={18} />,      color: "#60a5fa", label: "Stable"  },
  falling: { icon: <TrendingDown size={18} />, color: "#34d399", label: "Falling" },
};

export default function AIPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [serverCount, setServerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai/insights");
      setInsights(res.data.data);
      setServerCount(res.data.serverCount);
      setLastFetched(new Date());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const risk = insights ? RISK_CONFIG[insights.riskLevel] : null;
  const trend = insights ? TREND_CONFIG[insights.trend] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Infrastructure Insights</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              Powered by Google Gemini • {serverCount} server{serverCount !== 1 ? "s" : ""} analyzed
              {lastFetched && ` • Updated ${lastFetched.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <button id="refresh-insights" onClick={fetchInsights} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      {loading && !insights ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : insights ? (
        <>
          {/* Top row: Risk + Trend + Scale Rec */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk level */}
            <div className="glass-card p-5" style={{ border: `1px solid ${risk!.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Risk Level</span>
                <span style={{ color: risk!.color }}>{risk!.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: risk!.color }}>{risk!.label}</div>
              <div className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{insights.trendDescription}</div>
            </div>

            {/* Trend */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>CPU Trend</span>
                <span style={{ color: trend!.color }}>{trend!.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: trend!.color }}>{trend!.label}</div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#64748b" }}>Predicted in 1h</span>
                  <span className="font-bold" style={{ color: trend!.color }}>{insights.predictedCpuIn1h}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${insights.predictedCpuIn1h}%`,
                    background: insights.predictedCpuIn1h > 80 ? "#ef4444" : insights.predictedCpuIn1h > 60 ? "#f59e0b" : "#3b82f6"
                  }} />
                </div>
              </div>
            </div>

            {/* Scale recommendation */}
            <div className="glass-card p-5" style={{
              border: insights.shouldScale
                ? `1px solid ${insights.scaleDirection === 'up' ? 'rgba(59,130,246,0.4)' : 'rgba(245,158,11,0.4)'}`
                : undefined
            }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Scale Action</span>
                <Zap size={16} style={{ color: insights.shouldScale ? "#60a5fa" : "#64748b" }} />
              </div>
              {insights.shouldScale ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {insights.scaleDirection === "up"
                      ? <TrendingUp size={24} className="text-blue-400" />
                      : <TrendingDown size={24} className="text-amber-400" />}
                    <span className="text-xl font-bold" style={{ color: insights.scaleDirection === "up" ? "#60a5fa" : "#fbbf24" }}>
                      Scale {insights.scaleDirection === "up" ? "Up" : "Down"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {insights.scaleDirection === "up" ? "Add servers to handle load" : "Remove servers to save cost"}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={24} className="text-green-400" />
                    <span className="text-xl font-bold text-green-400">Optimal</span>
                  </div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>No scaling action needed</p>
                </>
              )}
            </div>
          </div>

          {/* Prediction & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={15} className="text-blue-400" />
                <h3 className="font-semibold text-white text-sm">CPU Usage Prediction</h3>
              </div>
              <p className="text-sm" style={{ color: "#94a3b8", lineHeight: "1.6" }}>{insights.prediction}</p>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Server size={15} className="text-purple-400" />
                <h3 className="font-semibold text-white text-sm">Scaling Recommendation</h3>
              </div>
              <p className="text-sm" style={{ color: "#94a3b8", lineHeight: "1.6" }}>{insights.recommendation}</p>
            </div>
          </div>

          {/* Insights list */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} className="text-purple-400" />
              <h3 className="font-semibold text-white text-sm">Infrastructure Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>{i + 1}</div>
                  <p className="text-sm" style={{ color: "#94a3b8", lineHeight: "1.5" }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
