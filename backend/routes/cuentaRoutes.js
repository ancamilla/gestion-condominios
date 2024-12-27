const express = require("express");
const router = express.Router();
const Cuenta = require("../models/Cuenta"); // Modelo de Cuenta
const User = require("../models/User");    // Modelo de Usuario
const { verificarUsuario, verificarRol } = require("../middlewares/auth");
const mongoose = require("mongoose");

// Endpoint para configurar gastos comunes
// (Función existente, no se modifica)
router.get("/admin/configuracion-gastos-comunes", async (req, res) => {
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
    const cuentas = await Cuenta.find().populate("usuarioId", "name email address");
    const cuentasFiltradas = cuentas.filter((cuenta) => cuenta.usuarioId);
    res.json(cuentasFiltradas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las cuentas", error });
  }
});


// Bloque nuevo: Obtener detalles de una cuenta específica
// Este endpoint permite al administrador ver todos los detalles de una cuenta específica, incluyendo los gastos comunes y adicionales
router.get("/admin/cuentas/:id", async (req, res) => {
  try {
    const cuenta = await Cuenta.findById(req.params.id).populate("usuarioId", "name email address");

    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    res.json(cuenta); // Devolver los detalles completos de la cuenta
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cuenta", error });
  }
});
// Agregar un gasto adicional a la cuenta de un usuario
router.post("/:id/adicionales", async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario
    const { tipo, monto, descripcion, fecha, estado } = req.body;

    console.log("Buscando cuenta para usuario ID:", id); // Depuración
    const cuenta = await Cuenta.findOne({ usuarioId: mongoose.Types.ObjectId(id) });

    if (!cuenta) {
      console.error("Cuenta no encontrada para usuario ID:", id); // Depuración
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    cuenta.adicionales.push({ tipo, monto, descripcion, fecha, estado });
    await cuenta.save();

    res.status(200).json({ message: "Gasto adicional agregado exitosamente.", cuenta });
  } catch (error) {
    console.error("Error al agregar gasto adicional:", error); // Depuración
    res.status(500).json({ message: "Error al agregar gasto adicional.", error });
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
// Actualizar el estado de una deuda adicional
router.put("/:id/adicionales/:adicionalId", async (req, res) => {
  try {
    const { id, adicionalId } = req.params;
    const { estado } = req.body;

    // Validar el estado
    if (!["pendiente", "pagado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido." });
    }

    // Buscar la cuenta del usuario
    const cuenta = await Cuenta.findOne({ usuarioId: id });
    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    // Buscar la deuda adicional
    const adicional = cuenta.adicionales.id(adicionalId);
    if (!adicional) {
      return res.status(404).json({ message: "Adicional no encontrado." });
    }

    // Actualizar el estado
    adicional.estado = estado;
    await cuenta.save();

    res.status(200).json({ message: "Estado del adicional actualizado.", cuenta });
  } catch (error) {
    console.error("Error al actualizar el adicional:", error);
    res.status(500).json({ message: "Error al actualizar el adicional.", error });
  }
});
// Agregar un gasto común a la cuenta de un usuario
router.post("/:id/gastos-comunes", async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, fecha, estado } = req.body;

    const cuenta = await Cuenta.findOne({ usuarioId: id });
    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    cuenta.gastosComunes.push({ monto, fecha, estado });
    await cuenta.save();

    res.status(200).json({ message: "Gasto común agregado exitosamente.", cuenta });
  } catch (error) {
    console.error("Error al agregar gasto común:", error);
    res.status(500).json({ message: "Error al agregar gasto común.", error });
  }
});
router.get("/", async (req, res) => {
  try {
    // Obtener todas las cuentas y popular los datos de usuario
    const cuentas = await Cuenta.find().populate("usuarioId", "name email address");

    // Verificar que los campos populados existan antes de ordenar
    const cuentasOrdenadas = cuentas
      .filter((cuenta) => cuenta.usuarioId && cuenta.usuarioId.address) // Asegurar que existe el usuario y el domicilio
      .sort((a, b) => a.usuarioId.address.localeCompare(b.usuarioId.address)); // Ordenar por domicilio

    res.status(200).json(cuentasOrdenadas); // Devolver las cuentas ordenadas
  } catch (error) {
    console.error("Error al obtener las cuentas:", error);
    res.status(500).json({ message: "Error al obtener cuentas." });
  }
});

// Obtener gastos comunes del usuario autenticado
router.get("/usuario/gastos-comunes", verificarUsuario, async (req, res) => {
  try {
    // Buscar la cuenta del usuario autenticado
    const cuenta = await Cuenta.findOne({ usuarioId: req.usuario._id });

    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    res.status(200).json(cuenta.gastosComunes); // Devolver los gastos comunes
  } catch (error) {
    console.error("Error al obtener los gastos comunes:", error);
    res.status(500).json({ message: "Error al obtener los gastos comunes.", error });
  }
});

// Obtener los gastos adicionales de un usuario
router.get("/usuario/adicionales", verificarUsuario, async (req, res) => {
  try {
    const usuarioId = req.usuario._id; // Usuario autenticado desde verificarUsuario
    const cuenta = await Cuenta.findOne({ usuarioId }); // Buscar la cuenta asociada al usuario

    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    res.status(200).json(cuenta.adicionales); // Devolver los adicionales
  } catch (error) {
    console.error("Error al obtener los adicionales:", error);
    res.status(500).json({ message: "Error al obtener los adicionales." });
  }
});



module.exports = router;

