import React, { useState, useEffect } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./GestionarCuentas.css";

const GestionarCuentas = () => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [cuentas, setCuentas] = useState([]); // Lista de cuentas
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null); // Cuenta seleccionada
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup
  const [message, setMessage] = useState(""); // Mensaje de éxito o error
  const [errorPopup, setErrorPopup] = useState(false); // Controla el popup de errores
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
  const [nuevoMonto, setNuevoMonto] = useState(""); // Estado para el monto del nuevo gasto
  const [nuevaFecha, setNuevaFecha] = useState(""); // Estado para la fecha del nuevo gasto


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
        const response = await axios.get("http://localhost:5000/api/cuentas");
        // Ordenar las cuentas por address localmente en el frontend
        const cuentasOrdenadas = response.data.sort((a, b) =>
          a.usuarioId.address.localeCompare(b.usuarioId.address)
        );
        setCuentas(cuentasOrdenadas);
      } catch (error) {
        console.error("Error al cargar las cuentas:", error);
      }
    };
  
    fetchCuentas();
  }, []);
  
  // Ver detalles de una cuenta
  const verDetallesCuenta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cuentas/admin/cuentas/${id}`);
      setCuentaSeleccionada(response.data);
      setShowPopup(true); // Mostrar popup con detalles
    } catch (error) {
      console.error("Error al cargar los detalles de la cuenta:", error);
      setErrorMessage("Error al cargar los detalles de la cuenta.");
      setErrorPopup(true);
    }
  };

  const handleAgregarGasto = async (usuarioId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/cuentas/${usuarioId}/gastos-comunes`,
        {
          monto: nuevoMonto,
          fecha: nuevaFecha,
          estado: "pendiente", // Estado inicial del gasto
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Actualizar la cuenta seleccionada en el frontend
      setCuentaSeleccionada((prev) => ({
        ...prev,
        gastosComunes: [...prev.gastosComunes, response.data.cuenta.gastosComunes.slice(-1)[0]],
      }));
  
      setMessage("Gasto común agregado exitosamente.");
      setNuevoMonto("");
      setNuevaFecha("");
    } catch (error) {
      console.error("Error al agregar gasto común:", error);
      setErrorMessage("Error al agregar gasto común. Inténtalo nuevamente.");
      setErrorPopup(true);
    }
  };
  
  const handleActualizarEstadoAdicional = async (usuarioId, adicionalId, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/cuentas/${usuarioId}/adicionales/${adicionalId}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCuentaSeleccionada((prev) => ({
        ...prev,
        adicionales: prev.adicionales.map((adicional) =>
          adicional._id === adicionalId
            ? { ...adicional, estado: nuevoEstado }
            : adicional
        ),
      }));
      setMessage("Estado del adicional actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar el estado del adicional:", error);
      setErrorMessage("Error al actualizar el estado del adicional. Inténtalo nuevamente.");
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

      {/* Popup para mostrar detalles de la cuenta */}
      {showPopup && cuentaSeleccionada && (
  <div className="popup-overlay">
    <div className="popup">
      <h2>Detalles de la Cuenta</h2>
      <div className="popup-info">
        <p><strong>Residente:</strong> {cuentaSeleccionada.usuarioId.name}</p>
        <p><strong>Email:</strong> {cuentaSeleccionada.usuarioId.email}</p>
        <p><strong>Domicilio:</strong> {cuentaSeleccionada.usuarioId.address}</p>
      </div>
      <h3>Gastos Comunes</h3>
      <table>
        <thead>
          <tr>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cuentaSeleccionada.gastosComunes.map((gasto) => (
            <tr key={gasto._id}>
              <td>${gasto.monto}</td>
              <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
              <td>{gasto.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para agregar un gasto común */}
      <h3>Agregar Gasto Común</h3>
      <div className="form-agregar-gasto">
        <label>Monto:</label>
        <input
          type="number"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
        />
        <label>Fecha:</label>
        <input
          type="date"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
        />
        <button onClick={() => handleAgregarGasto(cuentaSeleccionada.usuarioId._id)}>
          Agregar Gasto
        </button>
      </div>

      <h3>Adicionales</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentaSeleccionada.adicionales.map((adicional) => (
              <tr key={adicional._id}>
                <td>{adicional.tipo}</td>
                <td>${adicional.monto}</td>
                <td>{adicional.descripcion}</td>
                <td>{adicional.estado}</td>
                <td>
                  <select
                    onChange={(e) =>
                      handleActualizarEstadoAdicional(
                        cuentaSeleccionada.usuarioId._id,
                        adicional._id,
                        e.target.value
                      )
                    }
                    value={adicional.estado}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setShowPopup(false)}>Cerrar</button>
    </div>
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

