"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { User, Mail, Bell, Shield, Save, Loader2, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notif, setNotif] = useState({
    alertEmail: user?.alertEmail || "",
    emailNotifications: user?.emailNotifications ?? true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.patch("/auth/settings", { name: profile.name });
      updateUser({ name: profile.name });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally { setSavingProfile(false); }
  };

  const saveNotif = async () => {
    setSavingNotif(true);
    try {
      await api.patch("/auth/settings", { alertEmail: notif.alertEmail, emailNotifications: notif.emailNotifications });
      updateUser({ alertEmail: notif.alertEmail, emailNotifications: notif.emailNotifications });
      toast.success("Notification settings saved");
    } catch (err: any) {
      toast.error("Failed to save");
    } finally { setSavingNotif(false); }
  };

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      await api.post("/auth/test-email");
      toast.success("Test email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send test email");
    } finally { setSendingTest(false); }
  };

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2.5 mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>
          {icon}
        </div>
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)", color: "#e2e8f0"
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Section icon={<User size={16} />} title="Profile Settings">
        <div className="space-y-4">
          <Field label="Full Name">
            <input id="settings-name" type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle} />
          </Field>
          <Field label="Email Address">
            <input type="email" value={profile.email} disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
              style={inputStyle} />
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>Email cannot be changed</p>
          </Field>
          <button id="save-profile-btn" onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "white", opacity: savingProfile ? 0.7 : 1 }}>
            {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Profile
          </button>
        </div>
      </Section>

      {/* Email Notifications */}
      <Section icon={<Bell size={16} />} title="Email Notifications">
        <div className="space-y-4">
          <Field label="Alert Email Address">
            <input id="settings-alert-email" type="email" value={notif.alertEmail} onChange={e => setNotif(p => ({...p, alertEmail: e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle} placeholder="alerts@yourcompany.com" />
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>Where to send alert emails (defaults to account email)</p>
          </Field>

          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div>
              <div className="text-sm font-semibold text-white">Email Alerts</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>Receive emails when metrics exceed thresholds</div>
            </div>
            <button id="toggle-email-notif" onClick={() => setNotif(p => ({...p, emailNotifications: !p.emailNotifications}))}
              className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: notif.emailNotifications ? "#3b82f6" : "rgba(255,255,255,0.1)" }}>
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                style={{ left: notif.emailNotifications ? "calc(100% - 20px)" : "4px" }} />
            </button>
          </div>

          <div className="flex gap-3">
            <button id="save-notif-btn" onClick={saveNotif} disabled={savingNotif}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "white", opacity: savingNotif ? 0.7 : 1 }}>
              {savingNotif ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Notifications
            </button>
            <button id="send-test-email-btn" onClick={sendTestEmail} disabled={sendingTest}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", opacity: sendingTest ? 0.7 : 1 }}>
              {sendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Test Email
            </button>
          </div>
        </div>
      </Section>

      {/* System Info */}
      <Section icon={<Shield size={16} />} title="System Information">
        <div className="space-y-3">
          {[
            { label: "Platform", value: "CloudMonitor v1.0.0" },
            { label: "AI Engine", value: "Google Gemini 1.5 Flash" },
            { label: "Metric Collection", value: "Every 10 seconds" },
            { label: "Auto-Scaling", value: "Enabled (80% CPU threshold)" },
            { label: "Alert Cooldown", value: "5 minutes" },
            { label: "Log Retention", value: "30 days" },
            { label: "Metric Retention", value: "7 days" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <span className="text-sm" style={{ color: "#64748b" }}>{label}</span>
              <span className="text-sm font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
