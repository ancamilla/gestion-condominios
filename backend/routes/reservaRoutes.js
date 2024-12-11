const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const { verificarUsuario } = require("../middlewares/auth"); // Middleware de autenticación

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

    const nuevaReserva = new Reserva({
      espacio,
      usuario: req.usuario._id, // Usuario autenticado
      fecha,
    });

    await nuevaReserva.save();

    // Poblar el usuario antes de devolver la respuesta
    const reservaConUsuario = await Reserva.findById(nuevaReserva._id).populate("usuario", "name");
    res.status(201).json({ message: "Reserva creada exitosamente", reserva: reservaConUsuario });
  } catch (error) {
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

module.exports = router;
