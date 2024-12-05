import React, { useState } from "react";
import axios from "axios";
import "./RegisterPage.css"; // Archivo CSS para diseño (puedes usar el estilo de LoginPage como base)

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
      setMessage(error.response.data.message || "Error al registrar usuario");
    }
  };

  return (
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
  );
};

export default RegisterPage;
