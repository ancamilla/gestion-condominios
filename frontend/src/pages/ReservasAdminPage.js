import React, { useEffect, useState } from "react";
import axios from "axios";

const ReservasAdminPage = () => {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar todas las reservas
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/reservas/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservas(response.data);
      } catch (error) {
        console.error("Error al cargar las reservas:", error);
      }
    };

    fetchReservas();
  }, []);

  // Actualizar estado de la reserva
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/reservas/admin/${id}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje(response.data.message);
      setReservas(
        reservas.map((reserva) =>
          reserva._id === id ? { ...reserva, estado: nuevoEstado } : reserva
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // Eliminar reserva
  const eliminarReserva = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/reservas/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("Reserva eliminada exitosamente");
      setReservas(reservas.filter((reserva) => reserva._id !== id));
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Reservas (Administrador)</h2>
      {mensaje && <p>{mensaje}</p>}
      <table>
        <thead>
          <tr>
            <th>Espacio</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva._id}>
              <td>{reserva.espacio}</td>
              <td>{reserva.usuario?.name || "Desconocido"}</td>
              <td>{new Date(reserva.fecha).toLocaleString()}</td>
              <td>{reserva.estado}</td>
              <td>
                <button onClick={() => actualizarEstado(reserva._id, "Confirmada")}>
                  Confirmar
                </button>
                <button onClick={() => actualizarEstado(reserva._id, "Cancelada")}>
                  Cancelar
                </button>
                <button onClick={() => eliminarReserva(reserva._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservasAdminPage;
