import { useNavigate } from "react-router-dom";

/**
 * Banner de modo lectura reutilizable.
 * Solo se renderiza si `modoLectura` es true.
 */
export default function BannerLectura({ modoLectura }) {
  const navigate = useNavigate();
  if (!modoLectura) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 mx-8 mt-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-500 text-xl">visibility</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Modo lectura</p>
          <p className="text-xs text-amber-600">Estás viendo una entrevista previa. El formulario está bloqueado.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => { localStorage.removeItem("entrevista_modo_lectura"); navigate("/"); }}
        className="flex-shrink-0 text-xs font-semibold text-amber-700 border border-amber-300 bg-white hover:bg-amber-100 px-4 py-2 rounded-lg transition-all"
      >
        Salir
      </button>
    </div>
  );
}
