import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const TopBar = ({ userName, role }) => {
  const navigate = useNavigate();
  const [showGastosDropdown, setShowGastosDropdown] = useState(false);
  const [showDocumentacionDropdown, setShowDocumentacionDropdown] = useState(false);

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

      {/* Navegación Principal */}
      <div className="nav-links">
        {/* Gastos Comunes con Dropdown */}
        <div
          className="nav-item dropdown"
          onMouseEnter={() => setShowGastosDropdown(true)}
          onMouseLeave={() => setShowGastosDropdown(false)}
        >
          <span>Gastos Comunes</span>
          {showGastosDropdown && role === "administrador" && (
            <div className="dropdown-menu">
              <span onClick={() => navigate("/gastos-comunes/editar")}>Editar</span>
            </div>
          )}
        </div>

        {/* Reserva de espacios */}
        <span className="nav-item" onClick={() => navigate("/reservas")}>
          Reserva de espacios
        </span>

        {/* Reclamos */}
        <span className="nav-item" onClick={() => navigate("/reclamos")}>
          Reclamos
        </span>

        {/* Documentación con Dropdown */}
        <div
          className="nav-item dropdown"
          onMouseEnter={() => setShowDocumentacionDropdown(true)}
          onMouseLeave={() => setShowDocumentacionDropdown(false)}
        >
          <span>Documentación</span>
          {showDocumentacionDropdown && role === "administrador" && (
            <div className="dropdown-menu">
              <span onClick={() => navigate("/documentacion/editar")}>Editar</span>
            </div>
          )}
        </div>

        {/* Ajustes */}
        <span className="nav-item" onClick={() => navigate("/ajustes")}>
          Ajustes
        </span>
      </div>

      {/* Cerrar Sesión */}
      <div className="logout">
        <span onClick={handleLogout}>Cerrar Sesión</span>
      </div>
    </div>
  );
};

export default TopBar;

