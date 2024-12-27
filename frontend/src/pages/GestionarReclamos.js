import React, { useState, useEffect } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./GestionarReclamos.css";

const GestionarReclamos = () => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [reclamos, setReclamos] = useState([]); // Reclamos cargados
  const [errorPopup, setErrorPopup] = useState(false); // Controla el popup de errores
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
  const [message, setMessage] = useState(""); // Mensaje para el usuario

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

  // Obtener reclamos desde el servidor
  useEffect(() => {
    const fetchReclamos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5000/api/reclamos/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReclamos(response.data);
      } catch (error) {
        console.error("Error al cargar los reclamos:", error);
        setErrorMessage("Error al cargar los reclamos. Inténtalo nuevamente.");
        setErrorPopup(true);
      }
    };

    fetchReclamos();
  }, []);

  // Actualizar el estado del reclamo
  const actualizarReclamo = async (id, estado) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/reclamos/admin/${id}`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReclamos((prevReclamos) =>
        prevReclamos.map((reclamo) =>
          reclamo._id === id ? { ...reclamo, estado: response.data.reclamo.estado } : reclamo
        )
      );
      setMessage("Estado del reclamo actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar el reclamo:", error);
      setErrorMessage("Error al actualizar el reclamo. Inténtalo nuevamente.");
      setErrorPopup(true);
    }
  };

  if (!user) return null; // Si no hay usuario autenticado, no mostrar contenido

  return (
    <div className="gestionar-reclamos-container">
      <TopBar userName={user.name} role={user.role} />

      <h1>Gestionar Reclamos</h1>
      <ul>
        {reclamos.map((reclamo) => (
          <li key={reclamo._id}>
            <div className="reclamo-info">
              <p><strong>Descripción:</strong> {reclamo.descripcion}</p>
              <p><strong>Estado:</strong> {reclamo.estado}</p>
              <p><strong>Categoría:</strong> {reclamo.categoria}</p>
              <p><strong>Fecha:</strong> {new Date(reclamo.fecha).toLocaleDateString()}</p>

              {reclamo.multimedia && reclamo.multimedia.length > 0 && (
                <div>
                  <strong>Archivos adjuntos:</strong>
                  <ul>
                    {reclamo.multimedia.map((archivo, index) => (
                      <li key={index}>
                        <a
                          href={`http://localhost:5000${archivo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver archivo {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="reclamo-actions">
              {reclamo.estado === "pendiente" && (
                <>
                  <button
                    className="btn btn-aprobar"
                    onClick={() => actualizarReclamo(reclamo._id, "aprobado")}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn btn-rechazar"
                    onClick={() => actualizarReclamo(reclamo._id, "rechazado")}
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Popup de error */}
      {errorPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>¡Error!</h3>
            <p>{errorMessage}</p>
            <button
              className="btn-cancelar"
              onClick={() => setErrorPopup(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default GestionarReclamos;

