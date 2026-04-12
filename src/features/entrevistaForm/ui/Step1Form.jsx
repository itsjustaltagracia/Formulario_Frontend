import React, { useEffect, useState } from "react";

/**
 * COMPONENTES LOCALES
 */
const FormWrapper = ({ children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {children}
    </div>
  </div>
);

const FormFooter = ({ nextLabel }) => (
  <div className="flex items-center justify-end pt-10 border-t border-slate-200">
    <button
      type="submit"
      className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
      style={{ background: "#51626f", boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}
    >
      {nextLabel} →
    </button>
  </div>
);

// ── Constantes de Estilo ────────────────────────────────────────────────────────
const P = "#51626f"; 
const FOCUS = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT  = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;
const SELECT = `${INPUT} bg-white appearance-none`;
const NIVEL_OPS = ["primaria","bachillerato","bachiller_tecnico","Técnico","universitario","licenciatura","maestria","ingenieria","doctorado","otros","ninguno"];
const NIVEL_LABELS = { 
  primaria: "Educación primaria", 
  bachillerato: "Bachillerato", 
  bachiller_tecnico: "Bachiller Técnico",
  Técnico: "Técnico", 
  universitario: "Universitario", 
  licenciatura: "Licenciatura", 
  maestria: "Maestría", 
  ingenieria: "Ingeniería", 
  doctorado: "Doctorado", 
  otros: "Otros", 
  ninguno: "Ninguno / No aplica" 
};
const NIVEL_CON_TIPO = ["licenciatura","maestria","ingenieria","doctorado","otros","Técnico", "bachiller_tecnico"];

// ── Hook Personalizado para Niveles Académicos ──────────────────────────────────
function useNivelAcademico(init = {}) {
  const [nivel,    setNivel]    = useState(init.nivel    || "");
  const [duracion, setDuracion] = useState(init.duracion || "");
  const [tipo,      setTipo]     = useState(init.tipo      || "");
  const [showDur,    setShowDur]  = useState(!!init.nivel && init.nivel !== "ninguno");
  const [showTipo, setShowTipo] = useState(NIVEL_CON_TIPO.includes(init.nivel));

  const onChange = (v) => {
    setNivel(v);
    setShowDur(v && v !== "ninguno");
    setShowTipo(NIVEL_CON_TIPO.includes(v));
    if (!NIVEL_CON_TIPO.includes(v)) setTipo("");
  };
  return { nivel, duracion, setDuracion, tipo, setTipo, showDur, showTipo, onChange };
}

export default function App() {
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("entrevista") || "{}"));
  const [modoLectura, setModoLectura] = useState(() => localStorage.getItem("entrevista_modo_lectura") === "true");
  const [currentDate, setCurrentDate] = useState("");
  const [query, setQuery]               = useState("");
  const [resultados, setResultados]   = useState([]);
  const [error, setError]               = useState("");

  const [entrevistados, setEntrevistados] = useState(() => {
    if (saved.entrevistados) return saved.entrevistados.map(e => ({ ...e, id: e.id || Date.now() }));
    if (saved.entrevistado)  return [{ id: Date.now(), nombre: saved.entrevistado, parentesco: saved.parentesco || "", parentesco_otro: saved.parentesco_otro || "" }];
    return [{ id: Date.now(), nombre: "", parentesco: "", parentesco_otro: "" }];
  });
  
  const [mostrarTutorFields, setMostrarTutorFields] = useState(
    saved.entrevistados?.some(e => e.parentesco === "tutor") || saved.parentesco === "tutor" || false
  );

  const madre  = useNivelAcademico({ nivel: saved.nivel_madre,  duracion: saved.duracion_madre,  tipo: saved.tipo_madre  });
  const padre  = useNivelAcademico({ nivel: saved.nivel_padre,  duracion: saved.duracion_padre,  tipo: saved.tipo_padre  });
  const tutor  = useNivelAcademico({ nivel: saved.nivel_tutor,  duracion: saved.duracion_tutor,  tipo: saved.tipo_tutor  });

  const [vinculacion,            setVinculacion]           = useState(saved.vinculacion || "");
  const [especificarVinculacion, setEspecificarVinculacion] = useState(saved.especificar_vinculacion || "");

  useEffect(() => { setCurrentDate(new Date().toISOString().split("T")[0]); }, []);
  useEffect(() => { setMostrarTutorFields(entrevistados.some(e => e.parentesco === "tutor")); }, [entrevistados]);

  const handleVinculacionToggle = (valor) => {
    if (modoLectura) return;
    if (vinculacion === valor) {
      setVinculacion("");
      setEspecificarVinculacion("");
    } else {
      setVinculacion(valor);
    }
    if (error) setError("");
  };

  const buscar = (texto) => {
    setQuery(texto);
    if (!texto.trim()) { setResultados([]); return; }
    const enc = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && (item.nombres || item.apellidos)) {
          if (`${item.nombres || ""} ${item.apellidos || ""}`.toLowerCase().includes(texto.toLowerCase()))
            enc.push({ key, data: item });
        }
      } catch (_) {}
    }
    setResultados(enc);
  };

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

  const cargarEntrevista = (data) => {
    localStorage.setItem("entrevista", JSON.stringify(data));
    localStorage.setItem("entrevista_modo_lectura", "true");
    setQuery(""); setResultados([]); setModoLectura(true);
    resetEstados(data);
  };

  const editarEntrevista = (data) => {
    localStorage.setItem("entrevista", JSON.stringify(data));
    localStorage.removeItem("entrevista_modo_lectura");
    setQuery(""); setResultados([]); setModoLectura(false);
    resetEstados(data);
  };

  const salirModoLectura = () => {
    setModoLectura(false);
    localStorage.removeItem("entrevista_modo_lectura");
    localStorage.removeItem("entrevista");
    window.location.reload();
  };

  const handleNombreChange     = (i, v) => { const a = [...entrevistados]; a[i].nombre = v; setEntrevistados(a); if(error) setError(""); };
  const handleParentescoChange = (i, v) => { const a = [...entrevistados]; a[i].parentesco = v; setEntrevistados(a); if(error) setError(""); };
  const handleOtroChange        = (i, v) => { const a = [...entrevistados]; a[i].parentesco_otro = v; setEntrevistados(a); if(error) setError(""); };
  const addEntrevistado     = () => setEntrevistados([...entrevistados, { id: Date.now(), nombre: "", parentesco: "", parentesco_otro: "" }]);
  const removeEntrevistado  = (i) => { if (entrevistados.length > 1) setEntrevistados(entrevistados.filter((_, j) => j !== i)); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoLectura) { window.location.href = "/paso2"; return; }
    
    const form = new FormData(e.target);
    const nombres = form.get("nombres")?.trim();
    const apellidos = form.get("apellidos")?.trim();

    if (!nombres || !apellidos) { 
      setError("Faltan datos del estudiante (Nombres/Apellidos)"); 
      return; 
    }
    
    if (entrevistados.some(ent => !ent.nombre.trim() || !ent.parentesco)) { 
      setError("Complete la información del entrevistado"); 
      return; 
    }

    const data = {
      ...saved, ...Object.fromEntries(form.entries()), entrevistados,
      nivel_madre: madre.nivel, duracion_madre: madre.duracion, tipo_madre: madre.tipo,
      nivel_padre: padre.nivel, duracion_padre: padre.duracion, tipo_padre: padre.tipo,
      nivel_tutor: tutor.nivel, duracion_tutor: tutor.duracion, tipo_tutor: tutor.tipo,
      vinculacion, especificar_vinculacion: especificarVinculacion,
    };
    localStorage.setItem("entrevista", JSON.stringify(data));
    window.location.href = "/paso2";
  };

  const NivelSelect = ({ label, hook }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <select value={hook.nivel} onChange={e => { hook.onChange(e.target.value); if(error) setError(""); }} className={SELECT}>
        <option value="">Seleccione</option>
        {NIVEL_OPS.map(v => <option key={v} value={v}>{NIVEL_LABELS[v]}</option>)}
      </select>
      {hook.showDur && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Estado de estudios</label>
          <select value={hook.duracion} onChange={e => { hook.setDuracion(e.target.value); if(error) setError(""); }} className={SELECT}>
            <option value="">Seleccione estado</option>
            <option value="completado">Completado</option>
            <option value="incompleto">Incompleto</option>
          </select>
        </div>
      )}
      {hook.showTipo && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Especifique el tipo</label>
          <input value={hook.tipo} onChange={e => { hook.setTipo(e.target.value); if(error) setError(""); }} placeholder="Ej: en Derecho" className={INPUT} type="text" />
        </div>
      )}
    </div>
  );

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right .75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em;
          padding-right: 2.5rem !important;
        }
      `}</style>

      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto px-6 md:px-12 mb-8">
          {[
            { n:1, label:"Datos Básicos",      active:true  },
            { n:2, label:"Entorno Familiar", active:false },
            { n:3, label:"Expectativas",     active:false },
            { n:4, label:"Preguntas Extras", active:false },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-4 md:gap-8 w-full">
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-md"
                  style={{
                    background: s.active ? P : "#e2e8f0",
                    color:        s.active ? "white" : "#94a3b8",
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

        {/* Buscador */}
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
                <input type="text" value={query} onChange={e => buscar(e.target.value)}
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
                  {resultados.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-400 py-3 px-2">
                      <span className="material-symbols-outlined text-lg">sentiment_dissatisfied</span>
                      <p className="text-sm italic">No se encontraron entrevistas con ese nombre.</p>
                    </div>
                  ) : (
                    <ul className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {resultados.map(({ key, data }) => (
                        <li key={key} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(81,98,111,.12)" }}>
                              <span className="material-symbols-outlined text-lg" style={{ color: P }}>person</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{data.nombres} {data.apellidos}</p>
                              <p className="text-xs text-slate-400">{data.fecha || "Sin fecha"}{data.seccion ? ` · Sección ${data.seccion}` : ""}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button type="button" onClick={() => cargarEntrevista(data)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-xs font-medium">
                              <span className="material-symbols-outlined text-base">visibility</span> Ver
                            </button>
                            <button type="button" onClick={() => editarEntrevista(data)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-white transition-all text-xs font-medium hover:opacity-90"
                              style={{ background: P, borderColor: P }}>
                              <span className="material-symbols-outlined text-base">edit</span> Editar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Entrevista</label>
              <input name="fecha" value={currentDate} readOnly className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 cursor-default" type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formulario</label>
              <input name="formulario" defaultValue={saved.formulario || ""} placeholder="0" className={INPUT} type="text" onChange={() => error && setError("")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sección</label>
              <input name="seccion" defaultValue={saved.seccion || ""} placeholder="0" className={INPUT} type="text" onChange={() => error && setError("")} />
            </div>
          </div>

          {/* Datos Personales */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>person</span>
              <h2 className="text-xl font-semibold text-slate-800">Datos Personales del Estudiante</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre(s)</label>
                <input name="nombres" defaultValue={saved.nombres || ""} placeholder="Ingrese nombres" className={INPUT} type="text" onChange={() => error && setError("")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Apellido(s)</label>
                <input name="apellidos" defaultValue={saved.apellidos || ""} placeholder="Ingrese apellidos" className={INPUT} type="text" onChange={() => error && setError("")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
                <select name="sexo" defaultValue={saved.sexo || ""} className={SELECT} onChange={() => error && setError("")}>
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Edad</label>
                <input name="edad" defaultValue={saved.edad || ""} placeholder="0" className={INPUT} type="number" onChange={() => error && setError("")} />
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Entrevistado {index + 1}</label>
                    <input value={ent.nombre} onChange={e => handleNombreChange(index, e.target.value)} placeholder="Nombre de quien asiste" className={INPUT} type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Parentesco</label>
                    <select value={ent.parentesco} onChange={e => handleParentescoChange(index, e.target.value)} className={SELECT}>
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Especifique el parentesco</label>
                        <input value={ent.parentesco_otro} onChange={e => handleOtroChange(index, e.target.value)} placeholder="Ej: Abuela, Tía, etc." className={INPUT} type="text" />
                      </div>
                    )}
                  </div>
                </div>
                {entrevistados.length > 1 && (
                  <div className="mt-2 flex justify-end">
                    <button type="button" onClick={() => removeEntrevistado(index)}
                      className="flex items-center gap-1 text-sm transition-all hover:opacity-70"
                      style={{ color: "#c1393f" }}>
                      <span className="material-symbols-outlined">delete</span> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Botón personalizado de acompañante */}
            <button type="button" onClick={addEntrevistado}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all hover:shadow-lg active:scale-95 text-sm text-white shadow-md"
              style={{ background: "#3b82f6" }}>
              <span className="material-symbols-outlined text-xl">group_add</span>
              Agregar otra persona
            </button>
          </div>

          {/* Nivel académico */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>school</span>
              <h2 className="text-xl font-semibold text-slate-800">Nivel académico del Tutor(a)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NivelSelect label="Nivel académico - Madre" hook={madre} />
              <NivelSelect label="Nivel académico - Padre" hook={padre} />
            </div>
            {mostrarTutorFields && (
              <div className="mt-8 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-xl" style={{ color: P }}>person_raised_hand</span>
                  <h3 className="text-lg font-semibold text-slate-800">Nivel académico - Tutor Legal</h3>
                </div>
                <div className="max-w-md">
                  <NivelSelect label="" hook={tutor} />
                </div>
                <p className="mt-2 text-xs text-slate-500 italic">Campo opcional — solo aplica si el entrevistado es el tutor legal</p>
              </div>
            )}
          </div>

          {/* Vinculación Institucional */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>link</span>
              <h2 className="text-xl font-semibold text-slate-800">Vinculación Institucional</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">Indicar si proviene de alguna obra salesiana:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { value: "oratorio",   label: "Oratorio"       },
                { value: "centro",      label: "Centro Juvenil" },
                { value: "cooperador", label: "SSCC", subtitle: "Salesiano cooperador" },
                { value: "traslado",   label: "Traslado"       },
                { value: "exalumno",   label: "Exalumno"       },
              ].map(item => (
                <div key={item.value}
                  onClick={() => handleVinculacionToggle(item.value)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border cursor-pointer transition-all text-center min-h-[85px] select-none"
                  style={{
                    borderColor: vinculacion === item.value ? P : "#cbd5e1",
                    background:  vinculacion === item.value ? "rgba(81,98,111,.07)" : "white",
                    boxShadow: vinculacion === item.value ? "inset 0 0 0 1px " + P : "none"
                  }}>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: `2px solid ${vinculacion === item.value ? P : "#94a3b8"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}>
                      {vinculacion === item.value && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: P, animation: "fadeIn 0.2s ease" }} />
                      )}
                    </div>
                    <span className="text-sm font-bold" style={{ color: vinculacion === item.value ? P : "#475569" }}>{item.label}</span>
                  </div>
                  {item.subtitle && (
                    <span className="text-[10px] leading-tight text-slate-400 uppercase tracking-tighter mt-1" 
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
              <div className="mt-6 animate-in fade-in duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-2">Especifique la relación (ej: exalumno, trabaja, animador, etc.)</label>
                <textarea value={especificarVinculacion} onChange={e => { setEspecificarVinculacion(e.target.value); if(error) setError(""); }}
                  placeholder="Detalles de la vinculación..." className={INPUT} rows={3} />
              </div>
            )}
          </div>

        </fieldset>

        {/* ── MENSAJE DE ERROR ── */}
        {error && (
          <div className="mx-auto max-w-lg flex items-center gap-3 p-4 rounded-2xl border border-red-100 bg-red-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">priority_high</span>
              </div>
              <div className="flex-1">
                <p className="text-red-900 text-sm font-bold">Atención requerida</p>
                <p className="text-red-700 text-xs">{error}</p>
              </div>
              <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
          </div>
        )}

        <FormFooter nextLabel="Siguiente" />
      </form>
    </FormWrapper>
  );
}