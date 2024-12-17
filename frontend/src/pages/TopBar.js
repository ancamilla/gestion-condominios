import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const TopBar = ({ userName, role }) => {
  const navigate = useNavigate();
  const [showDocMenu, setShowDocMenu] = useState(false); // Estado para manejar el menú desplegable de Documentación

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

      {/* Enlaces de navegación */}
      <div className="nav-links">
        <span className="nav-item" onClick={() => navigate("/gastos")}>
          Gastos Comunes
        </span>
        <span className="nav-item" onClick={() => navigate("/reservas")}>
          Reserva de espacios
        </span>
        <span className="nav-item" onClick={() => navigate("/reclamos")}>
          Reclamos
        </span>

        {/* Documentación */}
        <div
          className="nav-item dropdown"
          onMouseEnter={() => role === "administrador" && setShowDocMenu(true)}
          onMouseLeave={() => role === "administrador" && setShowDocMenu(false)}
          onClick={() => {
            if (role !== "administrador") navigate("/documentacion");
          }}
        >
          Documentación
          {role === "administrador" && showDocMenu && (
            <div className="dropdown-menu">
              <span onClick={() => navigate("/documentacion")}>Ver</span>
              <span onClick={() => navigate("/documentacion/editar")}>Editar</span>
            </div>
          )}
        </div>

        <span className="nav-item" onClick={() => navigate("/ajustes")}>
          Ajustes
        </span>
      </div>

      {/* Sección de Logout */}
      <div className="logout">
      
        <span onClick={handleLogout}>Cerrar Sesión</span>
      </div>
    </div>
  );
};

export default TopBar;

