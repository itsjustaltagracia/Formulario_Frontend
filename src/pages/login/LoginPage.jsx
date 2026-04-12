import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── IMPORTACIÓN DE LOGOS ──
import logoSalesianos from "../../assets/logo-salesianos.png"; 
import logoSalesiano  from "../../assets/logo-salesiano.png"; 

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor, complete todos los campos para continuar.");
      return;
    }

    setError("");
    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      setMostrarExito(true);

      setTimeout(() => {
        navigate("/"); 
      }, 2000);
    }, 1500);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <main 
      style={{ fontFamily: "'Work Sans', sans-serif", height: "100vh" }}
      className="w-full flex flex-col md:flex-row overflow-hidden bg-white relative"
    >
      {/* Notificación de éxito */}
      {mostrarExito && (
        <div style={{
          position: "fixed", bottom: "30px", right: "30px", zIndex: 100,
          background: "#490008", color: "white", padding: "16px 24px",
          display: "flex", alignItems: "center", gap: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", animation: "slideIn 0.5s ease forwards"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c9b0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Acceso concedido — Identidad confirmada
          </span>
        </div>
      )}

      {/* LADO IZQUIERDO: FORMULARIO */}
      <section className="w-full md:w-[50%] xl:w-[45%] h-full flex flex-col bg-white px-8 lg:px-24 z-20"
        style={{ boxSizing: 'border-box' }}
      >
        <div className="flex-grow flex flex-col justify-center">
          
          {/* Header con Logos y Título */}
          <header className="text-center mb-12">

            {/* Dos logos lado a lado con separador */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "30px",
            }}>
              <img 
                src={logoSalesianos} 
                alt="Logo Salesianos Santiago" 
                style={{ width: "80px", height: "auto", objectFit: "contain" }}
              />
              <div style={{ width: "1.5px", height: "60px", background: "#e1e3e4", flexShrink: 0 }} />
              <img 
                src={logoSalesiano} 
                alt="Logo Salesiano" 
                style={{ width: "80px", height: "auto", objectFit: "contain" }}
              />
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
              fontWeight: 400,
              color: "#490008",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              textAlign: "center"
            }}>
              Bienvenidos a FENI
            </h1>
            
            <p style={{
              fontSize: "clamp(7px, 1.1vw, 10.5px)",
              fontWeight: 600,
              letterSpacing: "clamp(0.1em, 0.4vw, 0.25em)",
              color: "#8e9599",
              textTransform: "uppercase",
              marginTop: "12px",
              whiteSpace: "nowrap",
            }}>
              Formulario de Entrevistas Para Nuevo Ingreso
            </p>
          </header>

          {/* Formulario */}
          <form onSubmit={handleLogin} style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "35px",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            {/* Usuario */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#490008" }}>
                IDENTIFICACIÓN DE USUARIO
              </label>
              <input
                type="text"
                placeholder="nombre.usuario"
                value={usuario}
                onChange={handleInputChange(setUsuario)}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: "1.5px solid #e1e3e4", padding: "8px 0px 10px 0px",
                  fontSize: "15px", fontFamily: "'Work Sans', sans-serif",
                  fontWeight: 400, color: "#171c1e", outline: "none",
                }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#490008" }}>
                CLAVE DE ACCESO
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={verContrasena ? "text" : "password"}
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={handleInputChange(setContrasena)}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    borderBottom: "1.5px solid #e1e3e4", padding: "8px 35px 10px 0px",
                    fontSize: "15px", outline: "none"
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setVerContrasena(!verContrasena)}
                  style={{
                    position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#490008",
                    display: "flex", alignItems: "center"
                  }}
                >
                  {verContrasena ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón + Mensaje de Error */}
            <div style={{ paddingTop: "6px" }}>
              <button
                type="submit"
                disabled={cargando}
                style={{
                  width: "100%",
                  background: cargando ? "#70787d" : "#490008",
                  color: "#fff",
                  border: "none",
                  padding: "16px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: cargando ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                {cargando ? "Cargando..." : "INICIAR SESIÓN"}
              </button>

              {error && (
                <p style={{
                  color: "#490008",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  textAlign: "center",
                  marginTop: "12px",
                  letterSpacing: "0.02em"
                }}>
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer style={{ paddingBottom: "25px", textAlign: "center" }}>
          <p style={{
            fontSize: "8.5px", fontWeight: 500,
            letterSpacing: "0.08em", color: "#99a0a3", textTransform: "uppercase"
          }}>
            © 2026 IPISA — SISTEMA DE ENTREVISTA FAMILIAR
          </p>
        </footer>
      </section>

      {/* LADO DERECHO: ILUSTRACIÓN */}
      <section className="hidden md:flex flex-grow h-full relative overflow-hidden bg-[#f5c9b0]">
        <div style={{
          position: "absolute", inset: "0 auto 0 0",
          width: "1.5px", zIndex: 10,
          background: "#e1e3e4",
        }} />

        <svg
          viewBox="0 0 800 900"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="800" height="900" fill="#f5c9b0" />
          <circle cx="500" cy="280" r="110" fill="#f0a882" opacity="0.7" />
          <circle cx="500" cy="280" r="75" fill="#e8896a" opacity="0.6" />
          <path d="M0 520 Q200 420 400 490 Q600 560 800 460 L800 900 L0 900 Z" fill="#c47a5a" opacity="0.5" />
          <path d="M0 580 Q150 500 350 545 Q550 590 800 510 L800 900 L0 900 Z" fill="#a85a3a" opacity="0.6" />
          <path d="M0 640 Q180 570 380 610 Q580 650 800 580 L800 900 L0 900 Z" fill="#8c3e22" opacity="0.7" />
          <path d="M0 700 Q200 640 420 670 Q620 700 800 640 L800 900 L0 900 Z" fill="#6e2510" opacity="0.85" />
          <path d="M0 760 Q150 710 350 730 Q580 755 800 700 L800 900 L0 900 Z" fill="#4a0f05" />
          <path d="M0 820 Q200 780 400 795 Q600 810 800 770 L800 900 L0 900 Z" fill="#2d0502" />
        </svg>
      </section>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}