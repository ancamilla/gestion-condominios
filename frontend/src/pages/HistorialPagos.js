import React, { useEffect, useState } from "react";

function HistorialPagos({ usuarioId }) {
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const obtenerPagos = async () => {
      try {
        const respuesta = await fetch(`/api/pagos/usuario/${usuarioId}`);
        const datos = await respuesta.json();
        setPagos(datos);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
      }
    };

    obtenerPagos();
  }, [usuarioId]);

  return (
    <div>
      <h2>Historial de Pagos</h2>
      <ul>
        {pagos.map((pago) => (
          <li key={pago._id}>
            {pago.tipo}: {pago.monto} - {pago.estado} (Vence:{" "}
            {new Date(pago.fechaVencimiento).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistorialPagos;
