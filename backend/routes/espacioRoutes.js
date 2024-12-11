const express = require("express");
const router = express.Router();
const Espacio = require("../models/Espacio");
const { verificarUsuario } = require("../middlewares/auth");

// Ruta para obtener todos los espacios comunes
router.get("/", async (req, res) => {
  try {
    const espacios = await Espacio.find({ disponible: true }); // Solo espacios disponibles
    res.json(espacios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener espacios comunes", error });
  }
});

// Ruta para obtener un espacio por ID, incluyendo restricciones horarias
router.get("/:id", async (req, res) => {
    try {
      const espacio = await Espacio.findById(req.params.id);
      if (!espacio) {
        return res.status(404).json({ message: "Espacio no encontrado" });
      }
      res.json({
        id: espacio._id,
        nombre: espacio.nombre,
        descripcion: espacio.descripcion,
        disponible: espacio.disponible,
        restriccionesHorarias: {
          inicio: espacio.horarioInicio,
          fin: espacio.horarioFin,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el espacio", error });
    }
  });

// Ruta para agregar un nuevo espacio (solo para pruebas por ahora, realizar pruebas usando POSTMAN)
router.post("/", verificarUsuario, async (req, res) => {
    try {
      const { nombre, descripcion, horarioInicio, horarioFin } = req.body;
  
      // Validar campos obligatorios
      if (!nombre) {
        return res.status(400).json({ message: "El nombre del espacio es obligatorio" });
      }
  
      // Crear un nuevo espacio
      const nuevoEspacio = new Espacio({
        nombre,
        descripcion,
        horarioInicio: horarioInicio || "06:00", // Valor predeterminado
        horarioFin: horarioFin || "20:00", // Valor predeterminado
      });
  
      await nuevoEspacio.save();
      res.status(201).json({ message: "Espacio común creado exitosamente", espacio: nuevoEspacio });
    } catch (error) {
      res.status(500).json({ message: "Error al crear espacio común", error });
    }
  });
  

module.exports = router;
