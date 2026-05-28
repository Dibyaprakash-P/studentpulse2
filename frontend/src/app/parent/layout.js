"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export default function ParentDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  /* Mark parent as online for the student to see */
  useEffect(() => {
    if (user && user.role === "parent") {
      localStorage.setItem("sp_parent_online", JSON.stringify({
        name: user.full_name || "Parent",
        since: new Date().toISOString(),
        active: true,
      }));
      const interval = setInterval(() => {
        localStorage.setItem("sp_parent_online", JSON.stringify({
          name: user.full_name || "Parent",
          since: new Date().toISOString(),
          active: true,
        }));
      }, 30000);
      return () => {
        clearInterval(interval);
        localStorage.removeItem("sp_parent_online");
      };
    }
  }, [user]);

  const navItems = [
    { name: "Student Overview", path: "/parent", icon: "👨‍🎓" },
    { name: "Homework Monitor", path: "/parent/homework", icon: "📋" },
    { name: "Projects Monitor", path: "/parent/projects", icon: "📁" },
    { name: "Report Cards", path: "/parent/reportcards", icon: "📄" },
    { name: "Wellness Reports", path: "/parent/reports", icon: "📊" },
    { name: "Alert Center", path: "/parent/alerts", icon: "🔔" },
  ];

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "P";
  const pageTitle = navItems.find(i => i.path === pathname)?.name || "Parent Portal";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div className="pulse-loader" />
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* DESKTOP SIDEBAR — Frosted Glass */}
      <aside className="desktop-sidebar" style={{
        width: 250, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ height: 68, display: "flex", alignItems: "center", padding: "0 22px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary-green), var(--primary-green-deep))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(57, 255, 20, 0.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>Parent Portal</span>
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

        {/* Theme Toggle + User */}
        <div style={{ padding: 14, borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={toggle} style={{
            width: "100%", padding: "9px 14px", borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)", color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: "0.82rem", fontWeight: 600, marginBottom: 10,
          }}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary-green), var(--primary-green-deep))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "0.75rem",
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.full_name || "Parent"}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Parent Account</p>
            </div>
            <button onClick={logout} title="Logout" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
              borderRadius: 8, color: "var(--text-dim)", cursor: "pointer", fontSize: "0.9rem", padding: "6px 8px",
            }}>🚪</button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* MOBILE HEADER */}
        <header className="mobile-header" style={{
          height: 58, padding: "0 16px", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-secondary)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)", zIndex: 40, display: "none",
        }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, color: "var(--text-main)", fontSize: "1.1rem", cursor: "pointer", padding: "6px 10px",
          }}>{mobileMenuOpen ? "✕" : "☰"}</button>
          <span style={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem" }}>{pageTitle}</span>
          <button onClick={toggle} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, cursor: "pointer", fontSize: "1rem", padding: "6px 10px",
          }}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </header>

        {/* MOBILE SLIDE MENU */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed", top: 58, left: 0, right: 0, bottom: 0,
            background: "var(--bg-secondary)", backdropFilter: "blur(24px)",
            zIndex: 35, overflowY: "auto", padding: 16,
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
          </div>
        )}

        {/* DESKTOP HEADER */}
        <header className="desktop-sidebar" style={{
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", background: "var(--bg-secondary)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)", flexShrink: 0,
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{pageTitle}</h2>
          <div style={{
            padding: "5px 14px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600,
            background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.2)",
            color: "var(--primary-green)", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
            Monitoring Active
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "clamp(14px, 3vw, 28px)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
