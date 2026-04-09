"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../../lib/config";

const supabase = supabaseConfig.url ? createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("rol, activo")
      .eq("usuario_id", data.session.user.id)
      .single();

    if (adminError) {
      console.log("Admin error:", adminError);
      await supabase.auth.signOut();
      setError("No tienes acceso de administrador");
      setLoading(false);
      return;
    }

    if (adminData.rol !== "superadmin" || !adminData.activo) {
      await supabase.auth.signOut();
      setError("No tienes acceso de administrador");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: "1rem" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Admin</h1>
          <p style={{ color: "#6b7280" }}>Ingresa tus credenciales</p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", background: "#fee2e2", borderRadius: "8px", color: "#b91c1c", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <a href="/" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Volver a evaluar
          </a>
        </div>
      </div>
    </div>
  );
}