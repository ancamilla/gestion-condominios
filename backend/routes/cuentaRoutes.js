const express = require("express");
const router = express.Router();
const Cuenta = require("../models/Cuenta"); // Modelo de Cuenta
const User = require("../models/User");    // Modelo de Usuario

// Endpoint para configurar gastos comunes
// (Función existente, no se modifica)
router.post("/admin/configurar-gastos-comunes", async (req, res) => {
  try {
    const { monto, diaCobro } = req.body;

    if (!monto || !diaCobro) {
      return res.status(400).json({ message: "Monto y día de cobro son obligatorios." });
    }

    // Generar fecha de cobro válida (día del mes actual)
    const fecha = new Date();
    fecha.setDate(diaCobro); // Establece el día de cobro
    if (fecha.getDate() !== diaCobro) {
      // Si el día no es válido (por ejemplo, 31 en un mes con solo 30 días), devuelve un error
      return res.status(400).json({ message: "Día de cobro inválido para el mes actual." });
    }

    // Obtener todos los usuarios
    const usuarios = await User.find();

    // Crear o actualizar cuentas con el nuevo gasto común
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

        // Agregar el nuevo gasto común
        cuenta.gastosComunes.push({
          monto,
          fecha,
          estado: "pendiente",
        });

        // Guardar cambios
        await cuenta.save();
      })
    );

    res.status(200).json({ message: "Gastos comunes configurados para todos los usuarios." });
  } catch (error) {
    res.status(500).json({ message: "Error al configurar gastos comunes.", error });
  }
});


// Bloque nuevo: Obtener lista de todas las cuentas
// Este endpoint lista todas las cuentas, mostrando información básica de gastos comunes y usuarios asociados
router.get("/admin/cuentas", async (req, res) => {
  try {
    // Buscar todas las cuentas y popular la información del usuario
    const cuentas = await Cuenta.find().populate("usuarioId", "name email address");
    res.json(cuentas); // Devolver las cuentas con los datos del usuario
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las cuentas", error });
  }
});

// Bloque nuevo: Obtener detalles de una cuenta específica
// Este endpoint permite al administrador ver todos los detalles de una cuenta específica, incluyendo los gastos comunes y adicionales
router.get("/admin/cuentas/:id", async (req, res) => {
  try {
    const cuenta = await Cuenta.findById(req.params.id).populate("usuarioId", "name email");

    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    res.json(cuenta); // Devolver los detalles completos de la cuenta
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cuenta", error });
  }
});

// Bloque nuevo: Actualizar el estado de un gasto común
// Este endpoint permite cambiar el estado (pendiente/pagado) de un gasto común específico
router.put("/admin/cuentas/:id/gastos/:gastoId", async (req, res) => {
  try {
    const { id, gastoId } = req.params;
    const { estado } = req.body;

    // Validar si el estado proporcionado es válido
    if (!["pendiente", "pagado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    // Buscar la cuenta correspondiente
    const cuenta = await Cuenta.findById(id);
    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    // Buscar el gasto común dentro de la cuenta
    const gasto = cuenta.gastosComunes.id(gastoId);
    if (!gasto) {
      return res.status(404).json({ message: "Gasto común no encontrado" });
    }

    // Actualizar el estado del gasto común
    gasto.estado = estado;
    await cuenta.save();

    res.json({ message: "Estado del gasto actualizado", cuenta });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el estado del gasto", error });
  }
});

module.exports = router;

