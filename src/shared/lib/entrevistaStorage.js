const KEY      = "entrevista";
const KEY_MODO = "entrevista_modo_lectura";

export const entrevistaStorage = {
  get() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { return {}; }
  },
  set(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
  merge(patch) {
    this.set({ ...this.get(), ...patch });
  },
  clear() {
    localStorage.removeItem(KEY);
  },

  isModoLectura() {
    return localStorage.getItem(KEY_MODO) === "true";
  },
  setModoLectura(value) {
    if (value) localStorage.setItem(KEY_MODO, "true");
    else localStorage.removeItem(KEY_MODO);
  },

  /** Busca entrevistas en localStorage por nombre/apellido */
  buscar(texto) {
    if (!texto.trim()) return [];
    const resultados = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && (item.nombres || item.apellidos)) {
          const nombreCompleto = `${item.nombres || ""} ${item.apellidos || ""}`.toLowerCase();
          if (nombreCompleto.includes(texto.toLowerCase())) {
            resultados.push({ key, data: item });
          }
        }
      } catch (_) {}
    }
    return resultados;
  },
};