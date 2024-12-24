const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Esquema para la colección "usuarios" en la base de datos
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nombre del usuario
  email: { type: String, required: true, unique: true }, // Email del usuario (único)
  password: { type: String, required: true }, // Contraseña del usuario
  role: { type: String, default: "residente", enum: ["residente", "administrador"] }, // Rol del usuario (por defecto, "residente")
  //se pueden agregar mas campos al modelo, por ejemplo:
  // registrationDate: { type: Date, default: Date.now }, // Fecha de inscripción (por defecto la fecha actual)
  address: { type: String, required: false } // Dirección del usuario (por ejemplo "101", "206")
});
// Cifra la contraseña antes de guardar el usuario
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Si la contraseña no cambia, no la ciframos
  this.password = await bcrypt.hash(this.password, 10); // Ciframos la contraseña
  next();
});
// Exportamos el modelo para que pueda ser usado en otras partes del backend
module.exports = mongoose.model("User", UserSchema); //aqui "User" es el nombre del modelo, que será con el que se referenciará en otras partes de la aplicación.
