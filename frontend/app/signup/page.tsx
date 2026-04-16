"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, Activity, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created! Welcome aboard 🎉");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Real-time CPU, Memory & Disk monitoring",
    "AI-powered predictions with Gemini",
    "Auto-scaling simulation engine",
    "Email alerts & notifications",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080d1a" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-4xl relative z-10 fade-in grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left — branding */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}>
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold gradient-text">CloudMonitor</div>
              <div className="text-xs" style={{ color: "#64748b" }}>AI Infrastructure Platform</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Monitor your cloud <br />
            <span className="gradient-text">infrastructure</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>
            A portfolio-grade platform for cloud engineers and DevOps professionals.
          </p>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className="text-sm" style={{ color: "#94a3b8" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6">Create your account</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "John Doe", id: "signup-name" },
              { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com", id: "signup-email" },
            ].map(({ key, label, type, placeholder, id }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0" }}
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "#64748b" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white", opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#60a5fa" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
