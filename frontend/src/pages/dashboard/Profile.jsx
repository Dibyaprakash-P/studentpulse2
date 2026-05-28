import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useState } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [linkCode, setLinkCode] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleLinkParent = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    try {
      await api.approveLinkCode(linkCode);
      setSuccessMsg("Parent successfully linked!");
      setLinkCode("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to link");
    }
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "SP";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}>Profile & Settings</h2>
        <p style={{ color: "var(--text-muted)" }}>Manage your account and parent connections.</p>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: 32 }}>
        {/* Profile Info */}
        <GlassCard delay={0.1} className="md-col-span-1" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 128, height: 128, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary-teal), var(--primary-lavender))", padding: 4, marginBottom: 16 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", fontWeight: 700 }}>
              {initials}
            </div>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{user?.full_name || "Student"}</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>{user?.email || ""}</p>

          <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "left" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
            <div style={{ fontWeight: 700, color: "var(--primary-teal)" }}>Level {user?.level || 1} · {user?.xp_points || 0} XP</div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 16, marginBottom: 4 }}>Role</div>
            <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{user?.role || "student"}</div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 16, marginBottom: 4 }}>Streak</div>
            <div style={{ fontWeight: 700 }}>🔥 {user?.current_streak || 0} days (best: {user?.longest_streak || 0})</div>
          </div>
        </GlassCard>

        {/* Parent Linking */}
        <div className="md-col-span-2" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <GlassCard delay={0.2}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span>👨‍👩‍👧</span> Parent Connection
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 24 }}>
              Link your account to a parent so they can support your wellness journey.
            </p>

            {error && <div style={{ background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.3)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

            <form onSubmit={handleLinkParent} style={{ display: "flex", gap: 16 }}>
              <input type="text" className="form-input" placeholder="Enter 8-char parent code"
                value={linkCode} onChange={e => setLinkCode(e.target.value.toUpperCase())}
                maxLength={8} style={{ flex: 1, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }} />
              <NeonButton type="submit" variant="outline">Connect</NeonButton>
            </form>

            {successMsg && (
              <p style={{ color: "var(--success)", marginTop: 16, fontSize: "0.875rem", fontWeight: 700 }}>✓ {successMsg}</p>
            )}
          </GlassCard>

          <GlassCard delay={0.3}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--danger)", marginBottom: 8 }}>Danger Zone</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 16 }}>
              Log out of your account.
            </p>
            <NeonButton variant="danger" onClick={logout}>Log Out</NeonButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
