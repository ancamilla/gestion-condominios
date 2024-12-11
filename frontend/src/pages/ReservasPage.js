import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ReservasPage.css";

const ReservasPage = () => {
  // Estados principales
  const [vista, setVista] = useState("reservar"); // Controla la vista actual: "reservar" o "historial"
  const [espacios, setEspacios] = useState([]); // Lista de espacios comunes
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(""); // Espacio actualmente seleccionado
  const [reservas, setReservas] = useState([]); // Reservas del espacio seleccionado
  const [reservasFuturas, setReservasFuturas] = useState([]); // Futuras reservas del espacio seleccionado
  const [historial, setHistorial] = useState([]); // Historial de reservas del usuario autenticado
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date()); // Fecha seleccionada en el calendario
  const [message, setMessage] = useState(""); // Mensaje informativo para el usuario
  const [horaInicio, setHoraInicio] = useState(""); // Hora de inicio seleccionada
  const [restricciones, setRestricciones] = useState({ inicio: "06:00", fin: "20:00" }); // Horarios permitidos para reservas
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del pop-up de confirmación

  // --- Funciones de Carga ---

  // Cargar espacios al iniciar
  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/espacios");
        setEspacios(response.data);
        if (response.data.length > 0) {
          setEspacioSeleccionado(response.data[0]._id); // Selecciona automáticamente el primer espacio
        }
      } catch (error) {
        console.error("Error al cargar espacios:", error);
      }
    };

    fetchEspacios();
  }, []);

  // Cargar restricciones horarias al cambiar espacio seleccionado
  useEffect(() => {
    const fetchRestricciones = async () => {
      try {
        if (espacioSeleccionado) {
          const response = await axios.get(`http://localhost:5000/api/espacios/${espacioSeleccionado}`);
          setRestricciones(response.data.restriccionesHorarias);
        }
      } catch (error) {
        console.error("Error al cargar restricciones horarias:", error);
      }
    };

    fetchRestricciones();
  }, [espacioSeleccionado]);

  // Cargar reservas del espacio seleccionado
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        if (espacioSeleccionado) {
          const response = await axios.get("http://localhost:5000/api/reservas", {
            params: { espacio: espacioSeleccionado },
          });
          setReservas(response.data); // Actualiza la lista de reservas
        }
      } catch (error) {
        console.error("Error al cargar reservas:", error);
      }
    };

    fetchReservas();
  }, [espacioSeleccionado]);

  // Cargar reservas futuras del espacio seleccionado
  useEffect(() => {
    const fetchReservasFuturas = async () => {
      try {
        if (espacioSeleccionado) {
          const response = await axios.get("http://localhost:5000/api/reservas", {
            params: { espacio: espacioSeleccionado },
          });
          setReservasFuturas(response.data);
        }
      } catch (error) {
        console.error("Error al cargar reservas futuras:", error);
      }
    };

    fetchReservasFuturas();
  }, [espacioSeleccionado]);

  // Cargar historial de reservas del usuario autenticado
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reservas/historial", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHistorial(response.data); // Actualiza el historial del usuario autenticado
      } catch (error) {
        console.error("Error al cargar el historial de reservas:", error);
      }
    };

    fetchHistorial();
  }, []);

  // --- Lógica de Negocio ---

  // Cambiar entre las vistas "Reservar" y "Historial"
  const cambiarVista = (nuevaVista) => setVista(nuevaVista);

  // Crear nueva reserva
  const handleCrearReserva = async () => {
    try {
      if (!horaInicio) {
        setMessage("Por favor, selecciona una hora de inicio.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/reservas",
        {
          espacio: espacioSeleccionado,
          fecha: `${fechaSeleccionada.toISOString().split("T")[0]}T${horaInicio}:00`,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setMessage("Reserva creada exitosamente");
      setReservasFuturas([...reservasFuturas, response.data.reserva]); // Actualizar futuras reservas
      setShowPopup(false); // Cerrar pop-up
    } catch (error) {
      setMessage("Error al crear la reserva.");
    }
  };

  // Resaltar días con reservas en el calendario
  const resaltarDiasReservados = ({ date }) => {
    const fechasReservadas = reservas.map((reserva) =>
      new Date(reserva.fecha).toISOString().split("T")[0] // Asegura el mismo formato
    );
    const fechaCalendario = date.toISOString().split("T")[0]; // Formato del calendario
    return fechasReservadas.includes(fechaCalendario) ? "dia-reservado" : null;
  };
  

  // Generar lista de horas permitidas según las restricciones
  const generarHoras = () => {
    const [inicioHora] = restricciones.inicio.split(":").map(Number);
    const [finHora] = restricciones.fin.split(":").map(Number);

    const horas = [];
    for (let hora = inicioHora; hora < finHora; hora++) {
      horas.push(`${hora.toString().padStart(2, "0")}:00`);
    }
    return horas;
  };

  // --- Renderizado ---
  return (
    <div className="reservas-container">
      <h2>Gestión de Reservas</h2>

      {/* Navegación entre pestañas */}
      <div className="nav-tabs">
        <button onClick={() => cambiarVista("reservar")} className={vista === "reservar" ? "active-tab" : ""}>
          Realizar Reserva
        </button>
        <button onClick={() => cambiarVista("historial")} className={vista === "historial" ? "active-tab" : ""}>
          Ver mi Historial
        </button>
      </div>

      {/* Vista de Reservar */}
      {vista === "reservar" && (
        <div>
          <select
            value={espacioSeleccionado}
            onChange={(e) => setEspacioSeleccionado(e.target.value)}
          >
            {espacios.map((espacio) => (
              <option key={espacio._id} value={espacio._id}>
                {espacio.nombre}
              </option>
            ))}
          </select>

          <Calendar
            onChange={(date) => setFechaSeleccionada(date)}
            value={fechaSeleccionada}
            tileClassName={resaltarDiasReservados}
          />

          <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}>
            <option value="">Seleccione una hora</option>
            {generarHoras().map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>

          <button onClick={() => setShowPopup(true)}>Solicitar reserva</button>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h3>Confirmación de Reserva</h3>
                <p>Para confirmar la reserva es necesario pagar la mitad por adelantado.</p>
                <button className="btn-continuar" onClick={handleCrearReserva}>
                  Continuar
                </button>
                <button className="btn-cancelar" onClick={() => setShowPopup(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Futuras reservas de este espacio */}
          <h3>Futuras reservas de este espacio</h3>
          <ul>
            {reservasFuturas.map((reserva) => (
              <li key={reserva._id}>
                Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                Hora: {new Date(reserva.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
                Usuario: {reserva.usuario?.name || "Sin usuario"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vista de Historial */}
{vista === "historial" && (
  <div>
    <h3>Historial de Reservas</h3>
    <h4>Pendientes</h4>
    <ul>
      {historial.filter(reserva => new Date(reserva.fecha) >= new Date()).map((reserva) => (
        <li key={reserva._id}>
          Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
          Espacio: {reserva.espacio?.nombre || "Espacio no asignado"}
        </li>
      ))}
    </ul>
    <h4>Realizadas</h4>
    <ul>
      {historial.filter(reserva => new Date(reserva.fecha) < new Date()).map((reserva) => (
        <li key={reserva._id}>
          Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
          Espacio: {reserva.espacio?.nombre || "Espacio no asignado"}
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
};

export default ReservasPage;
