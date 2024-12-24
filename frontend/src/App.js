import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import ReservasPage from "./pages/ReservasPage";
import ConfigurarPagoAdmin from "./pages/ConfigurarPagoAdmin";
import HistorialPagos from "./pages/HistorialPagos";
import ConfigurarGastosComunes from "./pages/configurarGastosComunes";
import HistorialGastos from "./pages/HistorialGastos";
import DocumentacionPage from "./pages/DocumentacionPage";
import EditarDocumentacionPage from "./pages/EditarDocumentacionPage";
import RegistrarReclamo from "./pages/RegistrarReclamo"; 
import GestionarReclamos from "./pages/GestionarReclamos"; 
import GestionarCuentas from "./pages/GestionarCuentas";
import GestionarGastos from "./pages/GestionarGastos";
import EditarUsuarios from "./pages/EditarUsuarios";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página de inicio de sesión */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/admin/configurar-pagos" element={<ConfigurarPagoAdmin />} />
        <Route path="/usuario/historial-pagos" element={<HistorialPagos usuarioId="USER_ID_HERE" />} />
        <Route path="/admin/configurar-gastos" element={<ConfigurarGastosComunes />} />
        <Route path="/usuario/gastos-comunes" element={<HistorialGastos usuarioId="USER_ID_HERE" tipo="comunes" />} />
        <Route path="/usuario/adicionales" element={<HistorialGastos usuarioId="USER_ID_HERE" tipo="adicionales" />} />
        <Route path="/documentacion" element={<DocumentacionPage />} />
        <Route path="/documentacion/editar" element={<EditarDocumentacionPage />} />
        <Route path="/reclamos" element={<RegistrarReclamo />} />
        <Route path="/admin/reclamos" element={<GestionarReclamos />} />
        <Route path="/admin/cuentas" element={<GestionarCuentas />} />
        <Route path="/admin/editar-usuarios" element={<EditarUsuarios />} />
        <Route path="/admin/gastos" element={<GestionarGastos />} />
      </Routes>
    </Router>
  );
}

export default App;


