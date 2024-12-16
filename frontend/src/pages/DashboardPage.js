import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import "./Dashboard.css";

const DashboardPage = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/"); // Redirigir a login si no hay token
          return;
        }

        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("Error al cargar la información del usuario.");
        navigate("/"); // Redirigir a login en caso de error
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
        <TopBar userName={user.name} role={user.role} />
      <h1>¡Bienvenido, {user.name}!</h1>
      <p>Tu rol: {user.role}</p>
      <p>Selecciona una funcionalidad del sistema desde la barra de navegación.</p>
    </div>
  );
};

export default DashboardPage;
