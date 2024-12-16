import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const TopBar = ({ userName, role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Redirige al login
  };

  return (
    <div className="top-bar">
{/* Nombre de la aplicación */}
    <div className="app-name" onClick={() => navigate("/dashboard")}>
        Gestión de Condominios
      </div>

      <div className="nav-links">
        <span className="nav-item" onClick={() => navigate("/reservas")}>
          Reservas de espacios comunes
        </span>
        {role === "administrador" && (
          <> 
          <span className="nav-item" onClick={() => navigate("/register")}>
            Registrar residente
          </span>
          <span className="nav-item" onClick={() => navigate("/admin/configurar-pagos")}>
            Configurar Pagos
          </span>
          </> 
        )}
      </div>
      <div className="logout">
        <span onClick={handleLogout}>Cerrar Sesión</span>
      </div>
    </div>
  );
};

export default TopBar;
