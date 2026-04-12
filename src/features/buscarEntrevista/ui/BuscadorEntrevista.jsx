import { useBuscarEntrevista } from "../model/useBuscarEntrevista";

/**
 * Caja de búsqueda de entrevistas previas.
 * @param {{ onCargar: (data: object) => void, onEditar: (data: object) => void }} props
 */
export default function BuscadorEntrevista({ onCargar, onEditar }) {
  const { query, resultados, buscar, cargar, editar } = useBuscarEntrevista({ onCargar, onEditar });

  return (
    <div className="mb-6 relative">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#d1323b] focus-within:ring-2 focus-within:ring-red-100 transition-all">
        <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar entrevista previa por nombre..."
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
        />
        {query && (
          <button onClick={() => buscar("")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {resultados.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
          {resultados.map(({ key, data }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-800">{data.nombres} {data.apellidos}</p>
                {data.fecha && <p className="text-xs text-slate-400">{data.fecha}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => cargar(data)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all hover:bg-blue-50"
                  style={{ color: "#51626f", borderColor: "#51626f" }}>
                  Ver
                </button>
                <button onClick={() => editar(data)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium text-white transition-all hover:opacity-90"
                  style={{ background: "#d1323b", borderColor: "#d1323b" }}>
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && resultados.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-slate-500 text-center">
          No se encontraron resultados para <strong>"{query}"</strong>
        </div>
      )}
    </div>
  );
}
