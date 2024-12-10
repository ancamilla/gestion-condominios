const mongoose = require("mongoose");

// Esquema para las reservas de espacios
const ReservaSchema = new mongoose.Schema({
  espacio: { type: String, required: true }, // Espacio reservado (ejemplo: "piscina")
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuario que realiza la reserva
  fecha: { type: Date, required: true }, // Fecha y hora de la reserva
  pagoInicial: { type: Boolean, default: false }, // Indicador de pago inicial
  estado: { type: String, default: "Pendiente" }, // Estado de la reserva (Pendiente, Confirmada, etc.)
});

// Exportamos el modelo
module.exports = mongoose.model("Reserva", ReservaSchema);
