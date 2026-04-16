"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, Shield, Zap, ChevronRight, BarChart3, Database, Server } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // Though Next router doesn't usually like redirects directly in render, using useEffect is fine for client
    }
  }, [user, router]);

  if (user) return null; // Avoid flashing the landing page when redirecting

  return (
    <div className="min-h-screen bg-[#050810] text-[#f8fafc] font-sans overflow-hidden selection:bg-blue-500/30">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full border-b border-blue-500/10 bg-[#050810]/70 backdrop-blur-xl z-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center glow-blue">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">CloudMonitor</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold hover:text-white text-slate-300 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 mb-8"
          >
            <Zap size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold tracking-wide text-blue-200">INTELLIGENT CLOUD METRICS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Observe your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Infrastructure in Real-Time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            An AI-powered simulation engine that dynamically tracks server instances, triggers synthetic auto-scaling, and visualizes network health.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto justify-center">
              Deploy Environment
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Preview Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-[1200px] mx-auto mt-24"
        >
          <div className="rounded-3xl border border-white/10 bg-[#0d1424]/80 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="mx-auto w-64 h-6 rounded-md bg-white/5 flex items-center justify-center cursor-default">
                <span className="text-[10px] text-slate-400">cloudmonitor.app</span>
              </div>
            </div>
            {/* Visual mock of dashboard charts */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-64 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
                <div className="absolute bottom-0 w-full h-1/2">
                   {/* Abstract chart wave SVG */}
                   <svg viewBox="0 0 1000 300" className="w-full h-full fill-blue-500/20 stroke-blue-400 stroke-2" preserveAspectRatio="none">
                     <path d="M0,300 C200,100 400,200 600,50 800,150 1000,100 1000,100 L1000,300 L0,300 Z" />
                   </svg>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-[116px] rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="text-emerald-400 mb-2"><Server size={20} /></div>
                  <div className="text-2xl font-bold">14</div>
                  <div className="text-xs text-slate-400">Active Instances</div>
                </div>
                <div className="h-[116px] rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="text-amber-400 mb-2"><Activity size={20} /></div>
                  <div className="text-2xl font-bold">84%</div>
                  <div className="text-xs text-slate-400">Global CPU Load</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 bg-[#0a0f1d] border-t border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Master Your Data Center</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to orchestrate instances, monitor resource consumption, and let AI debug bottlenecks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="text-blue-400" size={24} />,
                title: "Live Telemetry",
                desc: "High-resolution metric polling with down-to-the-second latency for CPU, Memory, and Disk writes."
              },
              {
                icon: <Zap className="text-cyan-400" size={24} />,
                title: "Synthetic Auto-Scaling",
                desc: "Stress-test infrastructure dynamically. Watch the system automatically provision or cull servers based on algorithmic load tracking."
              },
              {
                icon: <Shield className="text-emerald-400" size={24} />,
                title: "AI Diagnostic Engine",
                desc: "Integrate with Gemini AI to generate plain-text executive summaries and deep technical insights of anomalous server behavior."
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#0d1424] border border-white/5 hover:border-blue-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#050810] text-center text-slate-500 text-sm">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Activity size={16} />
            <span className="font-bold tracking-tight">CloudMonitor</span>
          </div>
          <p>© {new Date().getFullYear()} CloudMonitor Infrastructure. For demonstration purposes.</p>
        </div>
      </footer>
    </div>
  );
}
