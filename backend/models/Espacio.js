const mongoose = require("mongoose");

// Esquema para los espacios comunes
const EspacioSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // Nombre del espacio (piscina, gimnasio, etc.)
  descripcion: { type: String }, // Descripción opcional
  disponible: { type: Boolean, default: true }, // Disponibilidad general
  horarioInicio: { type: String, default: "06:00" }, // Horario permitido de inicio (formato 24h)
  horarioFin: { type: String, default: "20:00" }, // Horario permitido de fin (formato 24h)
});

module.exports = mongoose.model("Espacio", EspacioSchema);
