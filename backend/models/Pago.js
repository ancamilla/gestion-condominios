//Este archivo se refiere al pago de gastos comunes

const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuario asociado
  monto: { type: Number, required: true }, // Monto del pago
  fechaVencimiento: { type: Date, required: true }, // Fecha de vencimiento
  estado: { type: String, enum: ["pendiente", "pagado"], default: "pendiente" }, // Estado del pago
  tipo: { type: String, enum: ["gasto común", "multa", "extra"], default: "gasto común" } // Tipo de pago
});

module.exports = mongoose.model("Pago", PagoSchema);

