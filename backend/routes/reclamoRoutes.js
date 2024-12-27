const express = require("express");
const router = express.Router();
const Reclamo = require("../models/Reclamo");
const { verificarUsuario } = require("../middlewares/auth");
const multer = require("multer");



// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Registrar un nuevo reclamo con archivos multimedia
router.post("/", verificarUsuario, upload.array("multimedia", 5), async (req, res) => {
  try {
    const { descripcion, categoria } = req.body;

    if (!descripcion || !categoria) {
      return res.status(400).json({ message: "La descripción y la categoría son obligatorias" });
    }

    const multimedia = req.files.map((file) => `/uploads/${file.filename}`); // Guardar URLs de archivos

    const nuevoReclamo = new Reclamo({
      usuario: req.usuario._id,
      descripcion,
      categoria,
      multimedia,
    });

    await nuevoReclamo.save();
    res.status(201).json({ message: "Reclamo registrado exitosamente", reclamo: nuevoReclamo });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el reclamo", error });
  }
});

// Obtener los reclamos del usuario autenticado
router.get("/usuario", verificarUsuario, async (req, res) => {
  try {
    const reclamos = await Reclamo.find({ usuario: req.usuario._id }).sort({ fecha: -1 });
    res.json(reclamos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los reclamos", error });
  }
});
const { verificarRol } = require("../middlewares/auth");

// Obtener todos los reclamos (solo para administradores)
router.get("/admin", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const reclamos = await Reclamo.find()
      .populate("usuario", "name email")
      .sort({ fecha: -1 });
    res.json(reclamos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los reclamos", error });
  }
});

// Actualizar el estado de un reclamo (solo para administradores)
router.put("/admin/:id", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observacionesAdmin } = req.body;

    if (!estado || !["pendiente", "rechazado", "aprobado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const reclamo = await Reclamo.findByIdAndUpdate(
      id,
      { estado, observacionesAdmin },
      { new: true }
    );

    if (!reclamo) {
      return res.status(404).json({ message: "Reclamo no encontrado" });
    }

    res.json({ message: "Estado del reclamo actualizado", reclamo });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el estado del reclamo", error });
  }
});


module.exports = router;
