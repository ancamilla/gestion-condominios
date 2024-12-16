const express = require("express");
const router = express.Router();
const Cuenta = require("../models/Cuenta"); // Modelo de Cuenta
const User = require("../models/User");    // Modelo de Usuario

// Endpoint para configurar gastos comunes
router.post("/admin/configurar-gastos-comunes", async (req, res) => {
  try {
    const { monto, fechaVencimiento } = req.body;
    const fecha = new Date(fechaVencimiento);

    // Paso 1: Obtener todos los usuarios
    const usuarios = await User.find();

    // Paso 2: Crear cuentas si no existen
    await Promise.all(
      usuarios.map(async (usuario) => {
        let cuenta = await Cuenta.findOne({ usuarioId: usuario._id });

        if (!cuenta) {
          // Crear cuenta si no existe
          cuenta = new Cuenta({
            usuarioId: usuario._id,
            gastosComunes: [],
            adicionales: [],
          });
        }

        // Agregar un nuevo gasto común
        cuenta.gastosComunes.push({
          monto,
          fecha,
          estado: "pendiente",
        });

        // Guardar cambios
        await cuenta.save();
      })
    );

    res.status(200).json({ mensaje: "Gastos comunes configurados para todos los usuarios" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al configurar gastos comunes", error });
  }
});

module.exports = router;
