const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads"); // Carpeta donde se guardarán los archivos
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Crea la carpeta si no existe
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`); // Renombra el archivo
  },
});

const upload = multer({ storage });

// Modelo de Documento (MongoDB)
const Document = require("../models/Document");

// Ruta para subir un nuevo documento
router.post("/", upload.single("archivo"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo." });
    }

    const nuevoDocumento = new Document({
      nombre,
      archivoUrl: `/uploads/${req.file.filename}`,
    });

    await nuevoDocumento.save();

    res.status(201).json({ message: "Documento subido exitosamente.", documento: nuevoDocumento });
  } catch (error) {
    console.error("Error al subir el documento:", error);
    res.status(500).json({ message: "Error al subir el documento.", error });
  }
});

// Ruta para obtener todos los documentos
router.get("/", async (req, res) => {
  try {
    const documentos = await Document.find();
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los documentos.", error });
  }
});

// Ruta para eliminar un documento
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Document.findById(id);

    if (!documento) {
      return res.status(404).json({ message: "Documento no encontrado." });
    }

    // Eliminar el archivo físicamente
    const filePath = path.join(__dirname, "..", documento.archivoUrl);
    fs.unlinkSync(filePath);

    // Eliminar el registro de la base de datos
    await Document.findByIdAndDelete(id);

    res.json({ message: "Documento eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el documento:", error);
    res.status(500).json({ message: "Error al eliminar el documento.", error });
  }
});

module.exports = router;
