import React, { useState } from "react";

function ConfigurarGastosComunes() {
  const [monto, setMonto] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const manejarConfiguracion = async () => {
    try {
      const respuesta = await fetch("/api/cuentas/admin/configurar-gastos-comunes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto, fechaVencimiento }),
      });

      const datos = await respuesta.json();
      alert(datos.mensaje);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al configurar los gastos comunes");
    }
  };

  return (
    <div>
      <h2>Configurar Gastos Comunes</h2>
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
      <button onClick={manejarConfiguracion}>Configurar</button>
    </div>
  );
}

export default ConfigurarGastosComunes;
