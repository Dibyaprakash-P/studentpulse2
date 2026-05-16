"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { loginWithGoogleCredential } from "@/lib/api";

/* ─── Google SVG Icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [relation, setRelation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();

  // Handle hash redirect (for popup fallback flow)
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined" && window.location.hash && window.location.hash.includes("id_token")) {
        const hash = window.location.hash.substring(1);
        window.history.replaceState(null, "", window.location.pathname);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        if (idToken) {
          // Decode and process
          try {
            const base64Url = idToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(decodeURIComponent(
              atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
            ));
            const googleUser = {
              email: payload.email,
              full_name: payload.name || payload.email.split("@")[0],
              picture: payload.picture || null,
              google_id: payload.sub,
            };
            const data = await loginWithGoogleCredential(googleUser, role);
            localStorage.setItem("sp_user", JSON.stringify(data.user));
            localStorage.setItem("sp_access_token", data.access_token);
            router.push(data.user.role === "parent" ? "/parent" : "/dashboard");
          } catch { /* ignore */ }
        }
      }
    })();
  }, [router, role]);

  // Google Identity Services callback — handles the credential JWT
  const handleGoogleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;
      if (!idToken) {
        setError("Google sign-in failed — no credential received.");
        setLoading(false);
        return;
      }

      // Decode the JWT payload (base64url)
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(
        atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      ));

      const googleUser = {
        email: payload.email,
        full_name: payload.name || payload.email.split("@")[0],
        picture: payload.picture || null,
        google_id: payload.sub,
      };

      const data = await loginWithGoogleCredential(googleUser, role);
      localStorage.setItem("sp_user", JSON.stringify(data.user));
      localStorage.setItem("sp_access_token", data.access_token);
      router.push(data.user.role === "parent" ? "/parent" : "/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  // Password validation rules
  const pwdRules = useMemo(() => [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "At least one number", pass: /\d/.test(password) },
    { label: "At least one symbol (!@#$%...)", pass: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const pwdValid = pwdRules.every(r => r.pass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && !pwdValid) {
      setError("Password doesn't meet the requirements.");
      return;
    }
    if (!isLogin && role === "student" && !gender) {
      setError("Please select your gender.");
      return;
    }
    if (!isLogin && role === "parent" && !relation) {
      setError("Please select your relation.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const userData = { email, password, full_name: fullName, role };
        if (role === "student") {
          userData.date_of_birth = dob;
          userData.gender = gender;
        } else if (role === "parent") {
          userData.relation = relation;
        }
        await register(userData);
      }
      router.push(role === "parent" ? "/parent" : "/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError("");
    setLoading(true);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      setError("Google Sign-In is not configured yet.");
      setLoading(false);
      return;
    }

    // Wait for the GIS library to load
    if (typeof window === "undefined" || !window.google?.accounts) {
      setError("Google Sign-In is still loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    try {
      // First try: GIS One Tap / ID prompt approach
      if (window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const reason = notification.isNotDisplayed()
              ? notification.getNotDisplayedReason()
              : notification.getSkippedReason();
            console.log("GIS prompt unavailable, reason:", reason);

            // Fallback: Use google.accounts.oauth2.initTokenClient (popup, no redirect URI needed)
            if (window.google.accounts.oauth2) {
              const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "openid email profile",
                callback: (tokenResponse) => {
                  if (tokenResponse.error) {
                    setError("Google sign-in was cancelled.");
                    setLoading(false);
                    return;
                  }
                  // Use the access token to fetch user info from Google's userinfo endpoint
                  fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  })
                    .then(res => res.json())
                    .then(async (userInfo) => {
                      const googleUser = {
                        email: userInfo.email,
                        full_name: userInfo.name || userInfo.email.split("@")[0],
                        picture: userInfo.picture || null,
                        google_id: userInfo.sub,
                      };
                      const data = await loginWithGoogleCredential(googleUser, role);
                      localStorage.setItem("sp_user", JSON.stringify(data.user));
                      localStorage.setItem("sp_access_token", data.access_token);
                      router.push(data.user.role === "parent" ? "/parent" : "/dashboard");
                    })
                    .catch(err => {
                      setError("Failed to get user info from Google.");
                      setLoading(false);
                    });
                },
                error_callback: (err) => {
                  console.log("Token client error:", err);
                  setError("Google sign-in was cancelled.");
                  setLoading(false);
                },
              });
              tokenClient.requestAccessToken({ prompt: "select_account" });
            } else {
              setError("Google Sign-In is not available. Please try again later.");
              setLoading(false);
            }
          }
          // If displayed, the user is interacting with the prompt — callback will handle it
        });
      } else {
        setError("Google Sign-In library not loaded. Please refresh the page.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError("Failed to initialize Google Sign-In. Please try again.");
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setDob("");
    setGender("");
    setRelation("");
  };

  const labelStyle = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginLeft: 2, display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      {/* Ambient frosted orbs */}
      <div className="bg-blur-cyan" style={{ top: "15%", left: "15%", width: 350, height: 350 }} />
      <div className="bg-blur-purple" style={{ bottom: "15%", right: "15%", width: 350, height: 350 }} />
      <div className="bg-blur-cyan" style={{ bottom: "40%", left: "60%", width: 180, height: 180, opacity: 0.4 }} />

      {/* Theme toggle */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute", top: 20, right: 20, zIndex: 20,
          width: 42, height: 42, borderRadius: 12,
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </motion.button>

      <GlassCard style={{ width: "100%", maxWidth: 440, padding: "clamp(24px, 5vw, 36px)", zIndex: 10 }} delay={0}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div className="animate-pulse-glow" style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "1px solid rgba(125, 211, 252, 0.25)",
              background: "rgba(125, 211, 252, 0.05)",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4, letterSpacing: "-0.02em" }}>
            Student <span className="text-gradient">Pulse</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {isLogin ? "Welcome back! Ready to track?" : "Start your wellness journey today."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(251, 113, 133, 0.06)", border: "1px solid rgba(251, 113, 133, 0.2)",
            borderRadius: 12, padding: "10px 14px", marginBottom: 14, color: "var(--danger)",
            fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 8,
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ─── Google Sign-In Button ─── */}
        <button onClick={handleGoogleAuth} style={{
          width: "100%", padding: "12px 20px", borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border-subtle)",
          backdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)",
          transition: "all 0.2s",
          marginBottom: 18,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(125,211,252,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
        >
          <GoogleIcon />
          {isLogin ? "Continue with Google" : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 500 }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Full Name (signup only) */}
            {!isLogin && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" className="form-input" placeholder="Alex Lee" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" className="form-input" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem",
                  }}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Live password validation (signup only) */}
              {!isLogin && password.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  {pwdRules.map((r, i) => (
                    <div key={i} className={`pwd-rule ${r.pass ? "pass" : "fail"}`}>
                      <span>{r.pass ? "✅" : "○"}</span>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role selector (signup only) */}
            {!isLogin && (
              <div>
                <label style={labelStyle}>I am a...</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "student", icon: "🎓", label: "Student" },
                    { value: "parent", icon: "👨‍👩‍👦", label: "Parent" },
                  ].map(r => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)}
                      style={{
                        flex: 1, padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${role === r.value ? "var(--primary-cyan)" : "var(--border-subtle)"}`,
                        background: role === r.value ? "rgba(125,211,252,0.08)" : "transparent",
                        color: role === r.value ? "var(--primary-cyan)" : "var(--text-muted)",
                        fontWeight: role === r.value ? 700 : 500, fontSize: "0.88rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all 0.2s",
                      }}>
                      <span>{r.icon}</span> {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Student-specific fields ─── */}
            {!isLogin && role === "student" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>📅 Date of Birth</label>
                    <input type="date" className="form-input" value={dob}
                      onChange={e => setDob(e.target.value)} style={{ colorScheme: "dark" }} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Male", "Female"].map(g => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                            border: `1px solid ${gender === g ? (g === "Male" ? "#60a5fa" : "#f472b6") : "var(--border-subtle)"}`,
                            background: gender === g ? (g === "Male" ? "rgba(96,165,250,0.08)" : "rgba(244,114,182,0.08)") : "transparent",
                            color: gender === g ? (g === "Male" ? "#60a5fa" : "#f472b6") : "var(--text-muted)",
                            fontWeight: gender === g ? 700 : 500, fontSize: "0.82rem",
                            transition: "all 0.2s",
                          }}>
                          {g === "Male" ? "♂️" : "♀️"} {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Parent-specific fields ─── */}
            {!isLogin && role === "parent" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}>
                <label style={labelStyle}>Relation to Student</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Father", "Mother", "Other"].map(r => (
                    <button key={r} type="button" onClick={() => setRelation(r)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${relation === r ? "var(--primary-purple)" : "var(--border-subtle)"}`,
                        background: relation === r ? "rgba(192,132,252,0.08)" : "transparent",
                        color: relation === r ? "var(--primary-purple)" : "var(--text-muted)",
                        fontWeight: relation === r ? 700 : 500, fontSize: "0.82rem",
                        transition: "all 0.2s",
                      }}>
                      {r === "Father" ? "👨" : r === "Mother" ? "👩" : "👤"} {r}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <NeonButton type="submit" disabled={loading || (!isLogin && !pwdValid)} style={{ width: "100%", marginTop: 6 }}>
              {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
            </NeonButton>
          </motion.form>
        </AnimatePresence>

        <div style={{ marginTop: 22, textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={switchMode}
              style={{ marginLeft: 8, fontWeight: 700, color: "var(--primary-cyan)", background: "none", border: "none", cursor: "pointer" }}>
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
