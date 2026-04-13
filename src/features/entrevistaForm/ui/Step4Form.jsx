import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveInterviewAsPdf, printInterviewPdfFormat } from "../../pdfExport/lib/index";

// ── Constantes de estilo ───────────────────────────────────────────────────────
const P     = "#51626f";
const FOCUS = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;

// ── Labels ─────────────────────────────────────────────────────────────────────
const RequiredLabel = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-slate-700 mb-4 ${className}`}>
    {children} <span className="text-red-500 ml-0.5">*</span>
  </label>
);
const OptionalLabel = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-slate-700 mb-2 ${className}`}>
    {children} <span className="text-slate-400 text-xs font-normal ml-1">(opcional)</span>
  </label>
);

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
                  boxShadow:  activo ? `0 4px 14px rgba(81,98,111,.35)` : completado ? "0 4px 14px rgba(34,197,94,.35)" : "none",
                }}>
                {completado ? "✓" : s.n}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap"
                style={{ color: completado ? "#22c55e" : activo ? P : "#94a3b8" }}>
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="h-1 flex-grow rounded-full" style={{ background: completado ? "#22c55e" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── RadioCard ──────────────────────────────────────────────────────────────────
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

// ── StyledSelect ──────────────────────────────────────────────────────────────
const StyledSelect = ({ name, value, onChange, children, className = "" }) => (
  <div className="relative">
    <select name={name} value={value} onChange={onChange}
      className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none cursor-pointer transition-all ${FOCUS} ${className}`}>
      {children}
    </select>
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-lg">expand_more</span>
  </div>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function readStorage() {
  try { const r = window.localStorage.getItem("entrevista"); return r ? JSON.parse(r) : {}; }
  catch { window.localStorage.removeItem("entrevista"); return {}; }
}

const PAISES   = ["Haití","Estados Unidos","Venezuela","España","Italia","Colombia","China","Cuba","Puerto Rico","Francia","Otro"];
const TALLERES = ["INFO","GAT","CYP","EBA","MECA","AUTO","ELDAD","ELCA"];
const TIPOS_HERMANO = [
  { value: "hermano",           label: "hermano(a)" },
  { value: "hermano exalumno",  label: "hermano(a) exalumno(a)" },
  { value: "pariente exalumno", label: "pariente exalumno" },
  { value: "pariente",          label: "pariente" },
];
const mostrarParentesco = (tipo) => tipo === "pariente exalumno" || tipo === "pariente";

// ══════════════════════════════════════════════════════════════════════════════
export default function Step4Form() {
  const navigate    = useNavigate();
  const formRef     = useRef(null);
  const modoLectura = localStorage.getItem("entrevista_modo_lectura") === "true";

  const [showSuccess,      setShowSuccess]      = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);
  const [alertas,          setAlertas]          = useState([]);

  // ── Leer storage una sola vez al montar ───────────────────────────────────
  const s = readStorage();

  // ── TODOS los campos como estado controlado ───────────────────────────────
  const [condicionSalud,        setCondicionSalud]        = useState(s.condicion_salud            || "");
  const [condicionSaludDetalle, setCondicionSaludDetalle] = useState(s.condicion_salud_detalle    || "");
  const [medicamento,           setMedicamento]           = useState(s.medicamento                || "");
  const [medicamentoDetalle,    setMedicamentoDetalle]    = useState(s.medicamento_detalle        || "");
  const [supervisorExtra,       setSupervisorExtra]       = useState(s.supervisor_extraescolar    || "");
  const [supervisorOtroEsp,     setSupervisorOtroEsp]     = useState(s.supervisor_otro_especifico || "");
  const [padresFuera,           setPadresFuera]           = useState(s.padres_fuera               || "");
  const [padresFueraDetalle,    setPadresFueraDetalle]    = useState(s.padres_fuera_detalle       || "");
  const [paisMadre,             setPaisMadre]             = useState(s.pais_madre                 || "");
  const [paisMadreOtro,         setPaisMadreOtro]         = useState(s.pais_madre_otro            || "");
  const [paisPadre,             setPaisPadre]             = useState(s.pais_padre                 || "");
  const [paisPadreOtro,         setPaisPadreOtro]         = useState(s.pais_padre_otro            || "");
  const [obsPadresFuera,        setObsPadresFuera]        = useState(s.observaciones_padres_fuera || "");
  const [tipoCasa,              setTipoCasa]              = useState(s.tipo_casa                  || "");
  const [estadoPadres,          setEstadoPadres]          = useState(s.estado_padres              || "");
  const [convivePadres,         setConvivePadres]         = useState(s.convive_padres             || "");
  const [figurasFamiliares,     setFigurasFamiliares]     = useState(s.figuras_familiares         || "");
  const [mostrarHermanos,       setMostrarHermanos]       = useState(s.hermanos_exalumnos_si_no === "Si" || (s.hermanos?.length > 0));
  const [hermanosNo,            setHermanosNo]            = useState(s.hermanos_exalumnos_si_no === "No");
  const [valoracion,            setValoracion]            = useState(s.valoracion_familia         || "");
  const [obsInternas,           setObsInternas]           = useState(s.observaciones_internas     || "");

  // ── Hermanos ──────────────────────────────────────────────────────────────
  const initHermanos = s.hermanos?.length > 0
    ? s.hermanos
    : s.hermanos_nombre
      ? [{ nombre: s.hermanos_nombre, anio: s.hermanos_anio, taller: s.hermanos_taller, tipo: "hermano", otro_especifico: "" }]
      : [];
  const [hermanos, setHermanos] = useState(initHermanos);

  const addHermano    = () => setHermanos(h => [...h, { nombre: "", anio: "", taller: "", tipo: "hermano", otro_especifico: "" }]);
  const removeHermano = (i) => setHermanos(h => h.filter((_, j) => j !== i));
  const updateHermano = (i, field, val) => setHermanos(h => { const a = [...h]; a[i] = { ...a[i], [field]: val }; return a; });

  // ── Toggle helper ─────────────────────────────────────────────────────────
  const toggle = (val, getter, setter) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
  };

  // ── AUTO-GUARDADO ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoLectura) return;
    const existing = readStorage();
    const data = {
      ...existing,
      condicion_salud:            condicionSalud,
      condicion_salud_detalle:    condicionSalud === "Si" ? condicionSaludDetalle : "",
      medicamento,
      medicamento_detalle:        (medicamento === "Si" || medicamento === "Tal vez") ? medicamentoDetalle : "",
      supervisor_extraescolar:    supervisorExtra,
      supervisor_otro_especifico: supervisorExtra === "Otro" ? supervisorOtroEsp : "",
      padres_fuera:               padresFuera,
      padres_fuera_detalle:       padresFuera === "Si" ? padresFueraDetalle : "",
      pais_madre:                 padresFuera === "Si" ? paisMadre : "",
      pais_madre_otro:            paisMadre === "Otro" ? paisMadreOtro : "",
      pais_padre:                 padresFuera === "Si" ? paisPadre : "",
      pais_padre_otro:            paisPadre === "Otro" ? paisPadreOtro : "",
      observaciones_padres_fuera: padresFuera === "Si" ? obsPadresFuera : "",
      tipo_casa:                  tipoCasa,
      estado_padres:              estadoPadres,
      convive_padres:             convivePadres,
      figuras_familiares:         figurasFamiliares,
      hermanos_exalumnos_si_no:   mostrarHermanos ? "Si" : hermanosNo ? "No" : "",
      hermanos:                   mostrarHermanos ? hermanos : [],
      valoracion_familia:         valoracion,
      observaciones_internas:     obsInternas,
    };
    localStorage.setItem("entrevista", JSON.stringify(data));
  }, [
    condicionSalud, condicionSaludDetalle, medicamento, medicamentoDetalle,
    supervisorExtra, supervisorOtroEsp, padresFuera, padresFueraDetalle,
    paisMadre, paisMadreOtro, paisPadre, paisPadreOtro, obsPadresFuera,
    tipoCasa, estadoPadres, convivePadres, figurasFamiliares,
    mostrarHermanos, hermanosNo, hermanos, valoracion, obsInternas,
  ]);

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const errores = [];
    if (!condicionSalud)              errores.push("Pregunta 20: Condición de salud del hijo");
    if (!medicamento)                 errores.push("Pregunta 21: Medicamento fijo o regular");
    if (!supervisorExtra)             errores.push("Pregunta 22: Supervisor extraescolar");
    if (!padresFuera)                 errores.push("Pregunta 23: Padres fuera del país");
    if (!tipoCasa)                    errores.push("Pregunta 24: Tipo de vivienda");
    if (!estadoPadres)                errores.push("Pregunta 25: Estado de vida de los padres");
    if (!convivePadres)               errores.push("Pregunta 26: Con quién convive el estudiante");
    if (!figurasFamiliares)           errores.push("Pregunta 27: Figuras familiares en el núcleo");
    if (!mostrarHermanos && !hermanosNo) errores.push("Pregunta 28: Hermanos o exalumnos en IPISA");
    if (!valoracion)                  errores.push("Pregunta 29: Valoración de la familia");
    return errores;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (modoLectura) return;
    const errores = validar();
    if (errores.length > 0) {
      setAlertas(errores);
      setTimeout(() => document.getElementById("alertas-validacion")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setAlertas([]);
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
    setShowSuccess(true);
  };

  const getCurrentData = () => JSON.parse(localStorage.getItem("entrevista") || "{}");
  const handleSavePdf  = () => saveInterviewAsPdf(getCurrentData());
  const handlePrint    = () => setShowPrintConfirm(true);
  const confirmPrint   = () => { setShowPrintConfirm(false); printInterviewPdfFormat(getCurrentData()); };

  // ── Al dar OK: limpiar storage y volver al inicio con form vacío ──────────
  const closeSuccess = () => {
    setShowSuccess(false);
    localStorage.removeItem("entrevista");
    localStorage.removeItem("entrevista_modo_lectura");
    navigate("/");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.7); } to { opacity:1; transform:scale(1); } }
        @keyframes checkDraw { from { stroke-dashoffset:50; } to { stroke-dashoffset:0; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        select:focus { outline:none; border-color:#51626f; box-shadow:0 0 0 2px rgba(81,98,111,.15); }
        .check-circle { animation: scaleIn .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        .check-path   { stroke-dasharray:50; stroke-dashoffset:50; animation: checkDraw .4s ease .35s forwards; }
        .spinner      { animation: spin .8s linear infinite; }
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

              {/* 20 */}
              <div>
                <RequiredLabel>20. ¿Padece su hijo de alguna condición de salud física o mental? ¿Requiere tratamiento?</RequiredLabel>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="condicion_salud" value={val} label={lbl}
                      selected={condicionSalud} onToggle={() => toggle(val, condicionSalud, setCondicionSalud)} />
                  ))}
                </div>
                {condicionSalud === "Si" && (
                  <textarea value={condicionSaludDetalle} onChange={e => setCondicionSaludDetalle(e.target.value)}
                    placeholder="Explique la condición y tratamiento..." className={`mt-4 ${INPUT}`} rows={3} />
                )}
              </div>

              {/* 21 */}
              <div>
                <RequiredLabel>21. ¿Toma su hijo(a) algún medicamento fijo o regularmente?</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {[["Si","Sí"],["No","No"],["Tal vez","Tal vez"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="medicamento" value={val} label={lbl}
                      selected={medicamento} onToggle={() => toggle(val, medicamento, setMedicamento)} />
                  ))}
                </div>
                {(medicamento === "Si" || medicamento === "Tal vez") && (
                  <textarea value={medicamentoDetalle} onChange={e => setMedicamentoDetalle(e.target.value)}
                    placeholder="¿Cuál(es)? Dosis y frecuencia si aplica..." className={`mt-4 ${INPUT}`} rows={2} />
                )}
              </div>

              {/* 22 */}
              <div>
                <RequiredLabel>22. ¿Quién supervisa al estudiante durante actividades extraescolares?</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {["Madre","Padre","Tutor legal","Madrastra","Padrastro","Otro"].map(val => (
                    <RadioCard key={val} name="supervisor_extraescolar" value={val} label={val}
                      selected={supervisorExtra} onToggle={() => toggle(val, supervisorExtra, setSupervisorExtra)} />
                  ))}
                </div>
                {supervisorExtra === "Otro" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Especifique quién supervisa</label>
                    <input type="text" value={supervisorOtroEsp} onChange={e => setSupervisorOtroEsp(e.target.value)}
                      placeholder="Ej: Abuela, tío, hermano mayor..." className={INPUT} />
                  </div>
                )}
              </div>

              {/* 23 */}
              <div>
                <RequiredLabel>23. ¿Alguno de los padres reside fuera del país?</RequiredLabel>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val,lbl]) => (
                    <RadioCard key={val} name="padres_fuera" value={val} label={lbl}
                      selected={padresFuera} onToggle={() => toggle(val, padresFuera, setPadresFuera)} />
                  ))}
                </div>
                {padresFuera === "Si" && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Especifique cuál:</label>
                      <div className="flex flex-wrap gap-3">
                        {["Madre","Padre","Ambos"].map(val => (
                          <RadioCard key={val} name="padres_fuera_detalle" value={val} label={val}
                            selected={padresFueraDetalle} onToggle={() => toggle(val, padresFueraDetalle, setPadresFueraDetalle)} />
                        ))}
                      </div>
                    </div>
                    {(padresFueraDetalle === "Madre" || padresFueraDetalle === "Ambos") && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">País de residencia — Madre</label>
                        <div className="max-w-md space-y-3">
                          <StyledSelect name="pais_madre" value={paisMadre} onChange={e => setPaisMadre(e.target.value)}>
                            <option value="">Seleccione país...</option>
                            {PAISES.filter(p => p !== "Otro").map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="Otro">Otro</option>
                          </StyledSelect>
                          {paisMadre === "Otro" && (
                            <input type="text" value={paisMadreOtro} onChange={e => setPaisMadreOtro(e.target.value)}
                              placeholder="Escriba el país..." className={INPUT} />
                          )}
                        </div>
                      </div>
                    )}
                    {(padresFueraDetalle === "Padre" || padresFueraDetalle === "Ambos") && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">País de residencia — Padre</label>
                        <div className="max-w-md space-y-3">
                          <StyledSelect name="pais_padre" value={paisPadre} onChange={e => setPaisPadre(e.target.value)}>
                            <option value="">Seleccione país...</option>
                            {PAISES.filter(p => p !== "Otro").map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="Otro">Otro</option>
                          </StyledSelect>
                          {paisPadre === "Otro" && (
                            <input type="text" value={paisPadreOtro} onChange={e => setPaisPadreOtro(e.target.value)}
                              placeholder="Escriba el país..." className={INPUT} />
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <OptionalLabel>Observaciones adicionales</OptionalLabel>
                      <textarea value={obsPadresFuera} onChange={e => setObsPadresFuera(e.target.value)}
                        placeholder="Detalles sobre la situación, tiempo fuera, visitas, etc..." className={INPUT} rows={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* 24 */}
              <div>
                <RequiredLabel>24. La casa en que viven es:</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {["Propia","Rentada","Prestada","Otros"].map(val => (
                    <RadioCard key={val} name="tipo_casa" value={val} label={val}
                      selected={tipoCasa} onToggle={() => toggle(val, tipoCasa, setTipoCasa)} />
                  ))}
                </div>
              </div>

              {/* 25 */}
              <div>
                <RequiredLabel>25. Estado de vida de los padres:</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {["Ambos viven","Solo vive la madre","Solo vive el padre","Ninguno vive"].map(val => (
                    <RadioCard key={val} name="estado_padres" value={val} label={val}
                      selected={estadoPadres} onToggle={() => toggle(val, estadoPadres, setEstadoPadres)} />
                  ))}
                </div>
              </div>

              {/* 26 */}
              <div>
                <RequiredLabel>26. ¿Con quién convive el estudiante?</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {["Con ambos","Solo con la madre","Solo con el padre","No convive con ninguno"].map(val => (
                    <RadioCard key={val} name="convive_padres" value={val} label={val}
                      selected={convivePadres} onToggle={() => toggle(val, convivePadres, setConvivePadres)} />
                  ))}
                </div>
              </div>

              {/* 27 */}
              <div>
                <RequiredLabel>27. ¿Existe alguna de las siguientes figuras en el núcleo familiar?</RequiredLabel>
                <div className="flex flex-wrap gap-3">
                  {["Madrastra","Padrastro","Ambos","Ninguno"].map(val => (
                    <RadioCard key={val} name="figuras_familiares" value={val} label={val}
                      selected={figurasFamiliares} onToggle={() => toggle(val, figurasFamiliares, setFigurasFamiliares)} />
                  ))}
                </div>
              </div>

              {/* 28 */}
              <div>
                <RequiredLabel>28. ¿Tiene algún hermano(a) o exalumno en IPISA?</RequiredLabel>
                <div className="flex gap-3 mb-5">
                  <RadioCard name="hermanos_exalumnos_si_no" value="Si" label="Sí"
                    selected={mostrarHermanos ? "Si" : ""}
                    onToggle={() => {
                      if (modoLectura) return;
                      if (!mostrarHermanos) { setMostrarHermanos(true); setHermanosNo(false); if (hermanos.length === 0) addHermano(); }
                      else { setMostrarHermanos(false); setHermanos([]); }
                    }} />
                  <RadioCard name="hermanos_exalumnos_si_no" value="No" label="No"
                    selected={hermanosNo && !mostrarHermanos ? "No" : ""}
                    onToggle={() => { if (modoLectura) return; setMostrarHermanos(false); setHermanos([]); setHermanosNo(p => !p); }} />
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

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-3">Tipo</label>
                          <div className="flex flex-wrap gap-3">
                            {TIPOS_HERMANO.map(({ value: t, label: lbl }) => (
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
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                            <input type="text" value={h.nombre} onChange={e => updateHermano(index, "nombre", e.target.value)}
                              placeholder="Ej: Ana López" className={INPUT} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Taller</label>
                            <StyledSelect value={h.taller} onChange={e => updateHermano(index, "taller", e.target.value)}>
                              <option value="">Seleccione taller</option>
                              {TALLERES.map(t => <option key={t} value={t}>{t}</option>)}
                            </StyledSelect>
                          </div>
                          {mostrarParentesco(h.tipo) && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parentesco con el estudiante</label>
                              <input type="text" value={h.otro_especifico || ""} onChange={e => updateHermano(index, "otro_especifico", e.target.value)}
                                placeholder="Ej: primo, tío, vecino..." className={INPUT} />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Año de graduación (si aplica)</label>
                            <input type="number" value={h.anio} onChange={e => updateHermano(index, "anio", e.target.value)}
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

              {/* 29 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  29. Valoración de la familia <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="max-w-xl">
                  <StyledSelect name="valoracion_familia" value={valoracion} onChange={e => setValoracion(e.target.value)}>
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
                  <OptionalLabel className="!mb-0">Observaciones internas</OptionalLabel>
                </div>
                <textarea value={obsInternas} onChange={e => setObsInternas(e.target.value)}
                  placeholder="Notas internas del entrevistador (no aparecen en el PDF)..."
                  className={INPUT} rows={4} />
              </div>

            </div>
          </div>
        </fieldset>

        {/* Alertas de validación */}
        {alertas.length > 0 && (
          <div id="alertas-validacion" className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50"
            style={{ animation: "fadeIn .25s ease" }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-white text-lg">priority_high</span>
              </div>
              <div className="flex-1">
                <p className="text-red-900 text-sm font-bold mb-2">
                  Atención requerida — Falta{alertas.length > 1 ? "n" : ""} {alertas.length} campo{alertas.length > 1 ? "s" : ""} por completar:
                </p>
                <ul className="space-y-1">
                  {alertas.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-red-700 text-xs">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" onClick={() => setAlertas([])} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-lg">close</span>
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
              <button type="submit" disabled={isSaving}
                className="px-10 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 min-w-[200px] justify-center"
                style={{
                  background: isSaving ? "#7a909c" : P,
                  boxShadow:  isSaving ? "none" : "0 4px 14px rgba(81,98,111,.4)",
                  cursor:     isSaving ? "not-allowed" : "pointer",
                }}>
                {isSaving ? (
                  <>
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                      <path d="M12 2 a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>Guardar y Finalizar <span className="material-symbols-outlined text-base">check_circle</span></>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal éxito */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm z-50"
          style={{ animation: "fadeIn .2s ease" }}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-200"
            style={{ animation: "scaleIn .35s cubic-bezier(.34,1.56,.64,1)" }}>
            <div className="check-circle w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(81,98,111,.1)" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" stroke="#51626f" strokeWidth="2.5" opacity="0.3" />
                <path className="check-path" d="M12 22 L19 29 L32 15" stroke="#51626f" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¡Entrevista guardada!</h3>
            <p className="text-sm text-slate-500 mb-6">La entrevista fue guardada exitosamente.</p>
            <button onClick={closeSuccess}
              className="text-white px-10 py-3 rounded-xl font-bold hover:opacity-90 transition-all w-full"
              style={{ background: P }}>
              OK
            </button>
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