import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveInterviewAsPdf, printInterviewPdfFormat } from "../../pdfExport/lib/index";

// ── Constantes de estilo (igual al paso 3) ─────────────────────────────────────
const P     = "#51626f";
const FOCUS = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;

// ── FormWrapper ────────────────────────────────────────────────────────────────
const FormWrapper = ({ children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {children}
    </div>
  </div>
);

// ── Stepper ────────────────────────────────────────────────────────────────────
const Stepper = ({ pasoActual }) => {
  const pasos = [
    { n: 1, label: "Datos Básicos" },
    { n: 2, label: "Entorno Familiar" },
    { n: 3, label: "Expectativas" },
    { n: 4, label: "Preguntas Extras" },
  ];
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto px-6 md:px-12 mb-8">
      {pasos.map((s, i, arr) => {
        const completado = s.n < pasoActual;
        const activo     = s.n === pasoActual;
        return (
          <div key={s.n} className="flex items-center gap-4 md:gap-8 w-full">
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2"
                style={{
                  background: completado ? "#22c55e" : activo ? P : "#e2e8f0",
                  color:      completado || activo ? "white" : "#94a3b8",
                  boxShadow:  activo     ? `0 4px 14px rgba(81,98,111,.35)`
                            : completado ? "0 4px 14px rgba(34,197,94,.35)" : "none",
                }}>
                {completado ? "✓" : s.n}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap"
                style={{ color: completado ? "#22c55e" : activo ? P : "#94a3b8" }}>
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="h-1 flex-grow rounded-full"
                style={{ background: completado ? "#22c55e" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── RadioCard con toggle ───────────────────────────────────────────────────────
const RadioCard = ({ name, value, label, selected, onToggle }) => {
  const sel = selected === value;
  return (
    <div onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none min-h-[52px]"
      style={{
        borderColor: sel ? P : "#cbd5e1",
        background:  sel ? "rgba(81,98,111,.07)" : "white",
        boxShadow:   sel ? `inset 0 0 0 1px ${P}` : "none",
      }}>
      <div style={{
        width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${sel ? P : "#94a3b8"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s ease",
      }}>
        {sel && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: P }} />}
      </div>
      {sel && <input type="hidden" name={name} value={value} />}
      <span className="text-sm font-semibold" style={{ color: sel ? P : "#475569" }}>{label}</span>
    </div>
  );
};

// ── Select con flecha ──────────────────────────────────────────────────────────
const StyledSelect = ({ name, defaultValue, children, className = "" }) => (
  <div className="relative">
    <select name={name} defaultValue={defaultValue}
      className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none cursor-pointer transition-all ${FOCUS} ${className}`}>
      {children}
    </select>
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-lg">expand_more</span>
  </div>
);

function readStorage() {
  try { const r = window.localStorage.getItem("entrevista"); return r ? JSON.parse(r) : {}; }
  catch { window.localStorage.removeItem("entrevista"); return {}; }
}

const PAISES = ["Haití","Estados Unidos","Venezuela","España","Italia","Colombia","China","Cuba","Puerto Rico","Francia","Otro"];
const TALLERES = ["INFO","GAT","CYP","EBA","MECA","AUTO","ELDAD","ELCA"];

export default function Step4Form() {
  const navigate = useNavigate();
  const formRef  = useRef(null);
  const [saved, setSaved]  = useState(readStorage);
  const modoLectura        = localStorage.getItem("entrevista_modo_lectura") === "true";
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);

  // ── Estados de toggles ────────────────────────────────────────────────────
  const makeToggle = (getter, setter) => (val) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
  };

  const [condicionSalud,      setCondicionSalud]      = useState(saved.condicion_salud           || "");
  const [medicamento,         setMedicamento]          = useState(saved.medicamento               || "");
  const [supervisorExtra,     setSupervisorExtra]      = useState(saved.supervisor_extraescolar   || "");
  const [supervisorOtro,      setSupervisorOtro]       = useState(saved.supervisor_otro           || "");
  const [padresFuera,         setPadresFuera]          = useState(saved.padres_fuera              || "");
  const [padresFueraDetalle,  setPadresFueraDetalle]   = useState(saved.padres_fuera_detalle      || "");
  const [paisMadre,           setPaisMadre]            = useState(saved.pais_madre                || "");
  const [paisPadre,           setPaisPadre]            = useState(saved.pais_padre                || "");
  const [tipoCasa,            setTipoCasa]             = useState(saved.tipo_casa                 || "");
  const [estadoPadres,        setEstadoPadres]         = useState(saved.estado_padres             || "");
  const [convivePadres,       setConvivePadres]        = useState(saved.convive_padres            || "");
  const [figurasFamiliares,   setFigurasFamiliares]    = useState(saved.figuras_familiares        || "");
  const [mostrarHermanos,     setMostrarHermanos]      = useState(saved.hermanos_exalumnos_si_no === "Si" || (saved.hermanos?.length > 0));

  // ── Hermanos ──────────────────────────────────────────────────────────────
  let initHermanos = [];
  if (saved.hermanos?.length > 0) initHermanos = saved.hermanos;
  else if (saved.hermanos_nombre)  initHermanos = [{ nombre: saved.hermanos_nombre, anio: saved.hermanos_anio, taller: saved.hermanos_taller, tipo: "hermano", otro_especifico: "" }];
  const [hermanos, setHermanos] = useState(initHermanos);

  const addHermano    = () => setHermanos([...hermanos, { nombre: "", anio: "", taller: "", tipo: "hermano", otro_especifico: "" }]);
  const removeHermano = (i) => { if (hermanos.length > 1) setHermanos(hermanos.filter((_, j) => j !== i)); };
  const updateHermano = (i, field, val) => {
    const arr = [...hermanos]; arr[i] = { ...arr[i], [field]: val }; setHermanos(arr);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const saveFormData = (target) => {
    const src = target ?? formRef.current;
    if (!src) return saved;
    const form   = new FormData(src);
    const values = Object.fromEntries(form.entries());
    const data   = {
      ...saved, ...values,
      condicion_salud:        condicionSalud,
      medicamento,
      supervisor_extraescolar: supervisorExtra,
      supervisor_otro:         supervisorOtro,
      padres_fuera:            padresFuera,
      padres_fuera_detalle:    padresFueraDetalle,
      pais_madre:              paisMadre,
      pais_padre:              paisPadre,
      tipo_casa:               tipoCasa,
      estado_padres:           estadoPadres,
      convive_padres:          convivePadres,
      figuras_familiares:      figurasFamiliares,
      hermanos,
    };
    if (condicionSalud !== "Si") data.condicion_salud_detalle = "";
    if (medicamento !== "Si" && medicamento !== "Tal vez") data.medicamento_detalle = "";
    if (padresFuera !== "Si") { data.padres_fuera_detalle = ""; data.pais_madre = ""; data.pais_padre = ""; }
    if (!mostrarHermanos) data.hermanos = [];
    localStorage.setItem("entrevista", JSON.stringify(data));
    setSaved(data);
    return data;
  };

  // ── Validación ───────────────────────────────────────────────────────────
  const [alertas, setAlertas] = useState([]);

  const validar = () => {
    const errores = [];
    if (!condicionSalud)    errores.push("Pregunta 20: Condición de salud del hijo");
    if (!medicamento)       errores.push("Pregunta 21: Medicamento fijo o regular");
    if (!supervisorExtra)   errores.push("Pregunta 22: Supervisor extraescolar");
    if (!padresFuera)       errores.push("Pregunta 23: Padres fuera del país");
    if (!tipoCasa)          errores.push("Pregunta 24: Tipo de vivienda");
    if (!estadoPadres)      errores.push("Pregunta 25: Estado de vida de los padres");
    if (!convivePadres)     errores.push("Pregunta 26: Con quién convive el estudiante");
    if (!figurasFamiliares) errores.push("Pregunta 27: Figuras familiares en el núcleo");
    if (saved.hermanos_exalumnos_si_no !== "Si" && !mostrarHermanos && saved.hermanos_exalumnos_si_no !== "No")
      errores.push("Pregunta 28: Hermanos o exalumnos en IPISA");
    const form = formRef.current;
    if (form) {
      const valoracion = new FormData(form).get("valoracion_familia");
      if (!valoracion) errores.push("Pregunta 29: Valoración de la familia");
    }
    return errores;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (modoLectura) return;
    const errores = validar();
    if (errores.length > 0) { setAlertas(errores); setTimeout(() => document.getElementById('alertas-validacion')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); return; }
    setAlertas([]);
    saveFormData(e?.target);
    setShowSuccess(true);
  };
  const handleSavePdf = () => { const d = saveFormData(formRef.current); saveInterviewAsPdf(d); };
  const handlePrint   = () => setShowPrintConfirm(true);
  const confirmPrint  = () => { setShowPrintConfirm(false); const d = saveFormData(formRef.current); printInterviewPdfFormat(d); };
  const closeSuccess  = () => { setShowSuccess(false); navigate("/"); };

  // Helper: ¿el tipo requiere mostrar campo de parentesco?
  const mostrarParentesco = (tipo) => tipo === "exalumno";

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right .75rem center; background-repeat: no-repeat; background-size: 1.25em; padding-right: 2.5rem !important; }
        select:focus { outline: none; border-color: #51626f; box-shadow: 0 0 0 2px rgba(81,98,111,.15); }
      `}</style>

      {/* Header */}
      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>
        <Stepper pasoActual={4} />
        {modoLectura && (
          <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4">
            <span className="material-symbols-outlined text-amber-500 text-xl">visibility</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800">Modo lectura</p>
              <p className="text-xs text-amber-600">Estás viendo una entrevista previa. El formulario está bloqueado.</p>
            </div>
          </div>
        )}

      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>help</span>
              <h2 className="text-xl font-semibold text-slate-800">Preguntas Extras</h2>
            </div>

            <div className="space-y-8">

              {/* 20 — Condición de salud */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">20. ¿Padece su hijo de alguna condición de salud física o mental? ¿Requiere tratamiento?</label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="condicion_salud" value={val} label={lbl}
                      selected={condicionSalud} onToggle={() => makeToggle(condicionSalud, setCondicionSalud)(val)} />
                  ))}
                </div>
                {condicionSalud === "Si" && (
                  <textarea name="condicion_salud_detalle" defaultValue={saved.condicion_salud_detalle || ""}
                    placeholder="Explique la condición y tratamiento..." className={`mt-4 ${INPUT}`} rows={3} />
                )}
              </div>

              {/* 21 — Medicamento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">21. ¿Toma su hijo(a) algún medicamento fijo o regularmente?</label>
                <div className="flex flex-wrap gap-3">
                  {[["Si","Sí"],["No","No"],["Tal vez","Tal vez"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="medicamento" value={val} label={lbl}
                      selected={medicamento} onToggle={() => makeToggle(medicamento, setMedicamento)(val)} />
                  ))}
                </div>
                {(medicamento === "Si" || medicamento === "Tal vez") && (
                  <textarea name="medicamento_detalle" defaultValue={saved.medicamento_detalle || ""}
                    placeholder="¿Cuál(es)? Dosis y frecuencia si aplica..." className={`mt-4 ${INPUT}`} rows={2} />
                )}
              </div>

              {/* 22 — Supervisor extraescolar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">22. ¿Quién supervisa al estudiante durante actividades extraescolares?</label>
                <div className="flex flex-wrap gap-3">
                  {["Madre","Padre","Tutor legal","Madrastra","Padrastro","Otro"].map(val => (
                    <RadioCard key={val} name="supervisor_extraescolar" value={val} label={val}
                      selected={supervisorExtra} onToggle={() => makeToggle(supervisorExtra, setSupervisorExtra)(val)} />
                  ))}
                </div>
                {supervisorExtra === "Otro" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Especifique quién supervisa</label>
                    <input type="text" name="supervisor_otro_especifico" defaultValue={saved.supervisor_otro_especifico || ""}
                      placeholder="Ej: Abuela, tío, hermano mayor..." className={INPUT} />
                  </div>
                )}
              </div>

              {/* 23 — Padres fuera del país */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">23. ¿Alguno de los padres reside fuera del país?</label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="padres_fuera" value={val} label={lbl}
                      selected={padresFuera} onToggle={() => makeToggle(padresFuera, setPadresFuera)(val)} />
                  ))}
                </div>

                {padresFuera === "Si" && (
                  <div className="mt-6 space-y-6">
                    {/* ¿Cuál padre? */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Especifique cuál:</label>
                      <div className="flex flex-wrap gap-3">
                        {["Madre","Padre","Ambos"].map(val => (
                          <RadioCard key={val} name="padres_fuera_detalle" value={val} label={val}
                            selected={padresFueraDetalle} onToggle={() => makeToggle(padresFueraDetalle, setPadresFueraDetalle)(val)} />
                        ))}
                      </div>
                    </div>

                    {/* País según selección */}
                    {(padresFueraDetalle === "Madre" || padresFueraDetalle === "Ambos") && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          País de residencia — {padresFueraDetalle === "Ambos" ? "Madre" : "Madre"}
                        </label>
                        <div className="max-w-md space-y-3">
                          <StyledSelect name="pais_madre" defaultValue={saved.pais_madre || ""}>
                            <option value="">Seleccione país...</option>
                            {PAISES.filter(p => p !== "Otro").map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="Otro">Otro</option>
                          </StyledSelect>
                          {paisMadre === "Otro" && (
                            <input type="text" name="pais_madre_otro" defaultValue={saved.pais_madre_otro || ""}
                              placeholder="Escriba el país..." className={INPUT} />
                          )}
                        </div>
                        {/* hack para capturar cambio en el select sin controlled */}
                        <select className="hidden" onChange={e => setPaisMadre(e.target.value)} defaultValue={saved.pais_madre || ""}>
                          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    )}

                    {(padresFueraDetalle === "Padre" || padresFueraDetalle === "Ambos") && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          País de residencia — Padre
                        </label>
                        <div className="max-w-md space-y-3">
                          <StyledSelect name="pais_padre" defaultValue={saved.pais_padre || ""}>
                            <option value="">Seleccione país...</option>
                            {PAISES.filter(p => p !== "Otro").map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="Otro">Otro</option>
                          </StyledSelect>
                          {paisPadre === "Otro" && (
                            <input type="text" name="pais_padre_otro" defaultValue={saved.pais_padre_otro || ""}
                              placeholder="Escriba el país..." className={INPUT} />
                          )}
                        </div>
                        <select className="hidden" onChange={e => setPaisPadre(e.target.value)} defaultValue={saved.pais_padre || ""}>
                          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones adicionales</label>
                      <textarea name="observaciones_padres_fuera" defaultValue={saved.observaciones_padres_fuera || ""}
                        placeholder="Detalles sobre la situación, tiempo fuera, visitas, etc..." className={INPUT} rows={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* 24 — Tipo de casa (sin sub-opciones al marcar Otros) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">24. La casa en que viven es:</label>
                <div className="flex flex-wrap gap-3">
                  {["Propia","Rentada","Prestada","Otros"].map(val => (
                    <RadioCard key={val} name="tipo_casa" value={val} label={val}
                      selected={tipoCasa} onToggle={() => makeToggle(tipoCasa, setTipoCasa)(val)} />
                  ))}
                </div>
              </div>

              {/* 25 — Estado de vida de los padres */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">25. Estado de vida de los padres:</label>
                <div className="flex flex-wrap gap-3">
                  {["Ambos viven","Solo vive la madre","Solo vive el padre","Ninguno vive"].map(val => (
                    <RadioCard key={val} name="estado_padres" value={val} label={val}
                      selected={estadoPadres} onToggle={() => makeToggle(estadoPadres, setEstadoPadres)(val)} />
                  ))}
                </div>
              </div>

              {/* 26 — ¿Con quién convive? */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">26. ¿Con quién convive el estudiante?</label>
                <div className="flex flex-wrap gap-3">
                  {["Con ambos","Solo con la madre","Solo con el padre","No convive con ninguno"].map(val => (
                    <RadioCard key={val} name="convive_padres" value={val} label={val}
                      selected={convivePadres} onToggle={() => makeToggle(convivePadres, setConvivePadres)(val)} />
                  ))}
                </div>
              </div>

              {/* 27 — Figuras familiares */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">27. ¿Existe alguna de las siguientes figuras en el núcleo familiar?</label>
                <div className="flex flex-wrap gap-3">
                  {["Madrastra","Padrastro","Ambos","Ninguno"].map(val => (
                    <RadioCard key={val} name="figuras_familiares" value={val} label={val}
                      selected={figurasFamiliares} onToggle={() => makeToggle(figurasFamiliares, setFigurasFamiliares)(val)} />
                  ))}
                </div>
              </div>

              {/* 28 — Hermanos / exalumnos en IPISA */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">28. ¿Tiene algún hermano(a) o exalumno en IPISA?</label>
                <div className="flex gap-3 mb-5">
                  <RadioCard name="hermanos_exalumnos_si_no" value="Si" label="Sí"
                    selected={mostrarHermanos ? "Si" : ""}
                    onToggle={() => { if (!mostrarHermanos) { setMostrarHermanos(true); if (hermanos.length === 0) addHermano(); } else { setMostrarHermanos(false); setHermanos([]); } }} />
                  <RadioCard name="hermanos_exalumnos_si_no" value="No" label="No"
                    selected={!mostrarHermanos && saved.hermanos_exalumnos_si_no === "No" ? "No" : ""}
                    onToggle={() => { setMostrarHermanos(false); setHermanos([]); }} />
                </div>

                {mostrarHermanos && (
                  <div className="space-y-5">
                    {hermanos.map((h, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                          <h4 className="text-base font-semibold text-slate-800">Persona {index + 1}</h4>
                          {hermanos.length > 1 && (
                            <button type="button" onClick={() => removeHermano(index)}
                              className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all text-sm font-medium">
                              <span className="material-symbols-outlined text-base">delete</span> Eliminar
                            </button>
                          )}
                        </div>

                        {/* ── Tipo: hermano | hermano exalumno | exalumno ── */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-3">Tipo</label>
                          <div className="flex flex-wrap gap-3">
                            {[["hermano","hermano(a)"], ["hermano exalumno","hermano(a) exalumno(a)"], ["exalumno","exalumno(a)"]].map(([t, lbl]) => (
                              <div key={t} onClick={() => updateHermano(index, "tipo", h.tipo === t ? "" : t)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none"
                                style={{
                                  borderColor: h.tipo === t ? P : "#cbd5e1",
                                  background:  h.tipo === t ? "rgba(81,98,111,.07)" : "white",
                                  boxShadow:   h.tipo === t ? `inset 0 0 0 1px ${P}` : "none",
                                }}>
                                <div style={{
                                  width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                                  border: `2px solid ${h.tipo === t ? P : "#94a3b8"}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  {h.tipo === t && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: P }} />}
                                </div>
                                <span className="text-sm font-semibold" style={{ color: h.tipo === t ? P : "#475569" }}>{lbl}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nombre */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                            <input name={`hermanos[${index}].nombre`} type="text" value={h.nombre}
                              onChange={e => updateHermano(index, "nombre", e.target.value)}
                              placeholder="Ej: Ana López" className={INPUT} />
                          </div>

                          {/* Taller */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Taller</label>
                            <StyledSelect name={`hermanos[${index}].taller`} defaultValue={h.taller}>
                              <option value="">Seleccione taller</option>
                              {TALLERES.map(t => <option key={t} value={t}>{t}</option>)}
                            </StyledSelect>
                          </div>

                          {/* Parentesco — solo para exalumno / hermano exalumno */}
                          {mostrarParentesco(h.tipo) && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parentesco con el estudiante</label>
                              <input type="text" name={`hermanos[${index}].otro_especifico`} value={h.otro_especifico || ""}
                                onChange={e => updateHermano(index, "otro_especifico", e.target.value)}
                                placeholder="Ej: primo, tío exalumno..." className={INPUT} />
                            </div>
                          )}

                          {/* Año de graduación — en la misma fila que parentesco cuando este aparece */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Año de graduación (si aplica)</label>
                            <input name={`hermanos[${index}].anio`} type="number" value={h.anio}
                              onChange={e => updateHermano(index, "anio", e.target.value)}
                              placeholder="Ej: 2023" className={INPUT} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center mt-4">
                      <button type="button" onClick={addHermano}
                        className="px-6 py-2.5 rounded-xl border font-medium flex items-center gap-2 text-sm transition-all hover:opacity-80"
                        style={{ background: "rgba(81,98,111,.07)", color: P, borderColor: "rgba(81,98,111,.3)" }}>
                        <span className="material-symbols-outlined text-base">add</span> Agregar otra persona
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 29 — Valoración de la familia */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">29. Valoración de la familia</label>
                <div className="max-w-xl">
                <StyledSelect name="valoracion_familia" defaultValue={saved.valoracion_familia || ""}>
                  <option value="">Seleccione</option>
                  <option value="100">100 – Familias muy necesitadas, viven en situación de pobreza</option>
                  <option value="75">75 – Familias necesitadas pero estables, trabaja solo uno de los padres</option>
                  <option value="50">50 – Familias estables, ambos padres trabajan, son profesionales</option>
                  <option value="25">25 – Familias estables económicamente, ingresos superior a $100,000</option>
                </StyledSelect>
                </div>
                <p className="mt-2 text-xs text-slate-500">El 100 se le da prioridad y el 25 menos prioridad</p>
              </div>

              {/* Observaciones internas */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-xl" style={{ color: P }}>lock</span>
                  <label className="block text-sm font-semibold text-slate-700">Observaciones internas</label>
                </div>
                <textarea name="observaciones_internas" defaultValue={saved.observaciones_internas || ""}
                  placeholder="Notas internas del entrevistador (no aparecen en el PDF)..."
                  className={INPUT} rows={4} />
              </div>

            </div>
          </div>
        </fieldset>

        {/* Alertas de validación */}
        {alertas.length > 0 && (
          <div id="alertas-validacion" className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-left"
            style={{ animation: "fadeIn .25s ease" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-white text-base">priority_high</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-800 mb-1">Atención requerida</p>
                  {alertas.length === 1
                    ? <p className="text-sm text-red-600">Falta completar: {alertas[0]}</p>
                    : <>
                        <p className="text-sm text-red-600 mb-2">Faltan {alertas.length} campos por completar:</p>
                        <ul className="space-y-1">
                          {alertas.map((a, i) => (
                            <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </>
                  }
                </div>
              </div>
              <button onClick={() => setAlertas([])} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 order-2 sm:order-1">Código: P-AD-01-F-04 | Rev. 03</p>
          <div className="flex flex-wrap items-stretch justify-end gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button type="button" onClick={() => navigate("/paso3")}
              className="px-8 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base">arrow_back</span> Volver atrás
            </button>
            <button type="button" onClick={handlePrint}
              className="px-8 py-3 rounded-xl font-bold border transition-all flex items-center gap-2 hover:opacity-80"
              style={{ color: P, borderColor: P }}>
              <span className="material-symbols-outlined text-base">print</span> Imprimir
            </button>
            <button type="button" onClick={handleSavePdf}
              className="px-8 py-3 rounded-xl font-bold border transition-all flex items-center gap-2 hover:opacity-80"
              style={{ color: P, borderColor: P }}>
              <span className="material-symbols-outlined text-base">picture_as_pdf</span> Guardar PDF
            </button>
            {!modoLectura && (
              <button type="submit"
                className="px-10 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
                style={{ background: P, boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}>
                Guardar y Finalizar <span className="material-symbols-outlined text-base">check_circle</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal éxito */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm z-50">
          <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-200">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(81,98,111,.1)" }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: P }}>check_circle</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-5">Entrevista guardada exitosamente</h3>
            <button onClick={closeSuccess} className="text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              style={{ background: P }}>OK</button>
          </div>
        </div>
      )}

      {/* Modal imprimir */}
      {showPrintConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm z-50">
          <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">¿Desea imprimir la entrevista?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={confirmPrint} className="text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                style={{ background: P }}>Sí</button>
              <button onClick={() => setShowPrintConfirm(false)}
                className="border border-slate-300 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">No</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </FormWrapper>
  );
}