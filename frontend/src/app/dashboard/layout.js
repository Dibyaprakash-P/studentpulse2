"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: "📊" },
    { name: "Daily Tracker", path: "/dashboard/tracker", icon: "📝" },
    { name: "Burnout Analytics", path: "/dashboard/burnout", icon: "🧠" },
    { name: "Productivity", path: "/dashboard/productivity", icon: "📈" },
    { name: "Achievements", path: "/dashboard/achievements", icon: "🏆" },
    { name: "Profile", path: "/dashboard/profile", icon: "⚙️" },
  ];

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "SP";
  const pageTitle = pathname.split("/").pop() || "overview";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="pulse-loader" />
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", zIndex: 20, borderRadius: 0, borderTop: "none", borderBottom: "none", borderLeft: "none" }}>
        <div style={{ height: 80, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--primary-cyan)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px rgba(0,255,229,0.5)" }}>
              <span className="animate-pulse" style={{ color: "var(--primary-cyan)", fontSize: "0.75rem" }}>SP</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "0.025em", fontFamily: "'Outfit',sans-serif" }}>Student Pulse</span>
          </div>
        </div>

        <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(item => (
              <Link key={item.path} href={item.path}
                className={`nav-item ${pathname === item.path ? "active" : ""}`}>
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ padding: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user?.full_name || "Student"}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Level {user?.level || 1}</p>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
        <header className="glass-panel" style={{ height: 80, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 10, borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, textTransform: "capitalize" }}>{pageTitle}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div className="stat-badge">
              <span style={{ color: "#fb923c" }}>🔥</span>
              <span style={{ fontWeight: 700 }}>{user?.current_streak || 0} Day Streak</span>
            </div>
            <div className="btn-icon" style={{ position: "relative" }}>
              <span>🔔</span>
              <span className="notif-dot" />
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflow: "auto", padding: 32, zIndex: 10 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
