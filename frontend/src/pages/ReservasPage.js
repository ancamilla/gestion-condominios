import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReservasPage.css";

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [espacio, setEspacio] = useState("");
  const [fecha, setFecha] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reservas", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReservas(response.data);
      } catch (error) {
        console.error("Error al obtener reservas", error);
      }
    };
    fetchReservas();
  }, []);

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reservas",
        { espacio, fecha },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(response.data.message);
      setReservas([...reservas, response.data.reserva]);
    } catch (error) {
      setMessage("Error al crear la reserva");
    }
  };

  return (
    <div className="reservas-container">
      <h2>Reservar Espacios Comunes</h2>
      <form onSubmit={handleCrearReserva}>
        <div>
          <label>Espacio:</label>
          <input
            type="text"
            value={espacio}
            onChange={(e) => setEspacio(e.target.value)}
            placeholder="Ejemplo: Piscina"
            required
          />
        </div>
        <div>
          <label>Fecha:</label>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear Reserva</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Mis Reservas</h3>
      <ul>
        {reservas.map((reserva) => (
          <li key={reserva._id}>
            {reserva.espacio} - {new Date(reserva.fecha).toLocaleString()} - {reserva.estado}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservasPage;
