import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TopBar from "./TopBar";
import "./ReservasPage.css";

const ReservasPage = () => {
  const [user, setUser] = useState(null);
  const [vista, setVista] = useState("reservar");
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState("");
  const [reservas, setReservas] = useState([]);
  const [reservasFuturas, setReservasFuturas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState("");
  const [restricciones, setRestricciones] = useState({ inicio: "06:00", fin: "20:00" });
  const [showPopup, setShowPopup] = useState(false);
  const [showEliminarPopup, setShowEliminarPopup] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState(null);
  const [message, setMessage] = useState("");
  const [errorPopup, setErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
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

  useEffect(() => {
    const fetchHistorial = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/reservas/historial", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    fetchHistorial();
  }, []);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReservas([...reservas, response.data.reserva]);
      setMessage("Reserva creada exitosamente.");
      setShowPopup(false);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error al crear la reserva. Inténtalo nuevamente.";
      setErrorMessage(errorMsg);
      setErrorPopup(true);
    }
  };
  const confirmarEliminarReserva = (idReserva) => {
    setReservaAEliminar(idReserva);
    setShowEliminarPopup(true);
  };
  const handleEliminarReserva = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/api/reservas/${reservaAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        // Actualiza el historial y las reservas en el frontend
        setHistorial(historial.filter((reserva) => reserva._id !== reservaAEliminar));
        setReservas(reservas.filter((reserva) => reserva._id !== reservaAEliminar));
        setShowEliminarPopup(false);
        setMessage("Reserva eliminada exitosamente.");
      }
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      setErrorMessage(
        error.response?.data?.message || "Error al eliminar la reserva. Inténtalo nuevamente."
      );
      setErrorPopup(true);
    }
  };
  

  const resaltarDiasReservados = ({ date }) => {
    const fechasReservadas = reservas.map((reserva) =>
      new Date(reserva.fecha).toISOString().split("T")[0]
    );
    const fechaCalendario = date.toISOString().split("T")[0];
    return fechasReservadas.includes(fechaCalendario) ? "dia-reservado" : null;
  };

  const generarHoras = () => {
    const [inicioHora] = restricciones.inicio.split(":").map(Number);
    const [finHora] = restricciones.fin.split(":").map(Number);

    const horas = [];
    for (let hora = inicioHora; hora < finHora; hora++) {
      horas.push(`${hora.toString().padStart(2, "0")}:00`);
    }
    return horas;
  };

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

          <h3>Reservas del Espacio Seleccionado</h3>
          <ul>
            {reservas.map((reserva) => (
              <li key={reserva._id}>
                Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                Hora Inicio: {new Date(reserva.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
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
            {historial
              .filter((reserva) => new Date(reserva.fecha) >= new Date())
              .map((reserva) => (
                <li key={reserva._id}>
                  Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                  Hora Inicio: {new Date(reserva.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  Espacio: {reserva.espacio?.nombre || "No asignado"}
                  <span className="eliminar-reserva" onClick={() => confirmarEliminarReserva(reserva._id)}>
                    Eliminar
                  </span>
                </li>
              ))}
          </ul>
          <h4>Realizadas</h4>
          <ul>
            {historial
              .filter((reserva) => new Date(reserva.fecha) < new Date())
              .map((reserva) => (
                <li key={reserva._id}>
                  Fecha: {new Date(reserva.fecha).toLocaleDateString()} - 
                  Hora Inicio: {new Date(reserva.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  Espacio: {reserva.espacio?.nombre || "No asignado"}
                </li>
              ))}
          </ul>
        </div>
      )}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirmación de Reserva</h3>
            <p>Para confirmar la reserva es necesario pagar la mitad por adelantado.</p>
            <button className="btn-continuar" onClick={handleCrearReserva}>
              Confirmar
            </button>
            <button className="btn-cancelar" onClick={() => setShowPopup(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {showEliminarPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta reserva?</p>
            <button className="btn-continuar" onClick={handleEliminarReserva}>
              Eliminar
            </button>
            <button className="btn-cancelar" onClick={() => setShowEliminarPopup(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {errorPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>¡Error!</h3>
            <p>{errorMessage}</p>
            <button className="btn-cancelar" onClick={() => setErrorPopup(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasPage;