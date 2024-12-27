import React, { useState, useEffect } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./RegistrarReclamo.css";

const RegistrarReclamo = () => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [descripcion, setDescripcion] = useState(""); // Descripción del reclamo
  const [categoria, setCategoria] = useState(""); // Categoría del reclamo
  const [archivos, setArchivos] = useState([]); // Archivos seleccionados
  const [message, setMessage] = useState(""); // Mensaje para el usuario
  const [errorPopup, setErrorPopup] = useState(false); // Controla el error en el popup
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Crear un FormData para enviar datos y archivos
      const formData = new FormData();
      formData.append("descripcion", descripcion);
      formData.append("categoria", categoria);
      archivos.forEach((archivo) => {
        formData.append("multimedia", archivo);
      });

      // Enviar el reclamo al servidor
      const response = await axios.post(
        "http://localhost:5000/api/reclamos",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Reclamo registrado exitosamente");
      setDescripcion("");
      setCategoria("");
      setArchivos([]);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error al registrar el reclamo. Inténtalo nuevamente.";
      setErrorMessage(errorMsg);
      setErrorPopup(true);
    }
  };

  if (!user) return null; // Si no hay usuario autenticado, no mostrar contenido

  return (
    <div className="reclamo-container">
      <TopBar userName={user.name} role={user.role} />

      <h2>Registrar Reclamo</h2>
      <form onSubmit={handleSubmit}>
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el problema"
          required
        />
        <label>Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Seleccione una categoría</option>
          <option value="ruidos molestos">Ruidos Molestos</option>
          <option value="estacionamiento indebido">Estacionamiento Indebido</option>
          <option value="basura">Basura</option>
          <option value="otros">Otros</option>
        </select>

        <label>Adjuntar Archivos</label>
        <input
          type="file"
          multiple
          onChange={(e) => setArchivos([...e.target.files])}
        />

        <button type="submit">Enviar</button>
        {message && <p>{message}</p>}
      </form>

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
    </div>
  );
};

export default RegistrarReclamo;
