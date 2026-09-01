import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const navigate = useNavigate();
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
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();

  // Pre-fill email if remembered
  useEffect(() => {
    const savedEmail = localStorage.getItem("sp_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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
            navigate(data.user.role === "parent" ? "/parent" : "/dashboard");
          } catch { /* ignore */ }
        }
      }
    })();
  }, [navigate, role]);

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
      navigate(data.user.role === "parent" ? "/parent" : "/dashboard");
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
        await login(email, password, rememberMe);
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
      navigate(role === "parent" ? "/parent" : "/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError("");
    setLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      setError("Google Sign-In is not configured yet.");
      setLoading(false);
      return;
    }

    // Use redirect-based OAuth flow (no popups, no COOP issues, no deprecated APIs)
    // Redirects the user to Google's auth page, then back to /login with id_token in the hash
    const redirectUri = window.location.origin + "/login";
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("nonce", Math.random().toString(36).substring(2));
    authUrl.searchParams.set("prompt", "select_account");
    window.location.href = authUrl.toString();
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setDob("");
    setGender("");
    setRelation("");
  };

  const labelStyle = { fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-display)" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* Back to home */}
      <a href="/" style={{
        position: "absolute", top: 20, left: 20, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8,
        color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 500,
        textDecoration: "none", fontFamily: "var(--font-display)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back
      </a>

      <GlassCard style={{ width: "100%", maxWidth: 440, padding: "clamp(24px, 5vw, 36px)", zIndex: 10 }} delay={0}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 8,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 700, fontSize: "1rem",
              fontFamily: "var(--font-display)",
            }}>SP</div>
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4, letterSpacing: "-0.03em" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {isLogin ? "Sign in to continue" : "Start your wellness journey"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255, 59, 59, 0.06)", border: "1px solid rgba(255, 59, 59, 0.15)",
            borderLeft: "3px solid var(--danger)",
            borderRadius: 6, padding: "10px 14px", marginBottom: 14, color: "var(--danger)",
            fontSize: "0.78rem",
          }}>
            {error}
          </div>
        )}

        {/* ─── Google Sign-In Button ─── */}
        <button onClick={handleGoogleAuth} style={{
          width: "100%", padding: "12px 20px", borderRadius: 6,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-light)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontSize: "0.85rem", fontWeight: 500, color: "var(--text-main)",
          fontFamily: "var(--font-body)",
          transition: "border-color 0.2s",
          marginBottom: 18,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-medium)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
        >
          <GoogleIcon />
          {isLogin ? "Continue with Google" : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontWeight: 500, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
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
                    background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer",
                    fontSize: "0.72rem", fontFamily: "var(--font-display)", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              {/* Live password validation (signup only) */}
              {!isLogin && password.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  {pwdRules.map((r, i) => (
                    <div key={i} className={`pwd-rule ${r.pass ? "pass" : "fail"}`}>
                      <span>{r.pass ? "✓" : "○"}</span>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remember Me checkbox (login only) */}
            {isLogin && (
              <label style={{
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", fontSize: "0.82rem", color: "var(--text-muted)",
                userSelect: "none", padding: "2px 0",
              }}>
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `1.5px solid ${rememberMe ? 'var(--accent)' : 'var(--border-medium)'}`,
                    background: rememberMe ? 'var(--accent-dim)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease', flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  {rememberMe && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{ fontWeight: rememberMe ? 600 : 400 }}>Remember me</span>
              </label>
            )}

            {/* Role selector (signup only) */}
            {!isLogin && (
              <div>
                <label style={labelStyle}>I am a...</label>
                <div style={{ display: "flex", gap: 6, background: "var(--bg-elevated)", borderRadius: 6, padding: 3, border: "1px solid var(--border-light)" }}>
                  {[
                    { value: "student", label: "Student" },
                    { value: "parent", label: "Parent" },
                  ].map(r => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)}
                      style={{
                        flex: 1, padding: "9px 14px", borderRadius: 4, cursor: "pointer",
                        border: "none",
                        background: role === r.value ? "var(--accent)" : "transparent",
                        color: role === r.value ? "#000" : "var(--text-muted)",
                        fontWeight: 700, fontSize: "0.8rem",
                        fontFamily: "var(--font-display)",
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        transition: "all 0.2s",
                      }}>
                      {r.label}
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
                    <label style={labelStyle}>Date of Birth</label>
                    <input type="date" className="form-input" value={dob}
                      onChange={e => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{ colorScheme: "dark" }} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Male", "Female"].map(g => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          style={{
                            flex: 1, padding: "9px 8px", borderRadius: 6, cursor: "pointer",
                            border: `1px solid ${gender === g ? "var(--accent)" : "var(--border-light)"}`,
                            background: gender === g ? "var(--accent-dim)" : "transparent",
                            color: gender === g ? "var(--accent)" : "var(--text-muted)",
                            fontWeight: 600, fontSize: "0.8rem",
                            fontFamily: "var(--font-display)",
                            transition: "all 0.2s",
                          }}>
                          {g}
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
                        flex: 1, padding: "9px 8px", borderRadius: 6, cursor: "pointer",
                        border: `1px solid ${relation === r ? "var(--accent)" : "var(--border-light)"}`,
                        background: relation === r ? "var(--accent-dim)" : "transparent",
                        color: relation === r ? "var(--accent)" : "var(--text-muted)",
                        fontWeight: 600, fontSize: "0.8rem",
                        fontFamily: "var(--font-display)",
                        transition: "all 0.2s",
                      }}>
                      {r}
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
              style={{ marginLeft: 8, fontWeight: 700, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}>
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
