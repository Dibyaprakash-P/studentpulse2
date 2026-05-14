"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function ParentDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const navItems = [
    { name: "Student Overview", path: "/parent", icon: "👨‍🎓" },
    { name: "Wellness Reports", path: "/parent/reports", icon: "📄" },
    { name: "Alert Center", path: "/parent/alerts", icon: "🔔" },
  ];

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "P";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="pulse-loader" />
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <aside className="glass-panel" style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", zIndex: 20, borderRadius: 0, borderTop: "none", borderBottom: "none", borderLeft: "none" }}>
        <div style={{ height: 80, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--primary-purple)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px rgba(176,38,255,0.5)" }}>
              <span style={{ color: "var(--primary-purple)", fontSize: "0.75rem" }}>SP</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.125rem", fontFamily: "'Outfit',sans-serif" }}>Parent Portal</span>
          </div>
        </div>

        <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(item => (
              <Link key={item.path} href={item.path}
                className={`nav-item ${pathname === item.path ? "active active-purple" : ""}`}>
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ padding: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(176,38,255,0.3)", border: "1px solid var(--primary-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user?.full_name || "Parent"}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Parent Account</p>
            </div>
            <button onClick={logout} title="Logout" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>🚪</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
        <header className="glass-panel" style={{ height: 80, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 10, borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, textTransform: "capitalize" }}>
            {pathname.split("/").pop() === "parent" ? "Overview" : pathname.split("/").pop()}
          </h2>
        </header>
        <div style={{ flex: 1, overflow: "auto", padding: 32, zIndex: 10 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
