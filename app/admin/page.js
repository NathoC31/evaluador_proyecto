"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../../lib/config";

const supabase = supabaseConfig.url ? createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stands, setStands] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [activeTab, setActiveTab] = useState("stands");
  const [showModal, setShowModal] = useState(false);
  const [editStand, setEditStand] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", categoria: "" });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) {
      window.location.href = "/admin-login";
      return;
    }
    
    const { data: isAdmin } = await supabase.rpc("is_superadmin", {
      user_uuid: s.user.id
    });
    
    if (!isAdmin) {
      window.location.href = "/";
      return;
    }
    
    setSession(s);
    loadData();
  }

  // Filtros
  const [filtroStand, setFiltroStand] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  function getEvaluacionesFiltradas() {
    let filtered = [...evaluaciones];
    
    if (filtroStand !== "todos") {
      filtered = filtered.filter(e => e.stand_id === filtroStand);
    }
    
    if (filtroFecha !== "todos") {
      const now = new Date();
      const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(e => {
        const fecha = new Date(e.fecha);
        if (filtroFecha === "hoy") return fecha >= hoy;
        if (filtroFecha === "semana") {
          const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fecha >= semanaAtras;
        }
        if (filtroFecha === "mes") {
          const mesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
          return fecha >= mesAtras;
        }
        return true;
      });
    }
    
    if (busqueda.trim()) {
      const search = busqueda.toLowerCase();
      filtered = filtered.filter(e => 
        e.stands?.nombre?.toLowerCase().includes(search) ||
        e.comentario?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  function exportarCSV() {
    const evs = getEvaluacionesFiltradas();
    const headers = ["Stand", "Calificación", "Comentario", "Fecha"];
    const rows = evs.map(e => [
      e.stands?.nombre || "",
      e.calificacion,
      e.comentario || "",
      new Date(e.fecha).toLocaleString()
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluaciones_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  async function loadData() {
    const { data: standsData } = await supabase.from("stands").select("*").order("nombre");
    setStands(standsData || []);
    
    const { data: evData } = await supabase
      .from("evaluaciones")
      .select("*, stands(nombre)")
      .order("fecha", { ascending: false })
      .limit(100);
    setEvaluaciones(evData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (editStand) {
      await supabase.from("stands").update({ nombre: formData.nombre, categoria: formData.categoria }).eq("id", editStand.id);
    } else {
      await supabase.from("stands").insert([{ nombre: formData.nombre, categoria: formData.categoria }]);
    }
    
    setShowModal(false);
    setEditStand(null);
    setFormData({ nombre: "", categoria: "" });
    loadData();
  }

  function openEdit(stand) {
    setEditStand(stand);
    setFormData({ nombre: stand.nombre, categoria: stand.categoria || "" });
    setShowModal(true);
  }

  async function deleteStand(id) {
    if (confirm("¿Eliminar stand?")) {
      await supabase.from("stands").delete().eq("id", id);
      loadData();
    }
  }

  function getPromedio(standId) {
    const evs = evaluaciones.filter(e => e.stand_id === standId);
    if (evs.length === 0) return "-";
    const sum = evs.reduce((acc, e) => acc + e.calificacion, 0);
    return (sum / evs.length).toFixed(1);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><div className="spinner"></div></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Admin - Evaluación de Stands</h1>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Salir</button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button onClick={() => setActiveTab("stands")} style={{ padding: "0.75rem 1.5rem", background: activeTab === "stands" ? "#4f46e5" : "white", color: activeTab === "stands" ? "white" : "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>Stands</button>
          <button onClick={() => setActiveTab("evaluaciones")} style={{ padding: "0.75rem 1.5rem", background: activeTab === "evaluaciones" ? "#4f46e5" : "white", color: activeTab === "evaluaciones" ? "white" : "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>Evaluaciones</button>
          <button onClick={() => setActiveTab("resumen")} style={{ padding: "0.75rem 1.5rem", background: activeTab === "resumen" ? "#4f46e5" : "white", color: activeTab === "resumen" ? "white" : "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>Resumen</button>
        </div>

        {activeTab === "stands" && (
          <div>
            <button onClick={() => { setEditStand(null); setFormData({ nombre: "", categoria: "" }); setShowModal(true); }} className="btn-primary" style={{ marginBottom: "1rem" }}>+ Nuevo Stand</button>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              {stands.map(stand => (
                <div key={stand.id} style={{ background: "white", padding: "1rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{stand.nombre}</p>
                    <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{stand.categoria || "Sin categoría"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#4f46e5" }}>{getPromedio(stand.id)} ★</span>
                    <button onClick={() => openEdit(stand)} style={{ padding: "0.5rem", background: "#f3f4f6", border: "none", borderRadius: "6px", cursor: "pointer" }}>✏️</button>
                    <button onClick={() => deleteStand(stand.id)} style={{ padding: "0.5rem", background: "#fee2e2", border: "none", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "evaluaciones" && (
          <div>
            <div style={{ background: "white", padding: "1rem", borderRadius: "12px", marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", flex: "1", minWidth: "150px" }}
              />
              <select value={filtroStand} onChange={e => setFiltroStand(e.target.value)} style={{ padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                <option value="todos">Todos los stands</option>
                {stands.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
              <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={{ padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                <option value="todos">Todo el tiempo</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
              </select>
              <button onClick={exportarCSV} style={{ padding: "0.5rem 1rem", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                📥 Exportar CSV
              </button>
            </div>
            
            <p style={{ marginBottom: "0.75rem", color: "#6b7280", fontSize: "0.85rem" }}>
              {getEvaluacionesFiltradas().length} resultado(s)
            </p>
            
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {getEvaluacionesFiltradas().map(ev => (
                <div key={ev.id} style={{ background: "white", padding: "1rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{ev.stands?.nombre || "Stand eliminado"}</p>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{ev.comentario || "Sin comentario"}</p>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{new Date(ev.fecha).toLocaleString()}</p>
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} style={{ color: n <= ev.calificacion ? "#f59e0b" : "#d1d5db" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "resumen" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "#4f46e5" }}>{stands.length}</p>
                <p style={{ color: "#6b7280" }}>Stands</p>
              </div>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981" }}>{evaluaciones.length}</p>
                <p style={{ color: "#6b7280" }}>Evaluaciones</p>
              </div>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>{evaluaciones.length > 0 ? (evaluaciones.reduce((a, e) => a + e.calificacion, 0) / evaluaciones.length).toFixed(1) : "-"}</p>
                <p style={{ color: "#6b7280" }}>Promedio General</p>
              </div>
            </div>
            
            <h3 style={{ marginBottom: "1rem" }}>Ranking de Stands</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {stands
                .map(stand => {
                  const evs = evaluaciones.filter(e => e.stand_id === stand.id);
                  const avg = evs.length > 0 ? (evs.reduce((a, e) => a + e.calificacion, 0) / evs.length) : 0;
                  return { ...stand, avg, count: evs.length };
                })
                .sort((a, b) => b.avg - a.avg)
                .map(stand => (
                  <div key={stand.id} style={{ background: "white", padding: "1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500 }}>{stand.nombre}</span>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>{stand.avg.toFixed(1)} ★ ({stand.count} evs)</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ marginBottom: "1rem" }}>{editStand ? "Editar Stand" : "Nuevo Stand"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Nombre</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px" }} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Categoría</label>
                <input type="text" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px" }} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.75rem 1.5rem", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}