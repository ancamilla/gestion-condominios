import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserGastosPage.css";
import TopBar from "./TopBar";

const UserGastosPage = () => {
  const [user, setUser] = useState(null); // Datos del usuario autenticado
  const [gastos, setGastos] = useState([]); // Lista de gastos comunes
  const [otrosGastos, setOtrosGastos] = useState([]); // Lista de otros gastos pendientes
  const [filter, setFilter] = useState("todos"); // Filtro para mostrar gastos
  const [message, setMessage] = useState(""); // Mensaje de confirmación o error
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null); // Gasto seleccionado para pagar

  // Obtener datos del usuario autenticado y sus gastos
  useEffect(() => {
    const fetchUserAndGastos = async () => {
      try {
        const token = localStorage.getItem("token");
        const [userResponse, gastosResponse, otrosGastosResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/cuentas/usuario/gastos-comunes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/cuentas/usuario/adicionales", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setGastos(gastosResponse.data);
        setOtrosGastos(otrosGastosResponse.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchUserAndGastos();
  }, []);

  // Manejar el pago de un gasto
  const handlePago = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        gastoSeleccionado.tipo === "gasto_comun"
          ? `http://localhost:5000/api/cuentas/usuario/gastos-comunes/${gastoSeleccionado._id}`
          : `http://localhost:5000/api/cuentas/usuario/adicionales/${gastoSeleccionado._id}`;

      await axios.put(
        endpoint,
        { estado: "pagado" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar el estado de los gastos en la interfaz
      if (gastoSeleccionado.tipo === "gasto_comun") {
        setGastos((prevGastos) =>
          prevGastos.map((gasto) =>
            gasto._id === gastoSeleccionado._id ? { ...gasto, estado: "pagado" } : gasto
          )
        );
      } else {
        setOtrosGastos((prevOtrosGastos) =>
          prevOtrosGastos.map((gasto) =>
            gasto._id === gastoSeleccionado._id ? { ...gasto, estado: "pagado" } : gasto
          )
        );
      }

      setMessage("Pago realizado con éxito.");
      setShowPopup(false);
    } catch (error) {
      console.error("Error al realizar el pago:", error);
      setMessage("Error al realizar el pago. Inténtalo nuevamente.");
    }
  };

  // Verificar deudas pendientes en otros conceptos antes de pagar un gasto común
  const verificarDeudasAntesDePago = (gasto) => {
    const deudasPendientes = otrosGastos.filter((g) => g.estado === "pendiente");
    if (deudasPendientes.length > 0) {
      setMessage(
        "No puedes pagar un gasto común mientras existan deudas pendientes por otros conceptos. Por favor, salda estas deudas primero."
      );
    } else {
      setGastoSeleccionado({ ...gasto, tipo: "gasto_comun" });
      setShowPopup(true);
    }
  };

  // Filtrar los gastos según el estado
  const filteredGastos = gastos.filter((gasto) => {
    if (filter === "pendientes") return gasto.estado === "pendiente";
    if (filter === "pagados") return gasto.estado === "pagado";
    return true;
  });

  if (!user) return null; // No mostrar contenido hasta que se carguen los datos

  return (
    <div className="user-gastos-container">
      <TopBar userName={user.name} role={user.role} />
      <h2>Gestión de Gastos Comunes</h2>
      {message && <p className="message">{message}</p>}

      {/* Filtro */}
      <div className="filter-section">
        <button
          className={filter === "todos" ? "active" : ""}
          onClick={() => setFilter("todos")}
        >
          Todos
        </button>
        <button
          className={filter === "pendientes" ? "active" : ""}
          onClick={() => setFilter("pendientes")}
        >
          Pendientes
        </button>
        <button
          className={filter === "pagados" ? "active" : ""}
          onClick={() => setFilter("pagados")}
        >
          Pagados
        </button>
      </div>

      {/* Tabla de gastos comunes */}
      <table className="gastos-table">
        <thead>
          <tr>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha de Vencimiento</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredGastos.map((gasto) => (
            <tr key={gasto._id}>
              <td>${gasto.monto}</td>
              <td className={gasto.estado === "pendiente" ? "pendiente" : "pagado"}>
                {gasto.estado}
              </td>
              <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
              <td>{gasto.descripcion || "No disponible"}</td>
              <td>
                {gasto.estado === "pendiente" && (
                  <button
                    onClick={() => verificarDeudasAntesDePago(gasto)}
                  >
                    Pagar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla de otros gastos */}
      <h3>Otros Gastos Pendientes</h3>
      <table className="gastos-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {otrosGastos
            .filter((gasto) => gasto.estado === "pendiente")
            .map((gasto) => (
              <tr key={gasto._id}>
                <td>{gasto.tipo}</td>
                <td>${gasto.monto}</td>
                <td className="pendiente">{gasto.estado}</td>
                <td>{gasto.descripcion || "No disponible"}</td>
                <td>
                  <button
                    onClick={() => {
                      setGastoSeleccionado({ ...gasto, tipo: "adicional" });
                      setShowPopup(true);
                    }}
                  >
                    Pagar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Popup de confirmación */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirmar Pago</h3>
            <p>
              ¿Estás seguro de que deseas pagar el monto de ${gastoSeleccionado.monto}?
            </p>
            <button className="btn-confirm" onClick={handlePago}>
              Confirmar
            </button>
            <button className="btn-cancel" onClick={() => setShowPopup(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGastosPage;
