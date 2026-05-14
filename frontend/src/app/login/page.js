"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useAuth } from "@/lib/auth";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, full_name: fullName, role });
      }
      router.push(role === "parent" ? "/parent" : "/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden" }}>
      <div className="bg-blur-cyan" style={{ top: "25%", left: "25%", width: 384, height: 384 }} />
      <div className="bg-blur-purple" style={{ bottom: "25%", right: "25%", width: 384, height: 384 }} />

      <GlassCard style={{ width: "100%", maxWidth: 448, padding: 32, zIndex: 10 }} delay={0}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div className="animate-pulse-glow" style={{
              width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--primary-cyan)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 15px rgba(0,255,229,0.5)",
            }}>
              <span className="animate-pulse" style={{ color: "var(--primary-cyan)", fontWeight: 700, fontSize: "1.25rem" }}>SP</span>
            </div>
          </div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>
            Student <span className="text-gradient">Pulse</span>
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {isLogin ? "Welcome back! Ready to track?" : "Start your wellness journey today."}
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.3)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, color: "var(--danger)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {!isLogin && (
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginLeft: 4, display: "block", marginBottom: 4 }}>Full Name</label>
                <input type="text" className="form-input" placeholder="Alex Lee" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginLeft: 4, display: "block", marginBottom: 4 }}>Email</label>
              <input type="email" className="form-input" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginLeft: 4, display: "block", marginBottom: 4 }}>Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {!isLogin && (
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#d1d5db", marginLeft: 4, display: "block", marginBottom: 4 }}>I am a...</label>
                <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
            )}
            <NeonButton type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
              {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
            </NeonButton>
          </motion.form>
        </AnimatePresence>

        <div style={{ marginTop: 32, textAlign: "center", borderTop: "1px solid var(--border-light)", paddingTop: 24 }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ marginLeft: 8, fontWeight: 700, color: "var(--primary-cyan)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}>
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
