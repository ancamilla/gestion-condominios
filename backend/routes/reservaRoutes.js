const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const { verificarUsuario, verificarRol } = require("../middlewares/auth"); // Middleware de autenticación

// Ruta para obtener todas las reservas (solo para administradores)
router.get("/admin", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const reservas = await Reserva.find()
      .populate("usuario", "name")
      .populate("espacio", "nombre") // Poblar el nombre del espacio
      .sort({ fecha: 1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todas las reservas", error });
  }
});

// Ruta para actualizar el estado de una reserva (solo administradores)
router.put("/admin/:id", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).populate("usuario", "name");

    if (!reservaActualizada) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ message: "Estado de la reserva actualizado", reserva: reservaActualizada });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la reserva", error });
  }
});

// Ruta para eliminar una reserva (solo administradores)
router.delete("/admin/:id", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const { id } = req.params;

    const reservaEliminada = await Reserva.findByIdAndDelete(id);

    if (!reservaEliminada) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ message: "Reserva eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reserva", error });
  }
});

// Ruta para listar reservas de un espacio seleccionado
router.get("/", async (req, res) => {
  try {
    const { espacio } = req.query;

    if (!espacio) {
      return res.status(400).json({ message: "Se requiere el ID del espacio" });
    }

    // Filtrar reservas por espacio y poblar el usuario que las realizó
    const reservas = await Reserva.find({ espacio, fecha: { $gte: new Date() } }) // Solo reservas futuras
      .sort({ fecha: 1 }) // Ordenar por fecha ascendente
      .populate("usuario", "name");

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error });
  }
});

// Ruta para crear una reserva
router.post("/", verificarUsuario, async (req, res) => {
  try {
    const { espacio, fecha } = req.body;

    if (!espacio || !fecha) {
      return res.status(400).json({ message: "Espacio y fecha son obligatorios" });
    }

    // Convertir la fecha de inicio
    const fechaInicio = new Date(fecha);

    // Crear rangos de 8 horas antes y después de la fecha de inicio
    const fechaInicioRango = new Date(fechaInicio);
    fechaInicioRango.setHours(fechaInicio.getHours() - 8); // 8 horas antes

    const fechaFinRango = new Date(fechaInicio);
    fechaFinRango.setHours(fechaInicio.getHours() + 8); // 8 horas después

    // Buscar solapamientos de reservas
    const reservaExistente = await Reserva.findOne({
      espacio,
      fecha: { $gte: fechaInicioRango, $lt: fechaFinRango },
    });

    if (reservaExistente) {
      return res.status(400).json({
        message:
          "No es posible realizar la reserva porque se solapa con otra reserva existente.",
      });
    }

    // Crear la nueva reserva
    const nuevaReserva = new Reserva({
      espacio,
      usuario: req.usuario._id,
      fecha: fechaInicio,
    });

    await nuevaReserva.save();
    res.status(201).json({ message: "Reserva creada exitosamente", reserva: nuevaReserva });
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ message: "Error al crear la reserva", error });
  }
});





// Ruta para obtener el historial de reservas del usuario autenticado
router.get("/historial", verificarUsuario, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario._id })
      .sort({ fecha: 1 }) // Ordenar por fecha ascendente
      .populate("espacio", "nombre"); // Poblar el nombre del espacio

    // Log de reservas con espacios faltantes
    const reservasSinEspacio = reservas.filter((reserva) => !reserva.espacio);
    if (reservasSinEspacio.length > 0) {
      console.log("Reservas con espacio faltante:", reservasSinEspacio);
    }

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial de reservas", error });
  }
});
// Ruta para eliminar una reserva
router.delete("/:id", verificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const reservaEliminada = await Reserva.findByIdAndDelete(id);

    if (!reservaEliminada) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ message: "Reserva eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reserva", error });
  }
});

module.exports = router;
