import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const P     = "#51626f";
const FOCUS = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;

const FormWrapper = ({ children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {children}
    </div>
  </div>
);

const FormFooter = ({ onBack, nextLabel }) => (
  <div className="flex items-center justify-between pt-10 border-t border-slate-200">
    <p className="text-xs text-slate-400">Código: P-AD-01-F-04 | Rev. 03</p>
    <div className="flex items-center gap-3">
      <button type="button" onClick={onBack}
        className="px-8 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
        ← Volver atrás
      </button>
      <button type="submit"
        className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
        style={{ background: P, boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}>
        {nextLabel} →
      </button>
    </div>
  </div>
);

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
              <div className="h-1 flex-grow rounded-full"
                style={{ background: completado ? "#22c55e" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

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

function readStorage() {
  try { const r = window.localStorage.getItem("entrevista"); return r ? JSON.parse(r) : {}; }
  catch { window.localStorage.removeItem("entrevista"); return {}; }
}

const ESTADOS_CIVILES = [
  "Soltero/a","Casado/a","Divorciado/a","Viudo/a",
  "Unión libre","Separado/a","En trámite de divorcio",
];

export default function Step2Form() {
  const navigate    = useNavigate();
  const modoLectura = localStorage.getItem("entrevista_modo_lectura") === "true";

  // ── Leer storage una sola vez al montar ───────────────────────────────────
  const s = readStorage();

  // ── TODOS los campos como estado controlado ───────────────────────────────
  const [estadoCivil,          setEstadoCivil]          = useState(s.estado_civil            || "");
  const [conducta,             setConducta]             = useState(s.conducta                || "");
  const [inconvenientes,       setInconvenientes]       = useState(s.inconvenientes          || "");
  const [ayudaPsic,            setAyudaPsic]            = useState(s.ayuda_psic              || "");
  const [ayudaPsicDetalle,     setAyudaPsicDetalle]     = useState(s.ayuda_psic_detalle      || "");
  const [zonaVivienda,         setZonaVivienda]         = useState(s.zona_vivienda           || "");
  const [habitos,              setHabitos]              = useState(s.habitos                 || "");
  const [actividadesFamilia,   setActividadesFamilia]   = useState(s.actividades_familia     || "");
  const [tiempoJuntos,         setTiempoJuntos]         = useState(s.tiempo_juntos           || "");
  const [expectativasCentro,   setExpectativasCentro]   = useState(s.expectativas_centro     || "");
  const [agresionOcurrida,     setAgresionOcurrida]     = useState(s.agresion_ocurrida       || "");
  const [agresiones,           setAgresiones]           = useState(s.agresiones              || "");

  const [errores, setErrores] = useState([]);

  const toggle = (val, getter, setter) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
    if (errores.length) setErrores([]);
  };

  // ── AUTO-GUARDADO ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoLectura) return;
    const existing = readStorage();
    const data = {
      ...existing,
      estado_civil:           estadoCivil,
      conducta,
      inconvenientes,
      ayuda_psic:             ayudaPsic,
      ayuda_psic_detalle:     ayudaPsic === "Si" ? ayudaPsicDetalle : "",
      zona_vivienda:          zonaVivienda,
      habitos,
      actividades_familia:    actividadesFamilia,
      tiempo_juntos:          tiempoJuntos,
      expectativas_centro:    expectativasCentro,
      agresion_ocurrida:      agresionOcurrida,
      agresiones:             agresionOcurrida === "Si" ? agresiones : "",
    };
    localStorage.setItem("entrevista", JSON.stringify(data));
  }, [
    estadoCivil, conducta, inconvenientes, ayudaPsic, ayudaPsicDetalle,
    zonaVivienda, habitos, actividadesFamilia, tiempoJuntos,
    expectativasCentro, agresionOcurrida, agresiones,
  ]);

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const err = [];
    if (!estadoCivil)                              err.push("Estado civil de los padres");
    if (!conducta.trim())                          err.push("Pregunta 1: Conducta escolar del estudiante");
    if (!inconvenientes.trim())                    err.push("Pregunta 2: Inconvenientes en el colegio");
    if (!ayudaPsic)                                err.push("Pregunta 3: Ayuda psicológica (Sí / No)");
    if (ayudaPsic === "Si" && !ayudaPsicDetalle.trim())
                                                   err.push("Pregunta 3: Especifique la ayuda psicológica recibida");
    if (!zonaVivienda.trim())                      err.push("Pregunta 4: Zona de vivienda");
    if (!habitos.trim())                           err.push("Pregunta 5: Hábitos de estudio");
    if (!actividadesFamilia.trim())                err.push("Pregunta 6: Actividades en familia");
    if (!tiempoJuntos.trim())                      err.push("Pregunta 7: Tiempo juntos en casa");
    if (!expectativasCentro.trim())                err.push("Pregunta 8: Expectativas del Centro");
    if (!agresionOcurrida)                         err.push("Pregunta 9: Agresiones (Sí / No)");
    if (agresionOcurrida === "Si" && !agresiones.trim())
                                                   err.push("Pregunta 9: Especifique las agresiones");
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoLectura) { navigate("/paso3"); return; }
    const err = validar();
    if (err.length) {
      setErrores(err);
      return;
    }
    // El useEffect ya guardó todo, solo navegamos
    navigate("/paso3");
  };

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>
        <Stepper pasoActual={2} />
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

      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>

          {/* Estado Civil */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>groups</span>
              <h2 className="text-xl font-semibold text-slate-800">Estado Civil de los Padres <span className="text-red-400">*</span></h2>
            </div>
            {estadoCivil && !modoLectura && (
              <p className="text-[10px] text-slate-400 italic mb-3 animate-pulse">
                * Haz clic de nuevo en <strong>{estadoCivil}</strong> para quitar la selección.
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ESTADOS_CIVILES.map(op => (
                <RadioCard key={op} name="estado_civil" value={op} label={op}
                  selected={estadoCivil}
                  onToggle={() => toggle(op, estadoCivil, setEstadoCivil)} />
              ))}
            </div>
          </div>

          {/* Detalle del Estudiante */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>person</span>
              <h2 className="text-xl font-semibold text-slate-800">Detalle del Estudiante</h2>
            </div>
            <div className="space-y-8">

              {/* 1 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. ¿Cómo describe la conducta escolar del estudiante? <span className="text-red-400">*</span>
                </label>
                <textarea value={conducta} onChange={e => { setConducta(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Describa el comportamiento general..." className={INPUT} rows={3} />
              </div>

              {/* 2 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  2. ¿Ha tenido el estudiante algún inconveniente en el colegio? ¿Cómo usted lo ayudó? <span className="text-red-400">*</span>
                </label>
                <textarea value={inconvenientes} onChange={e => { setInconvenientes(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Relate situaciones y su intervención..." className={INPUT} rows={3} />
              </div>

              {/* 3 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  3. ¿Ha recibido el estudiante algún tipo de ayuda psicológica? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="ayuda_psic" value={val} label={lbl}
                      selected={ayudaPsic}
                      onToggle={() => toggle(val, ayudaPsic, setAyudaPsic)} />
                  ))}
                </div>
                {ayudaPsic === "Si" && (
                  <textarea value={ayudaPsicDetalle}
                    onChange={e => { setAyudaPsicDetalle(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Especifique motivo, duración y profesional..."
                    className={`mt-4 ${INPUT}`} rows={2} />
                )}
              </div>

              {/* 4 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  4. ¿En qué zona viven de la ciudad? ¿Desde cuándo? <span className="text-red-400">*</span>
                </label>
                <textarea value={zonaVivienda} onChange={e => { setZonaVivienda(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Especifique la zona y tiempo de residencia..." className={INPUT} rows={3} />
              </div>

              {/* 5 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  5. ¿Cuáles hábitos de estudios tiene el niño? <span className="text-red-400">*</span>
                </label>
                <textarea value={habitos} onChange={e => { setHabitos(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Horarios, lugar de estudio, supervisión..." className={INPUT} rows={3} />
              </div>

              {/* 6 y 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    6. ¿Cuáles actividades realizan como familia? <span className="text-red-400">*</span>
                  </label>
                  <textarea value={actividadesFamilia} onChange={e => { setActividadesFamilia(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Pasatiempos, paseos o rutinas compartidas..." className={INPUT} rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    7. ¿Cuánto tiempo están juntos en la casa? <span className="text-red-400">*</span>
                  </label>
                  <textarea value={tiempoJuntos} onChange={e => { setTiempoJuntos(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Cantidad de horas de convivencia diaria..." className={INPUT} rows={2} />
                </div>
              </div>

              {/* 8 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  8. ¿Qué espera usted de este Centro? <span className="text-red-400">*</span>
                </label>
                <textarea value={expectativasCentro} onChange={e => { setExpectativasCentro(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Expectativas académicas y formativas..." className={INPUT} rows={3} />
              </div>

              {/* 9 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  9. ¿Ha agredido el estudiante a algún compañero? ¿Lo han agredido? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3 mb-2">
                  {[["Si","Sí"],["No","No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="agresion_ocurrida" value={val} label={lbl}
                      selected={agresionOcurrida}
                      onToggle={() => toggle(val, agresionOcurrida, setAgresionOcurrida)} />
                  ))}
                </div>
                {agresionOcurrida === "Si" && (
                  <textarea value={agresiones}
                    onChange={e => { setAgresiones(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Especifique tipo de agresión y cómo se resolvió..."
                    className={`mt-4 ${INPUT}`} rows={3} />
                )}
              </div>

            </div>
          </div>
        </fieldset>

        {/* ── Alerta detallada ── */}
        {errores.length > 0 && (
          <div className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50"
            style={{ animation: "fadeIn .25s ease" }}>
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
              <button type="button" onClick={() => setErrores([])}
                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )}

        <FormFooter onBack={() => navigate("/")} nextLabel="Siguiente" />
      </form>
    </FormWrapper>
  );
}