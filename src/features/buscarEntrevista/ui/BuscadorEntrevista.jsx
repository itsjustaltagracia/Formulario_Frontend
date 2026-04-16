import { useBuscarEntrevista } from "../model/useBuscarEntrevista";

/**
 * Caja de búsqueda de entrevistas previas.
 * @param {{ onCargar: (data: object) => void, onEditar: (data: object) => void }} props
 */
export default function BuscadorEntrevista({ onCargar, onEditar }) {
  const { 
    query, 
    resultados, 
    buscando, 
    error, 
    buscar, 
    cargar, 
    editar 
  } = useBuscarEntrevista({ onCargar, onEditar });

  return (
    <div className="mb-6 relative">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#d1323b] focus-within:ring-2 focus-within:ring-red-100 transition-all">
        <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
        
        <input
          type="text"
          value={query}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar entrevista previa por nombre..."
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
          disabled={buscando}
        />

        {query && (
          <button 
            onClick={() => buscar("")} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={buscando}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Indicador de búsqueda en progreso */}
      {buscando && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          Buscando en el sistema...
        </div>
      )}

      {/* Resultados encontrados */}
      {resultados.length > 0 && !buscando && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
          {resultados.map(({ key, data }) => (
            <div 
              key={key} 
              className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {data.nombres} {data.apellidos}
                </p>
                {data.fecha && (
                  <p className="text-xs text-slate-400">{data.fecha}</p>
                )}
                {data.formulario && (
                  <p className="text-xs text-slate-400">
                    Formulario: {data.formulario} {data.seccion ? `· Sección ${data.seccion}` : ''}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button 
                  onClick={() => cargar(data)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all hover:bg-blue-50"
                  style={{ color: "#51626f", borderColor: "#51626f" }}
                >
                  Ver
                </button>
                <button 
                  onClick={() => editar(data)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium text-white transition-all hover:opacity-90"
                  style={{ background: "#d1323b", borderColor: "#d1323b" }}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {query && resultados.length === 0 && !buscando && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-slate-500 text-center">
          No se encontraron resultados para <strong>"{query}"</strong>
        </div>
      )}

      {/* Mensaje de error o fallback */}
      {error && !buscando && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-amber-50 border border-amber-200 rounded-xl shadow-xl z-50 px-4 py-3 text-xs text-amber-700">
          {error}
        </div>
      )}
    </div>
  );
}