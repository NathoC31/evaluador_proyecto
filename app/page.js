"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [standSeleccionado, setStandSeleccionado] = useState(null);
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (supabase) {
      cargarStands();
    } else {
      setError("Configura las credenciales de Supabase en .env.local");
      setLoading(false);
    }
  }, []);

  async function cargarStands() {
    const { data } = await supabase.from("stands").select("*").order("nombre");
    if (data) setStands(data);
    setLoading(false);
  }

  if (standSeleccionado) {
    return <EvaluacionStand stand={standSeleccionado} onBack={() => setStandSeleccionado(null)} />;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "1rem", maxWidth: "500px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem", marginTop: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem", letterSpacing: "-0.025em" }}>
          Evaluación de Stands
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>Selecciona un stand para evaluar</p>
      </div>

      
      {error && (
        <div style={{ padding: "1rem", background: "#fef2f2", borderRadius: "12px", color: "#dc2626", marginBottom: "1rem", textAlign: "center", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {stands.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", background: "#f9fafb", borderRadius: "16px" }}>
          No hay stands disponibles
        </div>
      )}

      {stands.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {stands.map(stand => (
            <button
              key={stand.id}
              onClick={() => setStandSeleccionado(stand)}
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s", boxSizing: "border-box" }}
            >
              <div style={{ width: "48px", height: "48px", background: "#374151", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.25rem" }}>
                {stand.nombre.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#1f2937", fontSize: "1.1rem" }}>{stand.nombre}</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{stand.categoria || "Sin categoría"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EvaluacionStand({ stand, onBack }) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function enviarEvaluacion() {
    if (calificacion === 0) return;
    setLoading(true);

    const { error } = await supabase.from("evaluaciones").insert({
      stand_id: stand.id,
      calificacion,
      comentario: comentario.trim() || null,
      fecha: new Date().toISOString()
    });

    if (!error) {
      setEnviado(true);
    }
    setLoading(false);
  }

  if (enviado) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "80px", height: "80px", background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>¡Gracias!</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Tu evaluación ha sido enviada</p>
          <button onClick={onBack} className="btn-primary">Evaluar otro stand</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#6b7280", marginBottom: "1rem" }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stand.nombre}</h2>
          <p style={{ color: "#6b7280" }}>{stand.categoria}</p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem" }}>¿Cómo evaluarías este stand?</p>
          <p style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem" }}>Teniendo en cuenta 5 como la calificación máxima y 1 como la mínima</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setCalificacion(num)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill={calificacion >= num ? "#f59e0b" : "none"} stroke={calificacion >= num ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <p style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
            {calificacion === 0 ? "Toca las estrellas" : calificacion === 1 ? "1 estrella" : `${calificacion} estrellas`}
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Comentario (opcional)</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu opinión..."
            rows={3}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "1rem", resize: "none" }}
          />
        </div>

        <button
          onClick={enviarEvaluacion}
          disabled={calificacion === 0 || loading}
          className="btn-primary"
          style={{ width: "100%", opacity: calificacion === 0 ? 0.5 : 1 }}
        >
          {loading ? "Enviando..." : "Enviar Evaluación"}
        </button>
      </div>
</div>
    
  );
}