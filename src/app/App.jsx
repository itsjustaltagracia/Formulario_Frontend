import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage       from "../pages/login/LoginPage";
import EntrevistaStep1 from "../pages/entrevista/EntrevistaStep1";
import EntrevistaStep2 from "../pages/entrevista/EntrevistaStep2";
import EntrevistaStep3 from "../pages/entrevista/EntrevistaStep3";
import EntrevistaStep4 from "../pages/entrevista/EntrevistaStep4";

function App() {
  // Comprobamos si existe un token en el almacenamiento local
  const estaAutenticado = !!localStorage.getItem("token");

  return (
    <Routes>
      {/* 1. Autenticación */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Rutas del Formulario (Protegidas) */}
      {/* Si no está autenticado, cualquier intento de ir al form lo manda a /login */}
      <Route 
        path="/" 
        element={estaAutenticado ? <EntrevistaStep1 /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/paso2" 
        element={estaAutenticado ? <EntrevistaStep2 /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/paso3" 
        element={estaAutenticado ? <EntrevistaStep3 /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/paso4" 
        element={estaAutenticado ? <EntrevistaStep4 /> : <Navigate to="/login" />} 
      />

      {/* 3. Comodín: Si escriben cualquier otra cosa, al inicio (que decidirá si va a login o form) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;