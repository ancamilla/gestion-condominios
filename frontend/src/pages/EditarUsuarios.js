import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditarUsuarios.css";
import TopBar from "./TopBar";

const EditarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para editar
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [user, setUser] = useState(null); // Usuario autenticado
  const [message, setMessage] = useState(""); // Mensaje de éxito o error
  const [showPopup, setShowPopup] = useState(false); // Controla la visibilidad del popup

  // Obtener datos del usuario autenticado al cargar la página
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al cargar los datos del usuario autenticado:", error);
      }
    };

    fetchUserData();
  }, []);

  // Obtener usuarios al cargar la página
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  // Manejar selección de usuario para editar
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      address: user.address,
    });
    setShowPopup(true); // Mostrar el popup
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const { name, email, address } = formData;
    if (!name || !email || !address) {
      setMessage("Por favor, complete todos los campos.");
      return false;
    }
    return true;
  };

  // Enviar cambios al servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("Usuario actualizado exitosamente.");
      setUsuarios((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...formData } : user
        )
      );
      setShowPopup(false); // Ocultar el popup
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setMessage("Error al actualizar el usuario.");
    }
  };

  if (!user) return null; // Si no hay usuario autenticado, no renderizar nada

  return (
    <div className="editar-usuarios-container">
      <TopBar userName={user.name} role={user.role} /> {/* Ahora user está definido */}

      <h1>Editar Usuarios</h1>
      <div className="usuarios-list">
        <h2>Lista de Usuarios</h2>
        <ul>
          {usuarios.map((user) => (
            <li key={user._id} onClick={() => handleSelectUser(user)}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <label>Correo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <div className="form-actions">
                <button type="submit">Guardar Cambios</button>
                <button
                  type="button"
                  className="cancelar-btn"
                  onClick={() => setShowPopup(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarUsuarios;
