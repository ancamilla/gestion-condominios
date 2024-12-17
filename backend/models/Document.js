const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  archivoUrl: { type: String, required: true },
  fechaSubida: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);
