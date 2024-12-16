import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservasPage from "./pages/ReservasPage";
import ConfigurarPagoAdmin from "./pages/ConfigurarPagoAdmin";
import HistorialPagos from "./pages/HistorialPagos";
import ConfigurarGastosComunes from "./pages/configurarGastosComunes";
import HistorialGastos from "./pages/HistorialGastos";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página de inicio de sesión */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/admin/configurar-pagos" element={<ConfigurarPagoAdmin />} />
        <Route path="/usuario/historial-pagos" element={<HistorialPagos usuarioId="USER_ID_HERE" />} />
        <Route path="/admin/configurar-gastos" element={<ConfigurarGastosComunes />} />
        <Route path="/usuario/gastos-comunes" element={<HistorialGastos usuarioId="USER_ID_HERE" tipo="comunes" />} />
        <Route path="/usuario/adicionales" element={<HistorialGastos usuarioId="USER_ID_HERE" tipo="adicionales" />} />
      </Routes>
    </Router>
  );
}

export default App;

