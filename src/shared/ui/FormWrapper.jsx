/**
 * Contenedor principal para cada paso del formulario.
 * Centraliza la tarjeta blanca y el scroll de la página.
 */
export default function FormWrapper({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans" style={{ background: "#f4f5f7" }}>
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {children}
      </div>
    </div>
  );
}
