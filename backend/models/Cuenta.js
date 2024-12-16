const mongoose = require("mongoose");

const CuentaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuario asociado
  gastosComunes: [
    {
      monto: { type: Number, required: true },
      fecha: { type: Date, required: true },
      estado: { type: String, enum: ["pendiente", "pagado"], default: "pendiente" }, // Estado del gasto común
    },
  ],
  adicionales: [
    {
      tipo: { type: String, enum: ["multa", "arriendo"], required: true }, // Tipo de gasto adicional
      monto: { type: Number, required: true },
      descripcion: { type: String },
      fecha: { type: Date, required: true },
      estado: { type: String, enum: ["pendiente", "pagado"], default: "pendiente" }, // Estado del gasto adicional
    },
  ],
});

module.exports = mongoose.model("Cuenta", CuentaSchema);
