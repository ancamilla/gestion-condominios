const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const { verificarUsuario } = require("../middlewares/auth"); // Middleware de autenticación

// Ruta para listar las reservas de un usuario
router.get("/", verificarUsuario, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario._id });
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
    res.status(201).json({ message: "Reserva creada exitosamente", reserva: nuevaReserva });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la reserva", error });
  }
});

module.exports = router;
