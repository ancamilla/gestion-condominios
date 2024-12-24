import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const TopBar = ({ userName, role }) => {
  const navigate = useNavigate();
  const [showDocMenu, setShowDocMenu] = useState(false); // Estado para manejar el menú desplegable de Documentación
  const [showReclamosMenu, setShowReclamosMenu] = useState(false); // Estado para manejar el menú desplegable de Reclamos
  const [showCuentasMenu, setShowCuentasMenu] = useState(false); // Estado para manejar el menú desplegable de Gestión de Cuentas
  const [showUsuariosMenu, setShowUsuariosMenu] = useState(false); // Estado para manejar el menú desplegable de Gestión de Usuarios
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

        
        <span className="nav-item" onClick={() =>  {
            if (role == "administrador") navigate("/admin/gastos");
          }}>
          Gastos Comunes
        </span>

        {/* Reclamos con dropdown para el administrador */}
        <div
          className="nav-item dropdown"
          onMouseEnter={() => setShowReclamosMenu(true)}
          onMouseLeave={() => setShowReclamosMenu(false)}
        >
          Reclamos
          {showReclamosMenu && (
            <div className="dropdown-menu">
              <span onClick={() => navigate("/reclamos")}>Registrar Reclamos</span>
              {role === "administrador" && (
                <span onClick={() => navigate("/admin/reclamos")}>Gestionar Reclamos</span>
              )}
            </div>
          )}
        </div>

        {/* Gestión de cuentas (anteriormente Administración) */}
        {role === "administrador" && (
          <div
            className="nav-item dropdown"
            onMouseEnter={() => setShowCuentasMenu(true)}
            onMouseLeave={() => setShowCuentasMenu(false)}
          >
            Gestión de Cuentas
            {showCuentasMenu && (
              <div className="dropdown-menu">
                <span onClick={() => navigate("/admin/cuentas")}>Gestionar Cuentas</span>
              </div>
            )}
          </div>
        )}

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
        {role === "administrador" && (
  <div
    className="nav-item dropdown"
    onMouseEnter={() => setShowUsuariosMenu(true)}
    onMouseLeave={() => setShowUsuariosMenu(false)}
  >
    Gestión de usuarios
    {showUsuariosMenu && (
      <div className="dropdown-menu">
        <span onClick={() => navigate("/admin/editar-usuarios")}>Editar Usuarios</span>
      </div>
    )}
  </div>
)}

      </div>

      {/* Sección de Logout */}
      <div className="logout">
        <span onClick={handleLogout}>Cerrar Sesión</span>
      </div>
    </div>
  );
};

export default TopBar;

