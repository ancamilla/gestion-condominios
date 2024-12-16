const express = require("express");
const router = express.Router();
const Pago = require("../models/Pago");
const User = require("../models/User");

// Crear o actualizar pago recurrente
router.post("/admin/configurar-pago", async (req, res) => {
  try {
    const { usuarioId, monto, fechaVencimiento } = req.body;

    let pago = await Pago.findOne({ usuarioId, estado: "pendiente" });
    if (pago) {
      pago.monto = monto;
      pago.fechaVencimiento = new Date(fechaVencimiento);
    } else {
      pago = new Pago({ usuarioId, monto, fechaVencimiento });
    }

    await pago.save();
    res.status(200).json({ mensaje: "Pago configurado correctamente", pago });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al configurar el pago", error });
  }
});

// Obtener todos los pagos de un usuario
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const pagos = await Pago.find({ usuarioId });
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pagos", error });
  }
});

// Realizar un pago
router.post("/usuario/pagar", async (req, res) => {
  try {
    const { pagoId } = req.body;
    const pago = await Pago.findById(pagoId);

    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    if (pago.estado === "pagado") {
      return res.status(400).json({ mensaje: "El pago ya ha sido realizado" });
    }

    pago.estado = "pagado";
    await pago.save();

    res.status(200).json({ mensaje: "Pago realizado con éxito", pago });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al realizar el pago", error });
  }
});

module.exports = router;
