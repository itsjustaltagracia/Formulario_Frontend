import { useNavigate } from "react-router-dom";

const PASOS = [
  { numero: 1, label: "Datos Básicos",    ruta: "/" },
  { numero: 2, label: "Entorno Familiar", ruta: "/paso2" },
  { numero: 3, label: "Expectativas",     ruta: "/paso3" },
  { numero: 4, label: "Preguntas Extras", ruta: "/paso4" },
];

/**
 * @param {{ pasoActual: number }} props
 */
export default function StepBar({ pasoActual }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto px-6 md:px-12 mb-12">
      {PASOS.map((paso, idx) => {
        const completado = paso.numero < pasoActual;
        const activo     = paso.numero === pasoActual;

        return (
          <div key={paso.numero} className="flex items-center gap-4 md:gap-8 w-full">
            <div className="flex flex-col items-center relative z-10">
              <div
                onClick={() => completado && navigate(paso.ruta)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-md transition-all
                  ${completado ? "cursor-pointer shadow-green-600/30 bg-green-600 text-white"
                    : activo    ? "text-white"
                    : "bg-slate-200 text-slate-500"}`}
                style={activo ? { background: "#d1323b", boxShadow: "0 4px 14px rgba(209,50,59,0.30)" } : {}}
              >
                {completado ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : paso.numero}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap
                  ${completado ? "text-green-600" : activo ? "" : "text-slate-400"}`}
                style={activo ? { color: "#d1323b" } : {}}
              >
                {paso.label}
              </span>
            </div>

            {/* Conector (no añadir después del último) */}
            {idx < PASOS.length - 1 && (
              <div
                className="h-1 flex-grow rounded-full"
                style={{ background: completado ? "#16a34a" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
