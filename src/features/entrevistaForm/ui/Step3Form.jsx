import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Constantes de estilo ───────────────────────────────────────────────────────
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
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2"
                style={{
                  background: completado ? "#22c55e" : activo ? P : "#e2e8f0",
                  color:      completado || activo ? "white" : "#94a3b8",
                  boxShadow:  activo     ? `0 4px 14px rgba(81,98,111,.35)`
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

// ── Radio card con toggle ──────────────────────────────────────────────────────
const RadioCard = ({ name, value, label, selected, onToggle }) => {
  const sel = selected === value;
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none min-h-[52px]"
      style={{
        borderColor: sel ? P : "#cbd5e1",
        background:  sel ? "rgba(81,98,111,.07)" : "white",
        boxShadow:   sel ? `inset 0 0 0 1px ${P}` : "none",
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

// ── StyledSelect ──────────────────────────────────────────────────────────────
const StyledSelect = ({ name, value, onChange, defaultValue, children, className = "" }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none cursor-pointer transition-all ${FOCUS} ${className}`}
    >
      {children}
    </select>
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-lg">expand_more</span>
  </div>
);

const LISTA_ENTREVISTADORES = [
  "Carmen Alvarez","Esther Garcia","Glenys Estevez","Rud Peña",
  "Luis Quezada","Luis Reyes","Laura Rodriguez","Radelqui Santos",
  "Adelin De la Rosa","Yariel Pichardo","Daniela Vicente","Julia Paulino",
];

const DUENOS_TELEFONO = [
  "Madre","Padre","Tutor legal","Madrastra","Padrastro","Casa",
];

// Hasta 3 teléfonos
const TELEFONO_VACIO = { numero: "", dueno: "" };

export default function Step3Form() {
  const navigate    = useNavigate();
  const [saved]     = useState(() => JSON.parse(localStorage.getItem("entrevista") || "{}"));
  const modoLectura = localStorage.getItem("entrevista_modo_lectura") === "true";

  // Toggles con desmarque
  const [alfabetizacion,  setAlfabetizacion]  = useState(saved.alfabetizacion   || "");
  const [otraInstitucion, setOtraInstitucion] = useState(saved.otra_institucion  || "");
  const [repetidoCurso,   setRepetidoCurso]   = useState(saved.repetido_curso    || "");

  const makeToggle = (getter, setter) => (val) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
  };

  // Entrevistador
  const savedEnt = saved.entrevistador || "";
  const esOtro   = savedEnt !== "" && !LISTA_ENTREVISTADORES.includes(savedEnt);
  const [entrevistadorSelect, setEntrevistadorSelect] = useState(esOtro ? "otro" : savedEnt);
  const [entrevistadorOtro,   setEntrevistadorOtro]   = useState(esOtro ? savedEnt : "");

  // Teléfonos (array)
  const initTels = () => {
    if (saved.telefonos?.length > 0) return saved.telefonos;
    // compatibilidad hacia atrás: campo único
    if (saved.telefono) return [{ numero: saved.telefono, dueno: saved.telefono_dueno || "" }];
    return [{ ...TELEFONO_VACIO }];
  };
  const [telefonos, setTelefonos] = useState(initTels);

  const addTelefono    = () => { if (telefonos.length < 3) setTelefonos([...telefonos, { ...TELEFONO_VACIO }]); };
  const removeTelefono = (i) => { if (telefonos.length > 1) setTelefonos(telefonos.filter((_, j) => j !== i)); };
  const updateTel      = (i, field, val) => {
    const arr = [...telefonos]; arr[i] = { ...arr[i], [field]: val }; setTelefonos(arr);
  };

  // Alertas de validación
  const [alertas, setAlertas] = useState([]);

  const validar = (values) => {
    const errores = [];
    if (!values.convivencia?.trim())      errores.push("Pregunta 10: Convivencia del estudiante");
    if (!values.motivos?.trim())          errores.push("Pregunta 11: Motivos para elegir la institución");
    if (!otraInstitucion)                 errores.push("Pregunta 12: ¿Viene de otra institución?");
    if (!values.estudiante_descr?.trim()) errores.push("Pregunta 13: Descripción del estudiante");
    if (!repetidoCurso)                   errores.push("Pregunta 14: ¿Ha repetido algún curso?");
    if (!alfabetizacion)                  errores.push("Pregunta 15: Problemas de alfabetización");
    if (!values.motivacion?.trim())       errores.push("Pregunta 16: Motivación del estudiante");
    if (!values.ingreso_real?.trim())     errores.push("Pregunta 17: Ingreso real de la familia");
    if (!values.aporte_mensual?.trim())   errores.push("Pregunta 18: Aporte mensual sugerido");
    const tieneTel = telefonos.some(t => t.numero.trim() !== "");
    if (!tieneTel)                        errores.push("Pregunta 19: Al menos un teléfono de contacto");
    return errores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoLectura) { navigate("/paso4"); return; }
    const form   = new FormData(e.target);
    const values = Object.fromEntries(form.entries());

    const errores = validar(values);
    if (errores.length > 0) {
      setAlertas(errores);
      setTimeout(() => document.getElementById("alertas-step3")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setAlertas([]);

    const data = {
      ...saved,
      ...values,
      alfabetizacion:   alfabetizacion,
      otra_institucion: otraInstitucion,
      repetido_curso:   repetidoCurso,
      telefonos,
    };
    // limpiar detalles si se desmarcó
    if (alfabetizacion  !== "Si") data.alfabetizacion_detalle = "";
    if (otraInstitucion !== "Si") data.dificultades           = "";
    if (repetidoCurso   !== "Si") data.repetido               = "";
    data.entrevistador = entrevistadorSelect === "otro"
      ? entrevistadorOtro.trim()
      : entrevistadorSelect;
    localStorage.setItem("entrevista", JSON.stringify(data));
    navigate("/paso4");
  };

  return (
    <FormWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right .75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em;
          padding-right: 2.5rem !important;
        }
        select:focus { outline: none; border-color: #51626f; box-shadow: 0 0 0 2px rgba(81,98,111,.15); }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>Entrevista Familiar</h1>
        <Stepper pasoActual={3} />

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

      {/* ── Formulario ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>school</span>
              <h2 className="text-xl font-semibold text-slate-800">Académico y Detalles Finales</h2>
            </div>

            <div className="space-y-8">

              {/* 10 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">10. ¿Con quién vive el estudiante? En caso de no ser con su/s padre/s, ¿Por qué?</label>
                <textarea name="convivencia" defaultValue={saved.convivencia || ""} placeholder="Describa la situación de convivencia..." className={INPUT} rows={2} />
              </div>

              {/* 11 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">11. ¿Por qué su familia quiere pertenecer a esta institución?</label>
                <textarea name="motivos" defaultValue={saved.motivos || ""} placeholder="Motivaciones para elegir esta institución..." className={INPUT} rows={3} />
              </div>

              {/* 12 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  12. ¿El estudiante viene de otra institución?
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {[
                    ["Si",  "Sí, viene de otra institución"],
                    ["No",  "No, no viene de otra institución"],
                  ].map(([val, lbl]) => (
                    <RadioCard key={val} name="otra_institucion" value={val} label={lbl}
                      selected={otraInstitucion}
                      onToggle={() => makeToggle(otraInstitucion, setOtraInstitucion)(val)} />
                  ))}
                </div>
                {otraInstitucion === "Si" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      ¿Se presentó alguna dificultad? ¿Cómo entiende que podemos ayudar?
                    </label>
                    <textarea name="dificultades" defaultValue={saved.dificultades || ""}
                      placeholder="Detalle dificultades previas y expectativas de apoyo..." className={INPUT} rows={3} />
                  </div>
                )}
              </div>

              {/* 13 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">13. Al estudiante: Háblanos un poco de tu familia, ¿Qué tiempo le dedicas al estudio?, ¿En cuál/es asignatura/s consideras que te destacas?</label>
                <textarea name="estudiante_descr" defaultValue={saved.estudiante_descr || ""} placeholder="Respuesta del estudiante..." className={INPUT} rows={3} />
              </div>

              {/* 14 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  14. Si el estudiante está sobreedad, ¿ha repetido algún curso?
                </label>
                <div className="flex gap-3">
                  {[["Si", "Sí"], ["No", "No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="repetido_curso" value={val} label={lbl}
                      selected={repetidoCurso}
                      onToggle={() => makeToggle(repetidoCurso, setRepetidoCurso)(val)} />
                  ))}
                </div>
                {repetidoCurso === "Si" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Especifique el curso y el motivo</label>
                    <textarea name="repetido" defaultValue={saved.repetido || ""}
                      placeholder="Ej: Repitió 3ro de primaria por dificultades de aprendizaje..." className={INPUT} rows={2} />
                  </div>
                )}
              </div>

              {/* 15 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">15. ¿El niño o niña ha presentado problemas para alfabetizarse?</label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="alfabetizacion" value={val} label={lbl}
                      selected={alfabetizacion}
                      onToggle={() => makeToggle(alfabetizacion, setAlfabetizacion)(val)} />
                  ))}
                </div>
                {alfabetizacion === "Si" && (
                  <textarea name="alfabetizacion_detalle" defaultValue={saved.alfabetizacion_detalle || ""}
                    placeholder="Especifique motivo, duración y profesional..." className={`mt-4 ${INPUT}`} rows={2} />
                )}
              </div>

              {/* 16 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">16. ¿Deseas estudiar en esta escuela? ¿Qué ha escuchado de este centro? ¿Qué te motiva a estar acá?</label>
                <textarea name="motivacion" defaultValue={saved.motivacion || ""} placeholder="Motivación del estudiante..." className={INPUT} rows={3} />
              </div>

              {/* 17, 18 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">17. Ingreso real de la familia</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">$</span>
                    <input name="ingreso_real" type="text" defaultValue={saved.ingreso_real || ""} placeholder="0.00" className={`pl-8 ${INPUT}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">18. Aporte mensual sugerido</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">$</span>
                    <input name="aporte_mensual" type="text" defaultValue={saved.aporte_mensual || ""} placeholder="0.00" className={`pl-8 ${INPUT}`} />
                  </div>
                </div>
              </div>

              {/* 19 — Teléfonos con dueño */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">19. Teléfono(s) para contacto</label>
                <div className="space-y-3">
                  {telefonos.map((tel, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      {/* Dueño — desplegable */}
                      <div className="w-44 flex-shrink-0">
                        <StyledSelect
                          value={tel.dueno}
                          onChange={e => updateTel(i, "dueno", e.target.value)}
                        >
                          <option value="">¿De quién?</option>
                          {DUENOS_TELEFONO.map(d => <option key={d} value={d}>{d}</option>)}
                        </StyledSelect>
                      </div>
                      {/* Número */}
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 text-base">phone</span>
                        </span>
                        <input
                          type="tel"
                          value={tel.numero}
                          onChange={e => updateTel(i, "numero", e.target.value)}
                          placeholder="000-000-0000"
                          className={`pl-9 ${INPUT}`}
                        />
                      </div>
                      {/* Quitar */}
                      {telefonos.length > 1 && (
                        <button type="button" onClick={() => removeTelefono(i)}
                          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-xl">remove_circle</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {telefonos.length < 3 && (
                  <button type="button" onClick={addTelefono}
                    className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:opacity-80"
                    style={{ color: P, borderColor: "rgba(81,98,111,.3)", background: "rgba(81,98,111,.05)" }}>
                    <span className="material-symbols-outlined text-base">add</span> Agregar teléfono
                  </button>
                )}
              </div>

              {/* Observaciones externas */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-xl" style={{ color: P }}>comment</span>
                  <label className="block text-sm font-semibold text-slate-700">Observaciones externas</label>
                </div>
                <textarea name="observaciones" defaultValue={saved.observaciones || ""} placeholder="Notas adicionales del entrevistador que aparecen al momento de la impresión..." className={INPUT} rows={4} />
              </div>

              {/* Entrevistador */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Entrevista realizada por</label>
                <StyledSelect
                  value={entrevistadorSelect}
                  onChange={e => { setEntrevistadorSelect(e.target.value); if (e.target.value !== "otro") setEntrevistadorOtro(""); }}
                >
                  <option value="" disabled>Seleccione entrevistador(a)...</option>
                  {LISTA_ENTREVISTADORES.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="otro">Otro...</option>
                </StyledSelect>
                {entrevistadorSelect === "otro" && (
                  <input type="text" value={entrevistadorOtro}
                    onChange={e => setEntrevistadorOtro(e.target.value)}
                    placeholder="Escriba el nombre del entrevistador..."
                    className={`mt-3 ${INPUT}`} />
                )}
              </div>

            </div>
          </div>
        </fieldset>

        {/* ── Alertas de validación ────────────────────────────────────────── */}
        {alertas.length > 0 && (
          <div id="alertas-step3" className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-left"
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
              <button type="button" onClick={() => setAlertas([])} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-10 border-t border-slate-200">
          <p className="text-xs text-slate-400">Código: P-AD-01-F-04 | Rev. 03</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/paso2")}
              className="px-8 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span> Volver atrás
            </button>
            <button
              type="submit"
              className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center gap-2"
              style={{ background: P, boxShadow: "0 4px 14px rgba(81,98,111,.4)" }}
            >
              Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>
    </FormWrapper>
  );
}