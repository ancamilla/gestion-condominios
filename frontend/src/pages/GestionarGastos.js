import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GestionarGastos.css";
import TopBar from "./TopBar";

const GestionarGastos = () => {
  const [residentes, setResidentes] = useState([]); // Lista de residentes
  const [monto, setMonto] = useState(""); // Monto de los gastos comunes
  const [diaCobro, setDiaCobro] = useState(""); // Día del mes para el cobro
  const [selectedCuenta, setSelectedCuenta] = useState(null); // Cuenta seleccionada
  const [estadoGasto, setEstadoGasto] = useState(""); // Estado del gasto
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup
  const [gastoId, setGastoId] = useState(null); // ID del gasto seleccionado
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [resultsPerPage] = useState(10); // Resultados por página
  const [user, setUser] = useState(null); // Datos del usuario autenticado

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    };

    fetchUser();
  }, []);

  // Cargar residentes y configuración inicial
  useEffect(() => {
    const fetchResidentes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cuentas/admin/cuentas", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        // Ordenar residentes por dirección (domicilio) en el frontend
        const residentesOrdenados = response.data.sort((a, b) =>
          a.usuarioId.address.localeCompare(b.usuarioId.address)
        );
  
        setResidentes(residentesOrdenados);
      } catch (error) {
        console.error("Error al cargar residentes:", error);
      }
    };
  
    const fetchConfiguracion = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/cuentas/admin/configuracion-gastos-comunes",
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setMonto(response.data.monto);
        setDiaCobro(response.data.diaCobro);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
  
    fetchResidentes();
    fetchConfiguracion();
  }, []);
  

  // Paginación: calcular resultados visibles
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResidentes = residentes.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(residentes.length / resultsPerPage);

  // Cambiar página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Seleccionar cuenta para ver detalles
  const handleSelectCuenta = (cuenta) => {
    setSelectedCuenta(cuenta);
    setShowPopup(true);
  };

  // Actualizar estado del gasto común
  const handleActualizarGasto = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/cuentas/admin/cuentas/${selectedCuenta._id}/gastos/${gastoId}`,
        { estado: estadoGasto },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Estado del gasto actualizado.");
      setShowPopup(false);
      window.location.reload(); // Recargar la página
    } catch (error) {
      console.error("Error al actualizar el estado del gasto:", error);
      alert("Error al actualizar el estado del gasto.");
    }
  };

  // Guardar configuración de gastos comunes
  const handleGuardarConfiguracion = async () => {
    try {
      await axios.get(
        "http://localhost:5000/api/cuentas/admin/configuracion-gastos-comunes",
        { monto, diaCobro },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Configuración de gastos comunes actualizada.");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar configuración.");
    }
  };

  if (!user) return null; // No renderizar nada hasta que los datos del usuario estén cargados

  return (
    <div className="gestionar-gastos-container">
      <TopBar userName={user.name} role={user.role} />

      <h1>Gestionar Gastos Comunes</h1>

      {/* Configuración de gastos comunes */}
      <div className="configuracion">
        <h2>Configuración</h2>
        <label>Monto:</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <label>Día de Cobro:</label>
        <input
          type="number"
          value={diaCobro}
          onChange={(e) => setDiaCobro(e.target.value)}
        />
        <button onClick={handleGuardarConfiguracion}>Guardar Configuración</button>
      </div>

      {/* Listado de residentes */}
      <div className="residentes">
        <h2>Residentes</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentResidentes.map((residente) => (
              <tr key={residente._id}>
                <td>{residente.usuarioId.name}</td>
                <td>{residente.usuarioId.email}</td>
                <td>{residente.usuarioId.address || "No disponible"}</td>
                <td>
                  {residente.gastosComunes.some((g) => g.estado === "pendiente")
                    ? "Pendiente"
                    : "Pagado"}
                </td>
                <td>
                  <button onClick={() => handleSelectCuenta(residente)}>Ver Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={index + 1 === currentPage ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Popup para editar estado del gasto */}
{showPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <h2>Detalles de la Cuenta</h2>
      <div className="popup-info">
        <p><strong>Residente:</strong> {selectedCuenta.usuarioId.name}</p>
        <p><strong>Email:</strong> {selectedCuenta.usuarioId.email}</p>
        <p><strong>Dirección:</strong> {selectedCuenta.usuarioId.address}</p>
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
          {selectedCuenta.gastosComunes.map((gasto) => (
            <tr key={gasto._id}>
              <td>{gasto.monto}</td>
              <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
              <td>{gasto.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Actualizar Estado</h3>
      {/* Select para seleccionar un gasto */}
      <select
        onChange={(e) => {
          console.log("Gasto ID seleccionado:", e.target.value);
          setGastoId(e.target.value);
        }}
        value={gastoId}
      >
        <option value="">Selecciona un gasto</option>
        {selectedCuenta.gastosComunes.map((gasto) => (
          <option key={gasto._id} value={gasto._id}>
            {gasto.monto} - {gasto.estado}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => setEstadoGasto(e.target.value)}
        value={estadoGasto}
      >
        <option value="">Selecciona estado</option>
        <option value="pendiente">Pendiente</option>
        <option value="pagado">Pagado</option>
      </select>
      <button onClick={handleActualizarGasto}>Guardar Cambios</button>
      <button onClick={() => setShowPopup(false)}>Cancelar</button>
    </div>
  </div>
)}

    </div>
  );
};

export default GestionarGastos;
