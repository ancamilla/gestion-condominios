import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservasPage from "./pages/ReservasPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página de inicio de sesión */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
      </Routes>
    </Router>
  );
}

export default App;

