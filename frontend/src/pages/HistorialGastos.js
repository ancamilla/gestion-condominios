import React, { useEffect, useState } from "react";

function HistorialGastos({ usuarioId, tipo }) {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const obtenerGastos = async () => {
      const ruta = tipo === "comunes"
        ? `/api/cuentas/usuario/gastos-comunes/${usuarioId}`
        : `/api/cuentas/usuario/adicionales/${usuarioId}`;
      try {
        const respuesta = await fetch(ruta);
        const datos = await respuesta.json();
        setGastos(datos);
      } catch (error) {
        console.error("Error al obtener los gastos:", error);
      }
    };

    obtenerGastos();
  }, [usuarioId, tipo]);

  return (
    <div>
      <h2>Historial de {tipo === "comunes" ? "Gastos Comunes" : "Adicionales"}</h2>
      <ul>
        {gastos.map((gasto, index) => (
          <li key={index}>
            {tipo === "comunes" ? `Monto: ${gasto.monto}` : `Tipo: ${gasto.tipo}, Monto: ${gasto.monto}`}
            - Estado: {gasto.estado} - Fecha: {new Date(gasto.fecha).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistorialGastos;
