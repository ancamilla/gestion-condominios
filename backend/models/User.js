const mongoose = require("mongoose");

// Esquema para la colección "usuarios" en la base de datos
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nombre del usuario
  email: { type: String, required: true, unique: true }, // Email del usuario (único)
  password: { type: String, required: true }, // Contraseña del usuario
  role: { type: String, default: "residente" } // Rol del usuario (por defecto, "residente")
  //se pueden agregar mas campos al modelo, por ejemplo:
  // registrationDate: { type: Date, default: Date.now }, // Fecha de inscripción (por defecto la fecha actual)
  //address: { type: String, required: false } // Dirección del usuario (opcional)
});

// Exportamos el modelo para que pueda ser usado en otras partes del backend
module.exports = mongoose.model("User", UserSchema); //aqui "User" es el nombre del modelo, que será con el que se referenciará en otras partes de la aplicación.
