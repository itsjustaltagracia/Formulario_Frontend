import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "/api";

const FormWrapper = ({ children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {children}
    </div>
  </div>
);

const FormFooter = ({ nextLabel, loading }) => (
  <div className="flex items-center justify-end pt-10 border-t border-slate-200">
    <button
      type="submit"
      disabled={loading}
      className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: "#51626f", boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}
    >
      {loading ? "Guardando..." : `${nextLabel} →`}
    </button>
  </div>
);

const P      = "#51626f";
const FOCUS  = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT  = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;
const SELECT = `${INPUT} bg-white appearance-none`;

const NIVEL_OPS = [
  "primaria","bachillerato","bachiller_tecnico","Técnico",
  "universitario","licenciatura","maestria","ingenieria","doctorado","otros","ninguno",
];
const NIVEL_LABELS = {
  primaria: "Educación primaria", bachillerato: "Bachillerato",
  bachiller_tecnico: "Bachiller Técnico", Técnico: "Técnico",
  universitario: "Universitario", licenciatura: "Licenciatura",
  maestria: "Maestría", ingenieria: "Ingeniería", doctorado: "Doctorado",
  otros: "Otros", ninguno: "Ninguno / No aplica",
};
const NIVEL_CON_TIPO = ["licenciatura","maestria","ingenieria","doctorado","otros","Técnico","bachiller_tecnico"];

function useNivelAcademico(init = {}) {
  const [nivel,    setNivel]    = useState(init.nivel    || "");
  const [duracion, setDuracion] = useState(init.duracion || "");
  const [tipo,     setTipo]     = useState(init.tipo     || "");
  const [showDur,  setShowDur]  = useState(!!init.nivel && init.nivel !== "ninguno");
  const [showTipo, setShowTipo] = useState(NIVEL_CON_TIPO.includes(init.nivel));

  const onChange = (v) => {
    setNivel(v);
    setShowDur(v && v !== "ninguno");
    setShowTipo(NIVEL_CON_TIPO.includes(v));
    if (!NIVEL_CON_TIPO.includes(v)) setTipo("");
  };
  return { nivel, duracion, setDuracion, tipo, setTipo, showDur, showTipo, onChange };
}

const NivelSelect = ({ hook, onClearErrors }) => (
  <div>
    <select
      value={hook.nivel}
      onChange={e => { hook.onChange(e.target.value); onClearErrors(); }}
      className={SELECT}
    >
      <option value="">Seleccione</option>
      {NIVEL_OPS.map(v => <option key={v} value={v}>{NIVEL_LABELS[v]}</option>)}
    </select>
    {hook.showDur && (
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Estado de estudios</label>
        <select
          value={hook.duracion}
          onChange={e => { hook.setDuracion(e.target.value); onClearErrors(); }}
          className={SELECT}
        >
          <option value="">Seleccione estado</option>
          <option value="completado">Completado</option>
          <option value="en_proceso">En proceso</option>
          <option value="incompleto">Incompleto</option>
        </select>
      </div>
    )}
    {hook.showTipo && (
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Especifique el tipo</label>
        <input
          value={hook.tipo}
          onChange={e => { hook.setTipo(e.target.value); onClearErrors(); }}
          placeholder="Ej: en Derecho"
          className={INPUT}
          type="text"
        />
      </div>
    )}
  </div>
);

export default function Step1Form() {
  const navigate = useNavigate();

  const [saved, setSaved]           = useState(() => JSON.parse(localStorage.getItem("entrevista") || "{}"));
  const [modoLectura, setModoLectura] = useState(() => localStorage.getItem("entrevista_modo_lectura") === "true");
  
  // Solo fecha (YYYY-MM-DD) - sin hora
  const [currentDate, setCurrentDate] = useState("");
  
  const [query,       setQuery]       = useState("");
  const [resultados,  setResultados]  = useState([]);
  const [buscando,    setBuscando]    = useState(false);
  const [errores,     setErrores]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [errorApi,    setErrorApi]    = useState("");

  const [entrevistados, setEntrevistados] = useState(() => {
    if (saved.entrevistados) return saved.entrevistados.map(e => ({ ...e, id: e.id || Date.now() }));
    if (saved.entrevistado)  return [{ id: Date.now(), nombre: saved.entrevistado, parentesco: saved.parentesco || "", parentesco_otro: saved.parentesco_otro || "" }];
    return [{ id: Date.now(), nombre: "", parentesco: "", parentesco_otro: "" }];
  });

  const [mostrarTutorFields, setMostrarTutorFields] = useState(
    saved.entrevistados?.some(e => e.parentesco === "tutor") || saved.parentesco === "tutor" || false
  );

  const madre = useNivelAcademico({ nivel: saved.nivel_madre, duracion: saved.duracion_madre, tipo: saved.tipo_madre });
  const padre = useNivelAcademico({ nivel: saved.nivel_padre, duracion: saved.duracion_padre, tipo: saved.tipo_padre });
  const tutor = useNivelAcademico({ nivel: saved.nivel_tutor, duracion: saved.duracion_tutor, tipo: saved.tipo_tutor });

  const [vinculacion,            setVinculacion]           = useState(saved.vinculacion || "");
  const [especificarVinculacion, setEspecificarVinculacion] = useState(saved.especificar_vinculacion || "");

  const clearErrors = () => { if (errores.length) setErrores([]); setErrorApi(""); };

  // Solo fecha (sin hora)
  useEffect(() => {
    const hoy = new Date();
    const fechaSolo = hoy.toISOString().split('T')[0]; // Ej: "2026-04-16"
    setCurrentDate(fechaSolo);
  }, []);

  useEffect(() => {
    setMostrarTutorFields(entrevistados.some(e => e.parentesco === "tutor"));
  }, [entrevistados]);

  const handleVinculacionToggle = (valor) => {
    if (modoLectura) return;
    setVinculacion(v => v === valor ? "" : valor);
    if (valor !== vinculacion) setEspecificarVinculacion("");
    clearErrors();
  };

  // Buscador
  useEffect(() => {
    if (!query.trim()) { setResultados([]); return; }
    const controller = new AbortController();
    const delay = setTimeout(async () => {
      setBuscando(true);
      try {
        const res  = await fetch(`${API}/entrevistas/buscar?query=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const data = await res.json();
        setResultados(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => { clearTimeout(delay); controller.abort(); };
  }, [query]);

  const resetEstados = (data) => {
    setEntrevistados(
      data.entrevistados
        ? data.entrevistados.map(e => ({ ...e, id: e.id || Date.now() }))
        : data.entrevistado
        ? [{ id: Date.now(), nombre: data.entrevistado, parentesco: data.parentesco || "", parentesco_otro: data.parentesco_otro || "" }]
        : [{ id: Date.now(), nombre: "", parentesco: "", parentesco_otro: "" }]
    );
    setVinculacion(data.vinculacion || "");
    setEspecificarVinculacion(data.especificar_vinculacion || "");
    setSaved(data);
  };

  const cargarDesdeBackend = async (entrevistaId, modo) => {
    try {
      const res  = await fetch(`${API}/entrevistas/${entrevistaId}`);
      const data = await res.json();
      const flat = normalizarEntrevista(data);
      localStorage.setItem("entrevista", JSON.stringify(flat));
      localStorage.setItem("entrevista_id", entrevistaId);
      if (modo === "lectura") {
        localStorage.setItem("entrevista_modo_lectura", "true");
        setModoLectura(true);
      } else {
        localStorage.removeItem("entrevista_modo_lectura");
        setModoLectura(false);
      }
      setQuery(""); setResultados([]);
      resetEstados(flat);
    } catch {
      setErrorApi("No se pudo cargar la entrevista. Intente de nuevo.");
    }
  };

  const normalizarEntrevista = (d) => ({
    entrevistaId:   d.id,
    nombres:        d.estudiante?.nombres   || "",
    apellidos:      d.estudiante?.apellidos || "",
    sexo:           d.estudiante?.cat_sexo?.codigo || "",
    edad:           d.estudiante?.edad      || "",
    fecha:          d.fecha_entrevista      || "",
    formulario:     d.formulario            || "",
    seccion:        d.seccion               || "",
    vinculacion:    d.cat_vinculacion_institucional?.codigo || "",
    especificar_vinculacion: d.especificar_vinculacion || "",
    estado_civil:   d.cat_estado_civil?.nombre || "",
    entrevistados:  (d.entrevista_participante || []).map(p => ({
      id:              p.id,
      nombre:          p.nombre,
      parentesco:      p.cat_parentesco?.codigo || "",
      parentesco_otro: p.parentesco_otro || "",
    })),
    nivel_madre:    d.entrevista_nivel_academico_referente?.find(r => r.rol === "madre")?.cat_nivel_academico?.codigo || "",
    duracion_madre: d.entrevista_nivel_academico_referente?.find(r => r.rol === "madre")?.cat_estado_estudio?.codigo || "",
    tipo_madre:     d.entrevista_nivel_academico_referente?.find(r => r.rol === "madre")?.tipo_especifico || "",
    nivel_padre:    d.entrevista_nivel_academico_referente?.find(r => r.rol === "padre")?.cat_nivel_academico?.codigo || "",
    duracion_padre: d.entrevista_nivel_academico_referente?.find(r => r.rol === "padre")?.cat_estado_estudio?.codigo || "",
    tipo_padre:     d.entrevista_nivel_academico_referente?.find(r => r.rol === "padre")?.tipo_especifico || "",
    nivel_tutor:    d.entrevista_nivel_academico_referente?.find(r => r.rol === "tutor")?.cat_nivel_academico?.codigo || "",
    duracion_tutor: d.entrevista_nivel_academico_referente?.find(r => r.rol === "tutor")?.cat_estado_estudio?.codigo || "",
    tipo_tutor:     d.entrevista_nivel_academico_referente?.find(r => r.rol === "tutor")?.tipo_especifico || "",
    // Step 2 y 3 y 4 (se mantienen igual)
    conducta:            d.entrevista_respuesta_principal?.conducta || "",
    inconvenientes:      d.entrevista_respuesta_principal?.inconvenientes || "",
    ayuda_psic:          d.entrevista_respuesta_principal?.ayuda_psicologica ? "Si" : "No",
    ayuda_psic_detalle:  d.entrevista_respuesta_principal?.ayuda_psicologica_detalle || "",
    zona_vivienda:       d.entrevista_respuesta_principal?.zona_vivienda || "",
    habitos:             d.entrevista_respuesta_principal?.habitos || "",
    actividades_familia: d.entrevista_respuesta_principal?.actividades_familia || "",
    tiempo_juntos:       d.entrevista_respuesta_principal?.tiempo_juntos || "",
    expectativas_centro: d.entrevista_respuesta_principal?.expectativas_centro || "",
    agresion_ocurrida:   d.entrevista_respuesta_principal?.agresion_ocurrida ? "Si" : "No",
    agresiones:          d.entrevista_respuesta_principal?.agresiones || "",
    convivencia:          d.entrevista_respuesta_principal?.convivencia || "",
    motivos:              d.entrevista_respuesta_principal?.motivos_institucion || "",
    otra_institucion:     d.entrevista_respuesta_principal?.otra_institucion ? "Si" : "No",
    dificultades:         d.entrevista_respuesta_principal?.dificultades_otra_institucion || "",
    estudiante_descr:     d.entrevista_respuesta_principal?.descripcion_estudiante || "",
    repetido_curso:       d.entrevista_respuesta_principal?.repitencia_sobreedad ? "Si" : "No",
    repetido:             d.entrevista_respuesta_principal?.repitencia_sobreedad || "",
    alfabetizacion:       d.entrevista_respuesta_principal?.alfabetizacion ? "Si" : "No",
    alfabetizacion_detalle: d.entrevista_respuesta_principal?.alfabetizacion_detalle || "",
    motivacion:           d.entrevista_respuesta_principal?.motivacion_estudiante || "",
    ingreso_real:         d.ingreso_real?.toString() || "",
    aporte_mensual:       d.aporte_mensual?.toString() || "",
    observaciones:        d.observaciones || "",
    entrevistador:        d.cat_entrevistador?.nombre || "",
    telefonos:            (d.entrevista_telefono || []).map(t => ({
      numero: t.numero,
      dueno:  t.cat_dueno_telefono?.nombre || "",
    })),
    condicion_salud:            d.entrevista_respuesta_extra?.condicion_salud ? "Si" : "No",
    condicion_salud_detalle:    d.entrevista_respuesta_extra?.condicion_salud_detalle || "",
    medicamento:                d.entrevista_respuesta_extra?.medicamento || "",
    medicamento_detalle:        d.entrevista_respuesta_extra?.medicamento_detalle || "",
    supervisor_extraescolar:    d.entrevista_respuesta_extra?.supervisor_extraescolar || "",
    supervisor_otro_especifico: d.entrevista_respuesta_extra?.supervisor_otro_especifico || "",
    padres_fuera:               d.entrevista_respuesta_extra?.padres_fuera ? "Si" : "No",
    padres_fuera_detalle:       d.entrevista_respuesta_extra?.padres_fuera_detalle || "",
    pais_madre:                 d.entrevista_respuesta_extra?.cat_pais_entrevista_respuesta_extra_pais_madre_idTocat_pais?.nombre || "",
    pais_madre_otro:            d.entrevista_respuesta_extra?.pais_madre_otro || "",
    pais_padre:                 d.entrevista_respuesta_extra?.cat_pais_entrevista_respuesta_extra_pais_padre_idTocat_pais?.nombre || "",
    pais_padre_otro:            d.entrevista_respuesta_extra?.pais_padre_otro || "",
    observaciones_padres_fuera: d.entrevista_respuesta_extra?.observaciones_padres_fuera || "",
    tipo_casa:                  d.entrevista_respuesta_extra?.tipo_casa || "",
    estado_padres:              d.entrevista_respuesta_extra?.estado_padres || "",
    convive_padres:             d.entrevista_respuesta_extra?.convive_padres || "",
    figuras_familiares:         d.entrevista_respuesta_extra?.figuras_familiares || "",
    hermanos_exalumnos_si_no:   d.entrevista_respuesta_extra?.hermanos_exalumnos_si_no ? "Si" : "No",
    hermanos:                   (d.entrevista_hermano_exalumno || []).map(h => ({
      nombre:          h.nombre,
      taller:          h.cat_taller?.codigo || "",
      anio:            h.anio_graduacion?.toString() || "",
      tipo:            h.tipo_parentesco || "",
      otro_especifico: "",
    })),
    valoracion_familia:      d.entrevista_respuesta_extra?.valoracion_familia?.toString() || "",
    observaciones_internas:  d.entrevista_respuesta_extra?.observaciones_internas || "",
  });

  const salirModoLectura = () => {
    setModoLectura(false);
    localStorage.removeItem("entrevista_modo_lectura");
    localStorage.removeItem("entrevista");
    localStorage.removeItem("entrevista_id");
    window.location.reload();
  };

  const handleNombreChange     = (i, v) => { const a = [...entrevistados]; a[i].nombre = v; setEntrevistados(a); clearErrors(); };
  const handleParentescoChange = (i, v) => { const a = [...entrevistados]; a[i].parentesco = v; setEntrevistados(a); clearErrors(); };
  const handleOtroChange       = (i, v) => { const a = [...entrevistados]; a[i].parentesco_otro = v; setEntrevistados(a); clearErrors(); };
  const addEntrevistado    = () => setEntrevistados([...entrevistados, { id: Date.now(), nombre: "", parentesco: "", parentesco_otro: "" }]);
  const removeEntrevistado = (i) => { if (entrevistados.length > 1) setEntrevistados(entrevistados.filter((_, j) => j !== i)); };

  const validar = (form) => {
    const f   = (n) => form.get(n)?.trim() || "";
    const err = [];
    if (!f("formulario")) err.push("Número de formulario");
    if (!f("nombres"))   err.push("Nombre(s) del estudiante");
    if (!f("apellidos")) err.push("Apellido(s) del estudiante");
    if (!f("sexo"))      err.push("Sexo del estudiante");
    if (!f("edad"))      err.push("Edad del estudiante");
    entrevistados.forEach((ent, i) => {
      if (!ent.nombre.trim()) err.push(`Nombre del entrevistado ${i + 1}`);
      if (!ent.parentesco)    err.push(`Parentesco del entrevistado ${i + 1}`);
      if (ent.parentesco === "otro" && !ent.parentesco_otro.trim())
        err.push(`Especifique el parentesco del entrevistado ${i + 1}`);
    });
    if (!madre.nivel) err.push("Nivel académico de la madre");
    if (!padre.nivel) err.push("Nivel académico del padre");
    if (madre.showDur && !madre.duracion) err.push("Estado de estudios de la madre");
    if (padre.showDur && !padre.duracion) err.push("Estado de estudios del padre");
    if (mostrarTutorFields && tutor.showDur && !tutor.duracion) err.push("Estado de estudios del tutor legal");
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modoLectura) { navigate("/paso2"); return; }

    const form = new FormData(e.target);
    const err  = validar(form);
    if (err.length) { setErrores(err); return; }

    const payload = {
      ...Object.fromEntries(form.entries()),
      fecha: currentDate,   // ← Solo la fecha (YYYY-MM-DD)
      entrevistados,
      nivel_madre:  madre.nivel, duracion_madre: madre.duracion, tipo_madre: madre.tipo,
      nivel_padre:  padre.nivel, duracion_padre: padre.duracion, tipo_padre: padre.tipo,
      nivel_tutor:  tutor.nivel, duracion_tutor: tutor.duracion, tipo_tutor: tutor.tipo,
      vinculacion,
      especificar_vinculacion: especificarVinculacion,
    };

    setLoading(true);
    setErrorApi("");
    try {
      const res  = await fetch(`${API}/entrevistas/step1`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      const { entrevista } = await res.json();

      localStorage.setItem("entrevista_id", entrevista.id);
      localStorage.setItem("entrevista", JSON.stringify({ ...payload, entrevistaId: entrevista.id }));

      navigate("/paso2");
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right .75rem center; background-repeat: no-repeat; background-size: 1.25em; padding-right: 2.5rem !important;
        }
      `}</style>

      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto px-6 md:px-12 mb-8">
          {[
            { n:1, label:"Datos Básicos",    active:true  },
            { n:2, label:"Entorno Familiar", active:false },
            { n:3, label:"Expectativas",     active:false },
            { n:4, label:"Preguntas Extras", active:false },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-4 md:gap-8 w-full">
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-md"
                  style={{
                    background: s.active ? P : "#e2e8f0",
                    color:      s.active ? "white" : "#94a3b8",
                    boxShadow:  s.active ? `0 4px 14px rgba(81,98,111,.35)` : "none",
                  }}>
                  {s.n}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: s.active ? P : "#94a3b8" }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="h-1 flex-grow rounded-full bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Buscador - se mantiene igual */}
        <div className="w-full mb-8">
          {modoLectura && (
            <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 text-xl">visibility</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-amber-800">Modo lectura</p>
                  <p className="text-xs text-amber-600">Estás viendo una entrevista previa. El formulario está bloqueado.</p>
                </div>
              </div>
              <button type="button" onClick={salirModoLectura}
                className="flex-shrink-0 text-xs font-semibold text-amber-700 border border-amber-300 bg-white hover:bg-amber-100 px-4 py-2 rounded-lg transition-all">
                Salir y crear nueva
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: "#2d3547" }}>
              <span className="material-symbols-outlined text-white text-2xl">manage_search</span>
              <div className="text-left">
                <p className="text-white font-semibold text-base leading-tight">Búsqueda de Entrevistas Previas</p>
                <p className="text-slate-300 text-xs mt-0.5">Buscar por nombre del estudiante</p>
              </div>
            </div>
            <div className="bg-white px-6 py-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                </span>
                <input 
                  type="text" 
                  value={query} 
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Escriba el nombre o apellido del estudiante..."
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none transition-all text-sm text-slate-700"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(""); setResultados([]); }}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
              </div>

              {query && (
                <div className="mt-3">
                  {buscando ? (
                    <div className="flex items-center gap-2 text-slate-400 py-3 px-2">
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      <p className="text-sm italic">Buscando...</p>
                    </div>
                  ) : resultados.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-400 py-3 px-2">
                      <span className="material-symbols-outlined text-lg">sentiment_dissatisfied</span>
                      <p className="text-sm italic">No se encontraron entrevistas con ese nombre.</p>
                    </div>
                  ) : (
                    <ul className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {resultados.map((item) => {
                        const nombre = `${item.estudiante?.nombres ?? ""} ${item.estudiante?.apellidos ?? ""}`.trim();
                        const fecha  = item.fecha_entrevista ? new Date(item.fecha_entrevista).toLocaleDateString() : "Sin fecha";
                        return (
                          <li key={item.id} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(81,98,111,.12)" }}>
                                <span className="material-symbols-outlined text-lg" style={{ color: P }}>person</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{nombre}</p>
                                <p className="text-xs text-slate-400">{fecha}{item.seccion ? ` · Sección ${item.seccion}` : ""}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button type="button" onClick={() => cargarDesdeBackend(item.id, "lectura")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-xs font-medium">
                                <span className="material-symbols-outlined text-base">visibility</span> Ver
                              </button>
                              <button type="button" onClick={() => cargarDesdeBackend(item.id, "edicion")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-white transition-all text-xs font-medium hover:opacity-90"
                                style={{ background: P, borderColor: P }}>
                                <span className="material-symbols-outlined text-base">edit</span> Editar
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura || loading} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de Entrevista
              </label>
              <input 
                name="fecha" 
                value={currentDate} 
                readOnly 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 cursor-default font-medium" 
                type="text" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formulario <span className="text-red-400">*</span></label>
              <input name="formulario" defaultValue={saved.formulario || ""} placeholder="0" className={INPUT} type="text" onChange={clearErrors} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sección</label>
              <input name="seccion" defaultValue={saved.seccion || ""} placeholder="0" className={INPUT} type="text" onChange={clearErrors} />
            </div>
          </div>

          {/* Datos Personales del Estudiante */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>person</span>
              <h2 className="text-xl font-semibold text-slate-800">Datos Personales del Estudiante</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre(s) <span className="text-red-400">*</span></label>
                <input name="nombres" defaultValue={saved.nombres || ""} placeholder="Ingrese nombres" className={INPUT} type="text" onChange={clearErrors} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Apellido(s) <span className="text-red-400">*</span></label>
                <input name="apellidos" defaultValue={saved.apellidos || ""} placeholder="Ingrese apellidos" className={INPUT} type="text" onChange={clearErrors} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sexo <span className="text-red-400">*</span></label>
                <select name="sexo" defaultValue={saved.sexo || ""} className={SELECT} onChange={clearErrors}>
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Edad <span className="text-red-400">*</span></label>
                <input name="edad" defaultValue={saved.edad || ""} placeholder="0" className={INPUT} type="number" onChange={clearErrors} />
              </div>
            </div>
          </div>

          {/* Entrevistados */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>groups</span>
              <h2 className="text-xl font-semibold text-slate-800">Información del Entrevistado</h2>
            </div>
            {entrevistados.map((ent, index) => (
              <div key={ent.id} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Entrevistado {index + 1} <span className="text-red-400">*</span>
                    </label>
                    <input 
                      value={ent.nombre} 
                      onChange={e => handleNombreChange(index, e.target.value)}
                      placeholder="Nombre de quien asiste" 
                      className={INPUT} 
                      type="text" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Parentesco <span className="text-red-400">*</span></label>
                    <select 
                      value={ent.parentesco} 
                      onChange={e => handleParentescoChange(index, e.target.value)} 
                      className={SELECT}
                    >
                      <option value="">Seleccione relación</option>
                      <option value="madre">Madre</option>
                      <option value="padre">Padre</option>
                      <option value="madrastra">Madrastra</option>
                      <option value="padrastro">Padrastro</option>
                      <option value="tutor">Tutor Legal</option>
                      <option value="otro">Otro</option>
                    </select>
                    {ent.parentesco === "otro" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Especifique el parentesco <span className="text-red-400">*</span>
                        </label>
                        <input 
                          value={ent.parentesco_otro} 
                          onChange={e => handleOtroChange(index, e.target.value)}
                          placeholder="Ej: Abuela, Tía, etc." 
                          className={INPUT} 
                          type="text" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                {entrevistados.length > 1 && (
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeEntrevistado(index)}
                      className="flex items-center gap-1 text-sm transition-all hover:opacity-70" 
                      style={{ color: "#c1393f" }}
                    >
                      <span className="material-symbols-outlined">delete</span> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addEntrevistado}
              className="px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all hover:opacity-80 text-sm text-white"
              style={{ background: P }}
            >
              <span className="text-lg">+</span> Agregar otra persona
            </button>
          </div>

          {/* Nivel académico */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>school</span>
              <h2 className="text-xl font-semibold text-slate-800">Nivel académico del Tutor(a)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nivel académico - Madre <span className="text-red-400">*</span></label>
                <NivelSelect hook={madre} onClearErrors={clearErrors} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nivel académico - Padre <span className="text-red-400">*</span></label>
                <NivelSelect hook={padre} onClearErrors={clearErrors} />
              </div>
            </div>
            {mostrarTutorFields && (
              <div className="mt-8 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-xl" style={{ color: P }}>person_raised_hand</span>
                  <h3 className="text-lg font-semibold text-slate-800">Nivel académico - Tutor Legal</h3>
                </div>
                <div className="max-w-md">
                  <NivelSelect hook={tutor} onClearErrors={clearErrors} />
                </div>
                <p className="mt-2 text-xs text-slate-500 italic">Campo opcional — solo aplica si el entrevistado es el tutor legal</p>
              </div>
            )}
          </div>

          {/* Vinculación Institucional */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>link</span>
              <h2 className="text-xl font-semibold text-slate-800">Vinculación Institucional</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">Indicar si proviene de alguna obra salesiana:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { value: "oratorio",   label: "Oratorio" },
                { value: "centro",     label: "Centro Juvenil" },
                { value: "cooperador", label: "SSCC", subtitle: "Salesiano cooperador" },
                { value: "traslado",   label: "Traslado" },
                { value: "exalumno",   label: "Exalumno" },
              ].map(item => (
                <div 
                  key={item.value} 
                  onClick={() => handleVinculacionToggle(item.value)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border cursor-pointer transition-all text-center min-h-[85px] select-none"
                  style={{
                    borderColor: vinculacion === item.value ? P : "#cbd5e1",
                    background:  vinculacion === item.value ? "rgba(81,98,111,.07)" : "white",
                    boxShadow:   vinculacion === item.value ? "inset 0 0 0 1px " + P : "none",
                  }}>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: `2px solid ${vinculacion === item.value ? P : "#94a3b8"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
                    }}>
                      {vinculacion === item.value && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: P }} />
                      )}
                    </div>
                    <span className="text-sm font-bold" style={{ color: vinculacion === item.value ? P : "#475569" }}>{item.label}</span>
                  </div>
                  {item.subtitle && (
                    <span className="text-[10px] leading-tight uppercase tracking-tighter mt-1"
                      style={{ color: vinculacion === item.value ? P : "#94a3b8", opacity: 0.8 }}>
                      {item.subtitle}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {vinculacion && !modoLectura && (
              <p className="mt-3 text-[10px] text-slate-400 italic animate-pulse">
                * Haz clic de nuevo en <strong>{vinculacion}</strong> para quitar la selección.
              </p>
            )}
            {vinculacion && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Especifique la relación</label>
                <textarea 
                  value={especificarVinculacion}
                  onChange={e => { setEspecificarVinculacion(e.target.value); clearErrors(); }}
                  placeholder="Detalles de la vinculación..." 
                  className={INPUT} 
                  rows={3} 
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Mensajes de error */}
        {errorApi && (
          <div className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50">
            <p className="text-red-800 text-sm font-semibold text-center">{errorApi}</p>
          </div>
        )}

        {errores.length > 0 && (
          <div className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-white text-lg">priority_high</span>
              </div>
              <div className="flex-1">
                <p className="text-red-900 text-sm font-bold mb-2">
                  Atención requerida — Falta{errores.length > 1 ? "n" : ""} {errores.length} campo{errores.length > 1 ? "s" : ""} por completar:
                </p>
                <ul className="space-y-1">
                  {errores.map((e, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-red-700 text-xs">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" onClick={() => setErrores([])} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )}

        <FormFooter nextLabel="Siguiente" loading={loading} />
      </form>
    </FormWrapper>
  );
}