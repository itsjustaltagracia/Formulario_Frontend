import { Routes, Route } from "react-router-dom";
import LoginPage       from "../pages/login/LoginPage";
import EntrevistaStep1 from "../pages/entrevista/EntrevistaStep1";
import EntrevistaStep2 from "../pages/entrevista/EntrevistaStep2";
import EntrevistaStep3 from "../pages/entrevista/EntrevistaStep3";
import EntrevistaStep4 from "../pages/entrevista/EntrevistaStep4";

function App() {
  return (
    <Routes>
      {/* Autenticación */}
      <Route path="/login" element={<LoginPage />} />

      {/* Formulario multi-paso de entrevista familiar */}
      <Route path="/"      element={<EntrevistaStep1 />} />
      <Route path="/paso2" element={<EntrevistaStep2 />} />
      <Route path="/paso3" element={<EntrevistaStep3 />} />
      <Route path="/paso4" element={<EntrevistaStep4 />} />
    </Routes>
  );
}

export default App;
