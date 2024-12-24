const mongoose = require("mongoose");

const ConfiguracionSchema = new mongoose.Schema({
  tipo: { type: String, required: true, unique: true }, // Tipo de configuración (e.g., "gastosComunes")
  monto: { type: Number, required: true }, // Monto de los gastos comunes
  diaCobro: { type: Number, required: true }, // Día del mes para el cobro automático
});

module.exports = mongoose.model("Configuracion", ConfiguracionSchema);
