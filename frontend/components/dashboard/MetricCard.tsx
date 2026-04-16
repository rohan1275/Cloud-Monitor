"use client";
import { clsx } from "clsx";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  trend?: "up" | "down" | "stable";
}

function getProgressColor(value: number, color: string) {
  if (value >= 85) return "#ef4444";
  if (value >= 70) return "#f59e0b";
  return color;
}

import { motion } from "framer-motion";

export function MetricCard({ label, value, unit = "%", icon, color, subtext, trend }: MetricCardProps) {
  const numVal = typeof value === "number" ? value : parseFloat(value as string);

  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: `${color}15` }} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, color, border: `1px solid ${color}30` }}>
            {icon}
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#94a3b8" }}>{label}</span>
        </div>
        {trend && (
          <span className={clsx("text-xs px-2.5 py-1 rounded-full font-bold shadow-sm", {
            "text-green-400 bg-green-500/10 border border-green-500/20": trend === "down",
            "text-red-400 bg-red-500/10 border border-red-500/20": trend === "up",
            "text-slate-300 bg-slate-500/10 border border-slate-500/20": trend === "stable",
          })}>
            {trend === "up" ? "↑ Rising" : trend === "down" ? "↓ Falling" : "→ Stable"}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "#f8fafc" }}>
          {typeof numVal === 'number' && !isNaN(numVal) ? numVal.toFixed(1) : value}
        </span>
        <span className="text-base font-medium" style={{ color: color }}>{unit}</span>
      </div>

      {!isNaN(numVal) && (
        <div className="progress-bar mt-1 h-2 bg-slate-800/50">
          <div
            className="progress-fill transition-all duration-700 h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ width: `${Math.min(numVal, 100)}%`, background: getProgressColor(numVal, color), boxShadow: `0 0 12px ${getProgressColor(numVal, color)}60` }}
          />
        </div>
      )}

      {subtext && <p className="text-sm mt-1" style={{ color: "#64748b" }}>{subtext}</p>}
    </motion.div>
  );
}

export function StatCard({ label, value, icon, color, subtext }: Omit<MetricCardProps, "unit" | "trend">) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-6 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: `${color}15` }} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, color, border: `1px solid ${color}30` }}>{icon}</div>
      </div>
      <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{value}</div>
      {subtext && <p className="text-sm mt-2" style={{ color: "#64748b" }}>{subtext}</p>}
    </motion.div>
  );
}
