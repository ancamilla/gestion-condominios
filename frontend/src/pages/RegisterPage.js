import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopBar from "./TopBar"; // Importamos la TopBar
import "./RegisterPage.css"; // Archivo CSS para el diseño

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Efecto para verificar el rol del usuario
  useEffect(() => {
    const verificarRol = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/"); // Redirigir si no hay token
          return;
        }

        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.role !== "administrador") {
          navigate("/dashboard"); // Redirige si no es administrador
        } else {
          setUser(response.data); // Guarda los datos del usuario
        }
      } catch (error) {
        console.error("Error al verificar el rol del usuario:", error);
        navigate("/"); // Redirigir al login en caso de error
      }
    };

    verificarRol();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error al registrar usuario");
    }
  };

  if (!user) {
    return <div>Cargando...</div>; // Evita mostrar la página si aún no se verifica el rol
  }

  return (
    <div>
      {/* TopBar para navegación */}
      <TopBar userName={user.name} role={user.role} />

      {/* Contenido principal */}
      <div className="register-container">
        <div className="register-card">
          <h2>Registrar Usuario</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingrese su nombre"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su email"
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            <button type="submit" className="register-button">
              Registrar
            </button>
          </form>
          {message && <p className="register-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
