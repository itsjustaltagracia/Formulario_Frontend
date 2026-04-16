import { useState, useEffect, useCallback } from "react";
import { entrevistaStorage } from "../../../shared/lib/entrevistaStorage";

const API = "/api";

export function useBuscarEntrevista({ onCargar, onEditar }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  const buscar = useCallback(async (texto) => {
    setQuery(texto);
    setError(null);

    if (!texto || !texto.trim()) {
      setResultados([]);
      return;
    }

    const searchTerm = texto.trim();
    setBuscando(true);

    try {
      // 1. Obtener el token para la autorización
      const token = localStorage.getItem("token");

      // 2. Intentar buscar en el Backend con el Header de Authorization
      const res = await fetch(`${API}/entrevistas/buscar?query=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ESTA ES LA LÍNEA CLAVE: Enviamos el pase de acceso
          "Authorization": `Bearer ${token}`
        }
      });

      // Si el servidor responde 401, es que el token no es válido o no existe
      if (res.status === 401) {
        throw new Error("Sesión no válida o expirada. Por favor, inicia sesión.");
      }

      if (!res.ok) throw new Error("Error en la búsqueda");

      const dataBackend = await res.json();

      if (Array.isArray(dataBackend) && dataBackend.length > 0) {
        setResultados(dataBackend);
        return;
      }

      // 3. Fallback a localStorage si no hay resultados en BD
      const dataLocal = entrevistaStorage.buscar(searchTerm);
      setResultados(dataLocal);

    } catch (err) {
      console.warn("Búsqueda en backend falló:", err.message);
      
      // Si es un error de autorización, lo mostramos claramente
      if (err.message.includes("Sesión")) {
        setError(err.message);
      } else {
        setError("Servidor no disponible. Usando datos locales...");
      }

      const dataLocal = entrevistaStorage.buscar(searchTerm);
      setResultados(dataLocal);
    } finally {
      setBuscando(false);
    }
  }, []);

  // ... (el resto de las funciones cargar y editar se mantienen igual)
  const cargar = (item) => {
    const data = item.data || item;
    entrevistaStorage.set(data);
    entrevistaStorage.setModoLectura(true);
    setQuery("");
    setResultados([]);
    onCargar?.(data);
  };

  const editar = (item) => {
    const data = item.data || item;
    entrevistaStorage.set(data);
    entrevistaStorage.setModoLectura(false);
    setQuery("");
    setResultados([]);
    onEditar?.(data);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      setError(null);
    }
  }, [query]);

  return { query, resultados, buscando, error, buscar, cargar, editar };
}