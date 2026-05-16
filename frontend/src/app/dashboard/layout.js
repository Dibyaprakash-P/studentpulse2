"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parentOnline, setParentOnline] = useState(null);
  const [parentBannerDismissed, setParentBannerDismissed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  /* Detect if parent is monitoring */
  useEffect(() => {
    const checkParent = () => {
      try {
        const data = JSON.parse(localStorage.getItem("sp_parent_online"));
        if (data && data.active) {
          const since = new Date(data.since);
          const now = new Date();
          if (now - since < 60000) { setParentOnline(data); return; }
        }
      } catch { /* ignore */ }
      setParentOnline(null);
    };
    checkParent();
    const interval = setInterval(checkParent, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: "📊" },
    { name: "Tracker", path: "/dashboard/tracker", icon: "📝" },
    { name: "Assignments", path: "/dashboard/homework", icon: "📋" },
    { name: "Attendance", path: "/dashboard/attendance", icon: "✅" },
    { name: "Notes", path: "/dashboard/notes", icon: "🗒️" },
    { name: "Projects", path: "/dashboard/projects", icon: "📁" },
    { name: "Report Cards", path: "/dashboard/reports", icon: "📄" },
    { name: "Burnout", path: "/dashboard/burnout", icon: "🧠" },
    { name: "Productivity", path: "/dashboard/productivity", icon: "📈" },
    { name: "Achievements", path: "/dashboard/achievements", icon: "🏆" },
    { name: "About Us", path: "/dashboard/about", icon: "ℹ️" },
    { name: "Profile", path: "/dashboard/profile", icon: "⚙️" },
  ];

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "SP";
  const pageTitle = navItems.find(i => i.path === pathname)?.name || "Dashboard";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div className="pulse-loader" />
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* ═══ DESKTOP SIDEBAR — Frosted Glass ═══ */}
      <aside className="desktop-sidebar" style={{
        width: 250, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        zIndex: 30, transition: "all 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ height: 68, display: "flex", alignItems: "center", padding: "0 22px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary-blue), var(--primary-purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(96, 165, 250, 0.2)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>Student Pulse</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(item => (
              <Link key={item.path} href={item.path}
                className={`nav-item ${pathname === item.path ? "active" : ""}`}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Theme Toggle + User — Frosted Glass */}
        <div style={{ padding: 14, borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={toggle} style={{
            width: "100%", padding: "9px 14px", borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: "0.82rem", fontWeight: 600, marginBottom: 10,
            transition: "all 0.3s ease",
          }}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary-blue), var(--primary-purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "0.75rem",
              boxShadow: "0 0 12px rgba(96, 165, 250, 0.15)",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.full_name || "Student"}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Level {user?.level || 1}</p>
            </div>
            <button onClick={logout} title="Logout"
              style={{
                background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)",
                borderRadius: 8, color: "var(--text-dim)", cursor: "pointer",
                fontSize: "0.9rem", padding: "6px 8px", transition: "all 0.2s",
              }}>
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* MOBILE HEADER — Frosted Glass */}
        <header className="mobile-header" style={{
          height: 58, padding: "0 16px", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-secondary)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          zIndex: 40, display: "none",
        }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, color: "var(--text-main)",
            fontSize: "1.1rem", cursor: "pointer", padding: "6px 10px",
          }}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <span style={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem", letterSpacing: "-0.02em" }}>
            {pageTitle}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggle} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
              borderRadius: 10, cursor: "pointer", fontSize: "1rem",
              padding: "6px 10px",
            }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary-blue), var(--primary-purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "0.65rem",
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* MOBILE SLIDE MENU — Frosted Glass Overlay */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed", top: 58, left: 0, right: 0, bottom: 0,
            background: "var(--bg-secondary)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            zIndex: 35, overflowY: "auto",
            padding: 16, animation: "fadeInUp 0.2s ease",
          }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map(item => (
                <Link key={item.path} href={item.path}
                  className={`nav-item ${pathname === item.path ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}>
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "1rem" }}>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div style={{ marginTop: 20, padding: "16px 0", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--primary-blue), var(--primary-purple))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: "0.8rem",
                }}>{initials}</div>
                <div>
                  <p style={{ fontWeight: 700 }}>{user?.full_name || "Student"}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Level {user?.level || 1}</p>
                </div>
              </div>
              <button onClick={logout} style={{
                width: "100%", padding: "11px", borderRadius: 12,
                border: "1px solid rgba(251, 113, 133, 0.3)",
                background: "rgba(251, 113, 133, 0.06)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                color: "var(--danger)",
                cursor: "pointer", fontWeight: 700, fontSize: "0.875rem",
              }}>
                🚪 Log Out
              </button>
            </div>
          </div>
        )}

        {/* DESKTOP HEADER — Frosted Glass */}
        <header className="desktop-sidebar" style={{
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          background: "var(--bg-secondary)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)", flexShrink: 0,
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>{pageTitle}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="stat-badge">
              <span>🔥</span>
              <span>{user?.current_streak || 0} Day Streak</span>
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: "1.1rem" }}>🔔</span>
              <span className="notif-dot" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "clamp(14px, 3vw, 28px)" }}>
          {/* Parent Monitoring Banner */}
          {parentOnline && !parentBannerDismissed && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 18px", marginBottom: 16, borderRadius: 14,
              background: "rgba(192, 132, 252, 0.06)",
              border: "1px solid rgba(192, 132, 252, 0.2)",
              backdropFilter: "blur(12px)",
              animation: "fadeInUp 0.3s ease",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--success)",
                boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.82rem", color: "var(--primary-purple)", fontWeight: 600, flex: 1 }}>
                👀 <strong>{parentOnline.name}</strong> is currently monitoring your dashboard
              </span>
              <button onClick={() => setParentBannerDismissed(true)} style={{
                background: "none", border: "none", color: "var(--text-dim)",
                cursor: "pointer", fontSize: "0.9rem", padding: "2px 6px",
              }}>✕</button>
            </div>
          )}
          {children}
        </div>

        {/* MOBILE BOTTOM NAV — Frosted Glass */}
        <nav className="mobile-bottom-nav" style={{
          display: "none", height: 62,
          background: "var(--bg-secondary)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-subtle)", alignItems: "center",
          justifyContent: "space-around", padding: "0 4px", flexShrink: 0,
        }}>
          {navItems.slice(0, 5).map(item => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "5px 8px", borderRadius: 12, textDecoration: "none",
                color: active ? "var(--primary-cyan)" : "var(--text-dim)",
                fontSize: "0.65rem", fontWeight: active ? 700 : 400, transition: "all 0.25s",
                background: active ? "rgba(125, 211, 252, 0.08)" : "transparent",
              }}>
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
