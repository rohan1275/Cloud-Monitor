"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, Activity, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080d1a" }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}>
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">CloudMonitor</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#e2e8f0",
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    color: "#e2e8f0",
                  }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "#64748b" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                color: "white",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "#64748b" }}>
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#60a5fa" }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl text-center text-xs" style={{ background: "rgba(59,130,246,0.08)", color: "#64748b" }}>
          💡 Create a free account to explore the live dashboard
        </div>
      </div>
    </div>
  );
}
