import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API   = import.meta.env.VITE_API_URL ?? "/api";
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

const StyledSelect = ({ name, value, onChange, children, className = "" }) => (
  <div className="relative">
    <select name={name} value={value} onChange={onChange}
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

const LISTA_ENTREVISTADORES = [
  "Padre Almonte",
  "Carmen Alvarez","Esther Garcia","Glenys Estevez","Rud Peña",
  "Luis Quezada","Luis Reyes","Laura Rodriguez","Radelqui Santos",
  "Adelin De la Rosa","Yariel Pichardo","Daniela Vicente","Julia Paulino",
];

const DUENOS_TELEFONO = ["Madre","Padre","Tutor legal","Madrastra","Padrastro","Casa"];
const TELEFONO_VACIO  = { numero: "", dueno: "" };

export default function Step3Form() {
  const navigate    = useNavigate();
  const modoLectura = localStorage.getItem("entrevista_modo_lectura") === "true";
  const token       = localStorage.getItem("token");

  const s = readStorage();

  const [convivencia,           setConvivencia]           = useState(s.convivencia           || "");
  const [motivos,               setMotivos]               = useState(s.motivos               || "");
  const [otraInstitucion,       setOtraInstitucion]       = useState(s.otra_institucion         || "");
  const [dificultades,          setDificultades]          = useState(s.dificultades            || "");
  const [estudianteDescr,       setEstudianteDescr]       = useState(s.estudiante_descr         || "");
  const [repetidoCurso,         setRepetidoCurso]         = useState(s.repetido_curso           || "");
  const [repetido,              setRepetido]              = useState(s.repetido                || "");
  const [alfabetizacion,        setAlfabetizacion]        = useState(s.alfabetizacion          || "");
  const [alfabetizacionDetalle, setAlfabetizacionDetalle] = useState(s.alfabetizacion_detalle   || "");
  const [motivacion,            setMotivacion]            = useState(s.motivacion              || "");
  const [ingresoReal,           setIngresoReal]           = useState(s.ingreso_real            || "");
  const [aporteMensual,         setAporteMensual]         = useState(s.aporte_mensual          || "");
  const [observaciones,         setObservaciones]         = useState(s.observaciones           || "");

  const savedEnt = s.entrevistador || "";
  const esOtro   = savedEnt !== "" && !LISTA_ENTREVISTADORES.includes(savedEnt);
  const [entrevistadorSelect, setEntrevistadorSelect] = useState(esOtro ? "otro" : savedEnt);
  const [entrevistadorOtro,   setEntrevistadorOtro]   = useState(esOtro ? savedEnt : "");

  const initTels = () => {
    if (s.telefonos?.length > 0) return s.telefonos;
    if (s.telefono) return [{ numero: s.telefono, dueno: s.telefono_dueno || "" }];
    return [{ ...TELEFONO_VACIO }];
  };
  const [telefonos, setTelefonos] = useState(initTels);

  const [errores,  setErrores]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [errorApi, setErrorApi] = useState("");

  const toggle = (val, getter, setter) => {
    if (modoLectura) return;
    setter(getter === val ? "" : val);
    if (errores.length) setErrores([]);
  };

  const addTelefono    = () => { if (telefonos.length < 3) setTelefonos([...telefonos, { ...TELEFONO_VACIO }]); };
  const removeTelefono = (i) => { if (telefonos.length > 1) setTelefonos(telefonos.filter((_, j) => j !== i)); };
  const updateTel      = (i, field, val) => {
    const arr = [...telefonos]; arr[i] = { ...arr[i], [field]: val }; setTelefonos(arr);
  };

  // Limpieza de campos condicionales
  useEffect(() => {
    if (otraInstitucion === "No") setDificultades("");
    if (repetidoCurso === "No") setRepetido("");
    if (alfabetizacion === "No") setAlfabetizacionDetalle("");
  }, [otraInstitucion, repetidoCurso, alfabetizacion]);

  // Auto-guardado
  useEffect(() => {
    if (modoLectura) return;
    const existing = readStorage();
    const entFinal = entrevistadorSelect === "otro" ? entrevistadorOtro.trim() : entrevistadorSelect;
    localStorage.setItem("entrevista", JSON.stringify({
      ...existing,
      convivencia,
      motivos,
      otra_institucion:       otraInstitucion,
      dificultades:           otraInstitucion === "Si" ? dificultades : "",
      estudiante_descr:       estudianteDescr,
      repetido_curso:         repetidoCurso,
      repetido:               repetidoCurso === "Si" ? repetido : "",
      alfabetizacion,
      alfabetizacion_detalle: alfabetizacion === "Si" ? alfabetizacionDetalle : "",
      motivacion,
      ingreso_real:           ingresoReal,
      aporte_mensual:         aporteMensual,
      telefonos,
      observaciones,
      entrevistador:          entFinal,
    }));
  }, [
    convivencia, motivos, otraInstitucion, dificultades, estudianteDescr,
    repetidoCurso, repetido, alfabetizacion, alfabetizacionDetalle,
    motivacion, ingresoReal, aporteMensual, telefonos,
    observaciones, entrevistadorSelect, entrevistadorOtro,
  ]);

  const validar = () => {
    const err = [];
    if (!convivencia.trim()) err.push("Pregunta 10: ¿Con quién vive el estudiante?");
    if (!motivos.trim()) err.push("Pregunta 11: Motivos para elegir la institución");
    if (!otraInstitucion) err.push("Pregunta 12: ¿Viene de otra institución?");
    if (otraInstitucion === "Si" && !dificultades.trim()) err.push("Pregunta 12: Especifique las dificultades");
    if (!estudianteDescr.trim()) err.push("Pregunta 13: Descripción del estudiante");
    if (!repetidoCurso) err.push("Pregunta 14: ¿Ha repetido algún curso?");
    if (repetidoCurso === "Si" && !repetido.trim()) err.push("Pregunta 14: Especifique el curso y motivo");
    if (!alfabetizacion) err.push("Pregunta 15: Problemas de alfabetización");
    if (alfabetizacion === "Si" && !alfabetizacionDetalle.trim()) err.push("Pregunta 15: Especifique los problemas");
    if (!motivacion.trim()) err.push("Pregunta 16: Motivación del estudiante");
    if (!ingresoReal.trim()) err.push("Pregunta 17: Ingreso real de la familia");
    if (!aporteMensual.trim()) err.push("Pregunta 18: Aporte mensual sugerido");
    
    const tieneTelValido = telefonos.some(t => t.numero.trim() !== "" && t.dueno !== "");
    if (!tieneTelValido) err.push("Pregunta 19: Al menos un teléfono con su dueño");

    const entFinal = entrevistadorSelect === "otro" ? entrevistadorOtro.trim() : entrevistadorSelect;
    if (!entFinal) err.push("Entrevistador: Seleccione quién realizó la entrevista");
    
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modoLectura) { navigate("/paso4"); return; }

    const err = validar();
    if (err.length) {
      setErrores(err);
      setTimeout(() => document.getElementById("alertas-step3")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    const entrevistaId = localStorage.getItem("entrevista_id");
    if (!entrevistaId) {
      setErrorApi("No se encontró el ID de la entrevista. Vuelva al paso 1.");
      return;
    }

    const entFinal = entrevistadorSelect === "otro" ? entrevistadorOtro.trim() : entrevistadorSelect;

    setLoading(true);
    setErrorApi("");
    try {
      const res = await fetch(`${API}/entrevistas/${entrevistaId}/step3`, {
        method:  "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          convivencia,
          motivos,
          otra_institucion:        otraInstitucion,
          dificultades:            otraInstitucion === "Si" ? dificultades : "",
          estudiante_descr:        estudianteDescr,
          repetido_curso:          repetidoCurso,
          repetido:                repetidoCurso === "Si" ? repetido : "",
          alfabetizacion,
          alfabetizacion_detalle:  alfabetizacion === "Si" ? alfabetizacionDetalle : "",
          motivacion,
          ingreso_real:            ingresoReal,
          aporte_mensual:          aporteMensual,
          telefonos,
          observaciones,
          entrevistador:           entFinal,
        }),
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Error al guardar");
      }
      navigate("/paso4");
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
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        select:focus { outline: none; border-color: #51626f; box-shadow: 0 0 0 2px rgba(81,98,111,.15); }
      `}</style>

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

      <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
        <fieldset disabled={modoLectura || loading} className={"space-y-10 " + (modoLectura ? "opacity-60 pointer-events-none select-none" : "")}>
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ color: P }}>school</span>
              <h2 className="text-xl font-semibold text-slate-800">Académico y Detalles Finales</h2>
            </div>

            <div className="space-y-8">

              {/* 10 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  10. ¿Con quién vive el estudiante? En caso de no ser con su/s padre/s, ¿Por qué? <span className="text-red-400">*</span>
                </label>
                <textarea value={convivencia} onChange={e => { setConvivencia(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Describa la situación de convivencia..." className={INPUT} rows={2} />
              </div>

              {/* 11 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  11. ¿Por qué su familia quiere pertenecer a esta institución? <span className="text-red-400">*</span>
                </label>
                <textarea value={motivos} onChange={e => { setMotivos(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Motivaciones para elegir esta institución..." className={INPUT} rows={3} />
              </div>

              {/* 12 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  12. ¿El estudiante viene de otra institución? <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {[["Si","Sí, viene de otra institución"],["No","No, no viene de otra institución"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="otra_institucion" value={val} label={lbl}
                      selected={otraInstitucion}
                      onToggle={() => toggle(val, otraInstitucion, setOtraInstitucion)} />
                  ))}
                </div>
                {otraInstitucion === "Si" && (
                  <div className="mt-4" style={{ animation: "fadeIn .3s ease" }}>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      ¿Se presentó alguna dificultad? ¿Cómo entiende que podemos ayudar? <span className="text-red-400">*</span>
                    </label>
                    <textarea value={dificultades} onChange={e => { setDificultades(e.target.value); if (errores.length) setErrores([]); }}
                      placeholder="Detalle dificultades previas y expectativas de apoyo..." className={INPUT} rows={3} />
                  </div>
                )}
              </div>

              {/* 13 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  13. Al estudiante: Háblanos un poco de tu familia, ¿Qué tiempo le dedicas al estudio?, ¿En cuál/es asignatura/s consideras que te destacas? <span className="text-red-400">*</span>
                </label>
                <textarea value={estudianteDescr} onChange={e => { setEstudianteDescr(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Respuesta del estudiante..." className={INPUT} rows={3} />
              </div>

              {/* 14 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  14. Si el estudiante está sobreedad, ¿ha repetido algún curso? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="repetido_curso" value={val} label={lbl}
                      selected={repetidoCurso}
                      onToggle={() => toggle(val, repetidoCurso, setRepetidoCurso)} />
                  ))}
                </div>
                {repetidoCurso === "Si" && (
                  <div className="mt-4" style={{ animation: "fadeIn .3s ease" }}>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Especifique el curso y el motivo <span className="text-red-400">*</span>
                    </label>
                    <textarea value={repetido} onChange={e => { setRepetido(e.target.value); if (errores.length) setErrores([]); }}
                      placeholder="Ej: Repitió 3ro de primaria por dificultades..." className={INPUT} rows={2} />
                  </div>
                )}
              </div>

              {/* 15 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  15. ¿El niño o niña ha presentado problemas para alfabetizarse? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  {[["Si","Sí"],["No","No"]].map(([val, lbl]) => (
                    <RadioCard key={val} name="alfabetizacion" value={val} label={lbl}
                      selected={alfabetizacion}
                      onToggle={() => toggle(val, alfabetizacion, setAlfabetizacion)} />
                  ))}
                </div>
                {alfabetizacion === "Si" && (
                  <textarea value={alfabetizacionDetalle}
                    onChange={e => { setAlfabetizacionDetalle(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Especifique motivo, duración y profesional..."
                    className={`mt-4 ${INPUT}`} style={{ animation: "fadeIn .3s ease" }} rows={2} />
                )}
              </div>

              {/* 16 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  16. ¿Deseas estudiar en esta escuela? ¿Qué ha escuchado de este centro? ¿Qué te motiva a estar acá? <span className="text-red-400">*</span>
                </label>
                <textarea value={motivacion} onChange={e => { setMotivacion(e.target.value); if (errores.length) setErrores([]); }}
                  placeholder="Motivación del estudiante..." className={INPUT} rows={3} />
              </div>

              {/* 17, 18 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    17. Ingreso real de la familia <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">$</span>
                    <input type="text" value={ingresoReal}
                      onChange={e => { setIngresoReal(e.target.value); if (errores.length) setErrores([]); }}
                      placeholder="0.00" className={`pl-8 ${INPUT}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    18. Aporte mensual sugerido <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">$</span>
                    <input type="text" value={aporteMensual}
                      onChange={e => { setAporteMensual(e.target.value); if (errores.length) setErrores([]); }}
                      placeholder="0.00" className={`pl-8 ${INPUT}`} />
                  </div>
                </div>
              </div>

              {/* 19 — Teléfonos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  19. Teléfono(s) para contacto <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {telefonos.map((tel, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-44 flex-shrink-0">
                        <StyledSelect value={tel.dueno} onChange={e => updateTel(i, "dueno", e.target.value)}>
                          <option value="">¿De quién?</option>
                          {DUENOS_TELEFONO.map(d => <option key={d} value={d}>{d}</option>)}
                        </StyledSelect>
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 text-base">phone</span>
                        </span>
                        <input type="tel" value={tel.numero}
                          onChange={e => updateTel(i, "numero", e.target.value)}
                          placeholder="000-000-0000" className={`pl-9 ${INPUT}`} />
                      </div>
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
                  <span className="text-xs text-slate-400">(opcional)</span>
                </div>
                <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales del entrevistador..."
                  className={INPUT} rows={4} />
              </div>

              {/* Entrevistador */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Entrevista realizada por <span className="text-red-400">*</span>
                </label>
                <StyledSelect
                  value={entrevistadorSelect}
                  onChange={e => {
                    setEntrevistadorSelect(e.target.value);
                    if (e.target.value !== "otro") setEntrevistadorOtro("");
                    if (errores.length) setErrores([]);
                  }}
                >
                  <option value="" disabled>Seleccione entrevistador(a)...</option>
                  {LISTA_ENTREVISTADORES.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="otro">Otro...</option>
                </StyledSelect>
                {entrevistadorSelect === "otro" && (
                  <input type="text" value={entrevistadorOtro}
                    onChange={e => { setEntrevistadorOtro(e.target.value); if (errores.length) setErrores([]); }}
                    placeholder="Escriba el nombre del entrevistador..."
                    className={`mt-3 ${INPUT}`} />
                )}
              </div>

            </div>
          </div>
        </fieldset>

        {/* Error de API */}
        {errorApi && (
          <div className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50">
            <p className="text-red-800 text-sm font-semibold text-center">{errorApi}</p>
          </div>
        )}

        {/* Alertas de validación */}
        {errores.length > 0 && (
          <div id="alertas-step3" className="mx-auto max-w-lg p-4 rounded-2xl border border-red-100 bg-red-50"
            style={{ animation: "fadeIn .25s ease" }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-white text-lg">priority_high</span>
              </div>
              <div className="flex-1">
                <p className="text-red-900 text-sm font-bold mb-2">
                  Atención requerida — {errores.length} campo{errores.length > 1 ? "s" : ""} faltante{errores.length > 1 ? "s" : ""}:
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-10 border-t border-slate-200">
          <p className="text-xs text-slate-400">Código: P-AD-01-F-04 | Rev. 03</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/paso2")}
              className="px-8 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base">arrow_back</span> Atrás
            </button>
            <button type="submit" disabled={loading}
              className="px-12 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: P, boxShadow: loading ? "none" : "0 4px 14px rgba(81,98,111,.4)" }}>
              {loading ? "Guardando..." : (<>Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span></>)}
            </button>
          </div>
        </div>
      </form>
    </FormWrapper>
  );
}