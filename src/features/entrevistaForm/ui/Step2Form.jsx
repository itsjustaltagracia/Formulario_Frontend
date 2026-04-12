import React, { useState } from "react";

// ── Constantes de estilo ─────────────────────────────────
const P = "#51626f";
const FOCUS = `focus:border-[#51626f] focus:ring-2 focus:ring-[#51626f]/10`;
const INPUT = `w-full px-4 py-3 rounded-lg border border-slate-300 outline-none transition-all ${FOCUS}`;

// ── FormWrapper ──────────────────────────────────────────────
const FormWrapper = ({ children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {children}
    </div>
  </div>
);

// ── Footer ────────────────────────────────────────
const FormFooter = ({ onBack, nextLabel }) => (
  <div className="flex items-center justify-between pt-10 border-t border-slate-200">
    <p className="text-xs text-slate-400">Código: P-AD-01-F-04 | Rev. 03</p>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="px-8 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
      >
        ← Volver atrás
      </button>
      <button
        type="submit"
        className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
        style={{ background: P, boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}
      >
        {nextLabel} →
      </button>
    </div>
  </div>
);

// ── Stepper ────────────────────
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
        const activo = s.n === pasoActual;
        return (
          <div key={s.n} className="flex items-center gap-4 md:gap-8 w-full">
            <div className="flex flex-col items-center z-10">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2"
                style={{
                  background: completado ? "#22c55e" : activo ? P : "#e2e8f0",
                  color: completado || activo ? "white" : "#94a3b8",
                  boxShadow: activo
                    ? `0 4px 14px rgba(81,98,111,.35)`
                    : completado ? "0 4px 14px rgba(34,197,94,.35)"
                    : "none",
                }}
              >
                {completado ? "✓" : s.n}
              </div>
              <span
                className="text-xs font-semibold whitespace-nowrap"
                style={{ color: completado ? "#22c55e" : activo ? P : "#94a3b8" }}
              >
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div
                className="h-1 flex-grow rounded-full"
                style={{ background: completado ? "#22c55e" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Radio card con toggle ───────────────
const RadioCard = ({ name, value, label, selected, onToggle }) => {
  const sel = selected === value;
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none min-h-[52px]"
      style={{
        borderColor: sel ? P : "#cbd5e1",
        background: sel ? "rgba(81,98,111,.07)" : "white",
        boxShadow: sel ? `inset 0 0 0 1px ${P}` : "none",
      }}
    >
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

export default function App() {
  const [saved] = useState(() => JSON.parse(localStorage.getItem("entrevista") || "{}"));
  const modoLectura = localStorage.getItem("entrevista_modo_lectura") === "true";

  // Se inicializan como vacíos para que no venga nada marcado por defecto
  const [estadoCivil, setEstadoCivil] = useState(saved.estado_civil || "");
  const [ayudaPsic, setAyudaPsic] = useState(saved.ayuda_psic || "");
  const [agresionOcurrida, setAgresionOcurrida] = useState(saved.agresion_ocurrida || "");

  const makeToggle = (getter, setter) => (val) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoLectura) { 
      window.location.href = "/paso3";
      return; 
    }
    
    const form = new FormData(e.target);
    const data = {
      ...saved,
      ...Object.fromEntries(form.entries()),
      estado_civil: estadoCivil,
      ayuda_psic: ayudaPsic,
      agresion_ocurrida: agresionOcurrida,
    };
    localStorage.setItem("entrevista", JSON.stringify(data));
    window.location.href = "/paso3";
  };

  const ESTADOS_CIVILES = [
    "Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a",
    "Unión libre", "Separado/a", "En trámite de divorcio",
  ];

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>
        <Stepper pasoActual={2} />

        {modoLectura && (
          <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-xl">visibility</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-800">Modo lectura</p>
                <p className="text-xs text-amber-600">Estás viendo una entrevista previa. El formulario está bloqueado.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Formulario ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>

          {/* Estado Civil */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>groups</span>
              <h2 className="text-xl font-semibold text-slate-800">Estado Civil de los Padres</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ESTADOS_CIVILES.map(op => (
                <RadioCard
                  key={op} name="estado_civil" value={op} label={op}
                  selected={estadoCivil}
                  onToggle={() => makeToggle(estadoCivil, setEstadoCivil)(op)}
                />
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
                  1. ¿Cómo describe la conducta escolar del estudiante?
                </label>
                <textarea name="conducta" defaultValue={saved.conducta || ""}
                  placeholder="Describa el comportamiento general..." className={INPUT} rows={3} />
              </div>

              {/* 2 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  2. ¿Ha tenido el estudiante algún inconveniente en el colegio? ¿Cómo usted lo ayudó?
                </label>
                <textarea name="inconvenientes" defaultValue={saved.inconvenientes || ""}
                  placeholder="Relate situaciones y su intervención..." className={INPUT} rows={3} />
              </div>

              {/* 3 — Sí/No con toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  3. ¿Ha recibido el estudiante algún tipo de ayuda psicológica?
                </label>
                <div className="flex gap-3">
                  {[["Si", "Sí"], ["No", "No"]].map(([val, lbl]) => (
                    <RadioCard
                      key={val} name="ayuda_psic" value={val} label={lbl}
                      selected={ayudaPsic}
                      onToggle={() => makeToggle(ayudaPsic, setAyudaPsic)(val)}
                    />
                  ))}
                </div>
                {ayudaPsic === "Si" && (
                  <textarea name="ayuda_psic_detalle" defaultValue={saved.ayuda_psic_detalle || ""}
                    placeholder="Especifique motivo, duración y profesional..."
                    className={`mt-4 ${INPUT}`} rows={2} />
                )}
              </div>

              {/* 4 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  4. ¿En qué zona viven de la ciudad? ¿Desde cuándo?
                </label>
                <textarea name="zona_vivienda" defaultValue={saved.zona_vivienda || ""}
                  placeholder="Especifique la zona y tiempo de residencia..." className={INPUT} rows={3} />
              </div>

              {/* 5 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  5. ¿Cuáles hábitos de estudios tiene el niño?
                </label>
                <textarea name="habitos" defaultValue={saved.habitos || ""}
                  placeholder="Horarios, lugar de estudio, supervisión..." className={INPUT} rows={3} />
              </div>

              {/* 6 y 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    6. ¿Cuáles actividades realizan como familia?
                  </label>
                  <textarea name="actividades_familia" defaultValue={saved.actividades_familia || ""}
                    placeholder="Pasatiempos, paseos o rutinas compartidas..." className={INPUT} rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    7. ¿Cuánto tiempo están juntos en la casa?
                  </label>
                  <textarea name="tiempo_juntos" defaultValue={saved.tiempo_juntos || ""}
                    placeholder="Cantidad de horas de convivencia diaria..." className={INPUT} rows={2} />
                </div>
              </div>

              {/* 8 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  8. ¿Qué espera usted de este Centro?
                </label>
                <textarea name="expectativas_centro" defaultValue={saved.expectativas_centro || ""}
                  placeholder="Expectativas académicas y formativas..." className={INPUT} rows={3} />
              </div>

              {/* 9 — Sí/No con toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  9. ¿Ha agredido el estudiante a algún compañero? ¿Lo han agredido?
                </label>
                <div className="flex gap-3 mb-4">
                  {[["Si", "Sí"], ["No", "No"]].map(([val, lbl]) => (
                    <RadioCard
                      key={val} name="agresion_ocurrida" value={val} label={lbl}
                      selected={agresionOcurrida}
                      onToggle={() => makeToggle(agresionOcurrida, setAgresionOcurrida)(val)}
                    />
                  ))}
                </div>
                {agresionOcurrida === "Si" && (
                  <textarea name="agresiones" defaultValue={saved.agresiones || ""}
                    placeholder="Especifique tipo de agresión y cómo se resolvió..."
                    className={INPUT} rows={3} />
                )}
              </div>

            </div>
          </div>
        </fieldset>

        <FormFooter onBack={handleBack} nextLabel="Siguiente" />
      </form>
    </FormWrapper>
  );
}