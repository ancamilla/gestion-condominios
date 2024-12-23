const mongoose = require("mongoose");

const ReclamoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuario que realiza el reclamo
  descripcion: { type: String, required: true }, // Descripción del reclamo
  multimedia: [{ type: String }], // URLs de imágenes o videos adjuntos (opcional)
  estado: { type: String, enum: ["pendiente", "rechazado", "aprobado"], default: "pendiente" }, // Estado del reclamo
  categoria: { type: String, enum: ["ruidos molestos", "estacionamiento indebido", "basura", "otros"], required: true }, // Categoría del reclamo
  fecha: { type: Date, default: Date.now }, // Fecha del reclamo
  observacionesAdmin: { type: String }, // Observaciones del administrador (opcional)
});

module.exports = mongoose.model("Reclamo", ReclamoSchema);
