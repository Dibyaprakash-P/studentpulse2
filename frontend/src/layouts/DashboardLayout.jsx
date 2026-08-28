import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Lucide-style SVG Icons */
const Icons = {
  overview: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  tracker: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>,
  homework: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>,
  attendance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  notes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>,
  projects: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/><path d="M10 9h1"/></svg>,
  burnout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 12 6"/><path d="M12 12 16 14"/></svg>,
  productivity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  achievements: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>,
  about: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  fire: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parentOnline, setParentOnline] = useState(null);
  const [parentBannerDismissed, setParentBannerDismissed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => { setMobileMenuOpen(false); setNotifOpen(false); }, [pathname]);

  /* Close notification panel on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Generate smart notifications based on user data */
  useEffect(() => {
    if (!user) return;
    const notifs = [];
    const now = new Date();

    if ((user.current_streak || 0) >= 7) {
      notifs.push({ id: "streak", icon: Icons.fire, color: "var(--accent)", title: "Streak milestone!", desc: `You're on a ${user.current_streak}-day streak. Keep it up!`, time: "Just now", read: false });
    }
    if ((user.current_streak || 0) === 0) {
      notifs.push({ id: "streak-lost", icon: Icons.fire, color: "var(--warning)", title: "Start your streak", desc: "Log today's mood and tasks to begin a new streak.", time: "Today", read: false });
    }
    notifs.push({ id: "welcome", icon: Icons.bell, color: "var(--cyan)", title: "Welcome back!", desc: `Good ${now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, ${user.full_name?.split(" ")[0] || "Student"}. Ready to track today?`, time: "Now", read: true });
    notifs.push({ id: "tip", icon: Icons.achievements, color: "var(--purple)", title: "Pro tip", desc: "Use the Burnout page to monitor your stress levels weekly.", time: "Tip", read: true });

    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }, [user]);

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
    { name: "Overview", path: "/dashboard", icon: Icons.overview },
    { name: "Tracker", path: "/dashboard/tracker", icon: Icons.tracker },
    { name: "Assignments", path: "/dashboard/homework", icon: Icons.homework },
    { name: "Attendance", path: "/dashboard/attendance", icon: Icons.attendance },
    { name: "Notes", path: "/dashboard/notes", icon: Icons.notes },
    { name: "Projects", path: "/dashboard/projects", icon: Icons.projects },
    { name: "Report Cards", path: "/dashboard/reports", icon: Icons.reports },
    { name: "Burnout", path: "/dashboard/burnout", icon: Icons.burnout },
    { name: "Productivity", path: "/dashboard/productivity", icon: Icons.productivity },
    { name: "Achievements", path: "/dashboard/achievements", icon: Icons.achievements },
    { name: "About Us", path: "/dashboard/about", icon: Icons.about },
    { name: "Profile", path: "/dashboard/profile", icon: Icons.settings },
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

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className="desktop-sidebar" style={{
        width: 230, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{
          height: 60, display: "flex", alignItems: "center", padding: "0 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 6,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 700, fontSize: "0.75rem",
              fontFamily: "var(--font-display)",
            }}>SP</div>
            <span style={{
              fontWeight: 700, fontSize: "0.95rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}>Pulse</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: "10px 10px", flex: 1, overflowY: "auto" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`nav-item ${pathname === item.path ? "active" : ""}`}>
                <span style={{ width: 18, height: 18, display: "flex", flexShrink: 0 }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User section */}
        <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 4px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 700, fontSize: "0.7rem",
              fontFamily: "var(--font-display)",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "0.8rem", fontWeight: 600,
                fontFamily: "var(--font-display)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{user?.full_name || "Student"}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Level {user?.level || 1}</p>
            </div>
            <button onClick={logout} title="Logout"
              style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                borderRadius: 6, color: "var(--text-dim)", cursor: "pointer",
                padding: "5px 6px", display: "flex",
                transition: "all 0.2s",
              }}>
              <span style={{ width: 14, height: 14, display: "flex" }}>{Icons.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* MOBILE HEADER */}
        <header className="mobile-header" style={{
          height: 54, padding: "0 16px", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
          zIndex: 40, display: "none",
        }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
            borderRadius: 6, color: "var(--text-main)",
            cursor: "pointer", padding: "6px", display: "flex",
          }}>
            <span style={{ width: 18, height: 18, display: "flex" }}>
              {mobileMenuOpen ? Icons.close : Icons.menu}
            </span>
          </button>
          <span style={{
            fontWeight: 700, fontFamily: "var(--font-display)",
            fontSize: "0.95rem", letterSpacing: "-0.02em",
          }}>
            {pageTitle}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mobile theme toggle */}
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 30, height: 30, borderRadius: 6,
                background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-secondary)", cursor: "pointer",
              }}
            >
              <span style={{ width: 16, height: 16, display: "flex" }}>
                {theme === "dark" ? Icons.sun : Icons.moon}
              </span>
            </button>
            <div style={{
              width: 30, height: 30, borderRadius: 6,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 700, fontSize: "0.6rem",
              fontFamily: "var(--font-display)",
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* MOBILE SLIDE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed", top: 54, left: 0, right: 0, bottom: 0,
                background: "var(--bg-secondary)",
                zIndex: 35, overflowY: "auto", padding: 14,
              }}
            >
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {navItems.map(item => (
                  <Link key={item.path} to={item.path}
                    className={`nav-item ${pathname === item.path ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <span style={{ width: 18, height: 18, display: "flex" }}>{item.icon}</span>
                    <span style={{ fontSize: "0.95rem" }}>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div style={{ marginTop: 16, padding: "14px 0", borderTop: "1px solid var(--border-subtle)" }}>
                <button onClick={logout} style={{
                  width: "100%", padding: "10px", borderRadius: 6,
                  border: "1px solid rgba(255, 59, 59, 0.2)",
                  background: "rgba(255, 59, 59, 0.06)",
                  color: "var(--danger)",
                  cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ width: 16, height: 16, display: "flex" }}>{Icons.logout}</span>
                  Log Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DESKTOP HEADER */}
        <header className="desktop-sidebar" style={{
          height: 54, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)", flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: "1.1rem", fontWeight: 700,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}>{pageTitle}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="stat-badge">
              <span style={{ width: 14, height: 14, display: "flex", color: "var(--accent)" }}>{Icons.fire}</span>
              <span>{user?.current_streak || 0} Day Streak</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle-btn"
              style={{
                position: "relative", width: 36, height: 36, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.3s ease",
              }}
            >
              <span style={{
                width: 18, height: 18, display: "flex",
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s",
                transform: theme === "dark" ? "rotate(0deg)" : "rotate(180deg)",
              }}>
                {theme === "dark" ? Icons.sun : Icons.moon}
              </span>
            </button>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) { setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); } }}
                title="Notifications"
                className="theme-toggle-btn"
                style={{
                  position: "relative", width: 36, height: 36, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
                  cursor: "pointer", transition: "all 0.3s ease",
                }}
              >
                <span style={{ width: 18, height: 18, display: "flex" }}>{Icons.bell}</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 4,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--accent)",
                    border: "2px solid var(--bg-secondary)",
                    animation: "pulse 2s infinite",
                  }} />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      width: 340, maxHeight: 420, overflowY: "auto",
                      background: "var(--bg-card-solid)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-float)",
                      zIndex: 100,
                    }}
                  >
                    <div style={{
                      padding: "14px 16px 10px", borderBottom: "1px solid var(--border-subtle)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <h4 style={{
                        fontSize: "0.85rem", fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        letterSpacing: "-0.02em",
                      }}>Notifications</h4>
                      <span style={{
                        fontSize: "0.7rem", color: "var(--text-dim)",
                        fontFamily: "var(--font-display)",
                      }}>{notifications.length} total</span>
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                        No notifications yet
                      </div>
                    ) : (
                      <div style={{ padding: "6px" }}>
                        {notifications.map(notif => (
                          <div key={notif.id} style={{
                            display: "flex", gap: 12, padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            transition: "background 0.2s",
                            cursor: "pointer",
                            background: notif.read ? "transparent" : "var(--accent-subtle)",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                            onMouseLeave={e => e.currentTarget.style.background = notif.read ? "transparent" : "var(--accent-subtle)"}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: "var(--radius-md)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              background: `color-mix(in srgb, ${notif.color || 'var(--accent)'} 12%, transparent)`,
                              color: notif.color || "var(--accent)",
                            }}>
                              <span style={{ width: 16, height: 16, display: "flex" }}>{notif.icon}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: "0.8rem", fontWeight: 600,
                                fontFamily: "var(--font-display)",
                                marginBottom: 2,
                              }}>{notif.title}</p>
                              <p style={{
                                fontSize: "0.75rem", color: "var(--text-secondary)",
                                lineHeight: 1.4,
                              }}>{notif.desc}</p>
                            </div>
                            <span style={{
                              fontSize: "0.65rem", color: "var(--text-dim)",
                              fontFamily: "var(--font-display)",
                              whiteSpace: "nowrap", flexShrink: 0, marginTop: 2,
                            }}>{notif.time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{
                      padding: "10px 16px", borderTop: "1px solid var(--border-subtle)",
                      textAlign: "center",
                    }}>
                      <button
                        onClick={() => setNotifOpen(false)}
                        style={{
                          background: "none", border: "none", color: "var(--accent)",
                          fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          textTransform: "uppercase", letterSpacing: "0.04em",
                        }}
                      >Close</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "clamp(14px, 3vw, 24px)" }}>
          {/* Parent Monitoring Banner */}
          {parentOnline && !parentBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", marginBottom: 14, borderRadius: 6,
                background: "var(--accent-subtle)",
                border: "1px solid rgba(255, 77, 0, 0.12)",
                borderLeft: "3px solid var(--accent)",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--success)",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500, flex: 1 }}>
                <strong style={{ color: "var(--accent)" }}>{parentOnline.name}</strong> is currently monitoring your dashboard
              </span>
              <button onClick={() => setParentBannerDismissed(true)} style={{
                background: "none", border: "none", color: "var(--text-dim)",
                cursor: "pointer", fontSize: "0.85rem", padding: "2px 6px", display: "flex",
              }}>
                <span style={{ width: 14, height: 14, display: "flex" }}>{Icons.close}</span>
              </button>
            </motion.div>
          )}
          <Outlet />
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="mobile-bottom-nav" style={{
          display: "none", height: 56,
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", flexShrink: 0,
        }}>
          {navItems.slice(0, 5).map(item => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "4px 8px", borderRadius: 6, textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-dim)",
                fontSize: "0.6rem", fontWeight: active ? 700 : 400,
                fontFamily: "var(--font-display)",
                transition: "color 0.2s",
              }}>
                <span style={{ width: 18, height: 18, display: "flex" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
