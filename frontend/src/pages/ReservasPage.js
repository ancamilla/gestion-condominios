import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TopBar from "./TopBar";
import "./ReservasPage.css";

const ReservasPage = () => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [vista, setVista] = useState("reservar"); // Controla la vista actual: "reservar" o "historial"
  const [espacios, setEspacios] = useState([]); // Lista de espacios comunes
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(""); // Espacio actualmente seleccionado
  const [reservas, setReservas] = useState([]); // Reservas del espacio seleccionado
  const [reservasFuturas, setReservasFuturas] = useState([]); // Futuras reservas del espacio seleccionado
  const [historial, setHistorial] = useState([]); // Historial de reservas del usuario autenticado
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date()); // Fecha seleccionada en el calendario
  const [restricciones, setRestricciones] = useState({ inicio: "06:00", fin: "20:00" }); // Horarios permitidos para reservas
  const [horaInicio, setHoraInicio] = useState(""); // Hora de inicio seleccionada
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del pop-up de confirmación
  const [message, setMessage] = useState(""); // Mensaje informativo para el usuario

  // Cargar usuario y espacios en paralelo
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");

      try {
        // Peticiones en paralelo
        const [userResponse, espaciosResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/espacios"),
        ]);

        setUser(userResponse.data);
        setEspacios(espaciosResponse.data);

        if (espaciosResponse.data.length > 0) {
          setEspacioSeleccionado(espaciosResponse.data[0]._id);
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Cargar restricciones y reservas del espacio seleccionado
  useEffect(() => {
    const fetchEspacioData = async () => {
      if (!espacioSeleccionado) return;

      try {
        const [restriccionesResponse, reservasResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/espacios/${espacioSeleccionado}`),
          axios.get("http://localhost:5000/api/reservas", {
            params: { espacio: espacioSeleccionado },
          }),
        ]);

        setRestricciones(restriccionesResponse.data.restriccionesHorarias);
        setReservas(reservasResponse.data);
      } catch (error) {
        console.error("Error al cargar datos del espacio:", error);
      }
    };

    fetchEspacioData();
  }, [espacioSeleccionado]);

  // Cargar historial de reservas del usuario autenticado
  useEffect(() => {
    const fetchHistorial = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/reservas/historial", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al cargar el historial de reservas:", error);
      }
    };

    fetchHistorial();
  }, []);

  // Crear nueva reserva
  const handleCrearReserva = async () => {
    try {
      if (!horaInicio) {
        setMessage("Por favor, selecciona una hora de inicio.");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/reservas",
        {
          espacio: espacioSeleccionado,
          fecha: `${fechaSeleccionada.toISOString().split("T")[0]}T${horaInicio}:00`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      new Date(reserva.fecha).toISOString().split("T")[0]
    );
    const fechaCalendario = date.toISOString().split("T")[0];
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

  // Renderizado condicional basado en usuario
  if (!user) return null;

  return (
    <div className="reservas-container">
      <TopBar userName={user.name} role={user.role} />

      <h2>Gestión de Reservas</h2>

      <div className="nav-tabs">
        <button onClick={() => setVista("reservar")} className={vista === "reservar" ? "active-tab" : ""}>
          Realizar Reserva
        </button>
        <button onClick={() => setVista("historial")} className={vista === "historial" ? "active-tab" : ""}>
          Ver mi Historial
        </button>
      </div>

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

          <h3>Reservas del Espacio Seleccionado</h3>
          <ul>
            {reservas.map((reserva) => (
              <li key={reserva._id}>
                Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                Hora: {new Date(reserva.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
                Usuario: {reserva.usuario?.name || "Sin usuario"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {vista === "historial" && (
        <div>
          <h3>Historial de Reservas</h3>
          <h4>Pendientes</h4>
          <ul>
            {historial.filter((reserva) => new Date(reserva.fecha) >= new Date()).map((reserva) => (
              <li key={reserva._id}>
                Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                Espacio: {reserva.espacio?.nombre || "No asignado"}
              </li>
            ))}
          </ul>
          <h4>Realizadas</h4>
          <ul>
            {historial.filter((reserva) => new Date(reserva.fecha) < new Date()).map((reserva) => (
              <li key={reserva._id}>
                Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                Espacio: {reserva.espacio?.nombre || "No asignado"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReservasPage;
