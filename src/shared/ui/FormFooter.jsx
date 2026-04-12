/**
 * Barra de botones de navegación inferior del formulario.
 * @param {{
 *   onBack?: () => void,
 *   onNext?: () => void,
 *   extraButtons?: React.ReactNode,
 *   backLabel?: string,
 *   nextLabel?: string,
 *   showNext?: boolean,
 * }} props
 */
export default function FormFooter({
  onBack,
  onNext,
  extraButtons,
  backLabel = "Volver atrás",
  nextLabel = "Siguiente",
  showNext = true,
}) {
  return (
    <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-slate-400 order-2 sm:order-1">Código: P-AD-01-F-04 | Rev. 03</p>
      <div className="flex flex-wrap items-stretch justify-end gap-3 w-full sm:w-auto order-1 sm:order-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-none min-w-[160px] px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2 min-h-[50px]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {backLabel}
          </button>
        )}

        {extraButtons}

        {showNext && (
          <button
            type="submit"
            onClick={onNext}
            className="flex-1 sm:flex-none min-w-[180px] text-white px-10 py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 min-h-[50px]"
            style={{ background: "#d1323b" }}
          >
            {nextLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
