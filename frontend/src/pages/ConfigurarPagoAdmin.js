import React, { useState } from "react";

function ConfigurarPagoAdmin() {
  const [usuarioId, setUsuarioId] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const manejarConfiguracion = async () => {
    try {
      const respuesta = await fetch("/api/pagos/admin/configurar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, monto, fechaVencimiento }),
      });

      const datos = await respuesta.json();
      alert(datos.mensaje);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al configurar el pago");
    }
  };

  return (
    <div>
      <h2>Configurar Pagos</h2>
      <input
        type="text"
        placeholder="ID del Usuario"
        value={usuarioId}
        onChange={(e) => setUsuarioId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      <input
        type="date"
        value={fechaVencimiento}
        onChange={(e) => setFechaVencimiento(e.target.value)}
      />
      <button onClick={manejarConfiguracion}>Configurar Pago</button>
    </div>
  );
}

export default ConfigurarPagoAdmin;
