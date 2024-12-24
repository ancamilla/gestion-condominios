import React, { useState, useEffect } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./GestionarCuentas.css";

const GestionarCuentas = () => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [cuentas, setCuentas] = useState([]); // Lista de cuentas
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null); // Cuenta seleccionada
  const [message, setMessage] = useState(""); // Mensaje de éxito o error
  const [errorPopup, setErrorPopup] = useState(false); // Controla el popup de errores
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  // Obtener lista de cuentas
  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cuentas/admin/cuentas");
        setCuentas(response.data);
      } catch (error) {
        console.error("Error al cargar las cuentas:", error);
        setErrorMessage("Error al cargar las cuentas. Inténtalo nuevamente.");
        setErrorPopup(true);
      }
    };

    fetchCuentas();
  }, []);

  // Ver detalles de una cuenta
  const verDetallesCuenta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cuentas/admin/cuentas/${id}`);
      setCuentaSeleccionada(response.data);
    } catch (error) {
      console.error("Error al cargar los detalles de la cuenta:", error);
      setErrorMessage("Error al cargar los detalles de la cuenta.");
      setErrorPopup(true);
    }
  };

  if (!user) return null; // Si no hay usuario autenticado, no mostrar contenido

  return (
    <div className="gestionar-cuentas-container">
      <TopBar userName={user.name} role={user.role} />

      <h1>Gestionar Cuentas</h1>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((cuenta) => (
            <tr key={cuenta._id}>
              <td>{cuenta.usuarioId.name}</td>
              <td>{cuenta.usuarioId.email}</td>
              <td>
                {cuenta.gastosComunes.some((gasto) => gasto.estado === "pendiente")
                  ? "Pendiente"
                  : "Pagado"}
              </td>
              <td>
                <button onClick={() => verDetallesCuenta(cuenta._id)}>Ver Detalles</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {cuentaSeleccionada && (
        <div>
          <h2>Detalles de la Cuenta</h2>
          <ul>
            {cuentaSeleccionada.gastosComunes.map((gasto) => (
              <li key={gasto._id}>
                Monto: ${gasto.monto} - Estado: {gasto.estado} - Fecha:{" "}
                {new Date(gasto.fecha).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popup de error */}
      {errorPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>¡Error!</h3>
            <p>{errorMessage}</p>
            <button onClick={() => setErrorPopup(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default GestionarCuentas;
