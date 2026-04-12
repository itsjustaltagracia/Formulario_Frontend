import { useState } from "react";
import { entrevistaStorage } from "../../../shared/lib/entrevistaStorage";

/**
 * Hook que encapsula la lógica del buscador de entrevistas previas.
 */
export function useBuscarEntrevista({ onCargar, onEditar }) {
  const [query, setQuery]           = useState("");
  const [resultados, setResultados] = useState([]);

  const buscar = (texto) => {
    setQuery(texto);
    setResultados(texto.trim() ? entrevistaStorage.buscar(texto) : []);
  };

  const cargar = (data) => {
    entrevistaStorage.set(data);
    entrevistaStorage.setModoLectura(true);
    setQuery("");
    setResultados([]);
    onCargar?.(data);
  };

  const editar = (data) => {
    entrevistaStorage.set(data);
    entrevistaStorage.setModoLectura(false);
    setQuery("");
    setResultados([]);
    onEditar?.(data);
  };

  return { query, resultados, buscar, cargar, editar };
}
