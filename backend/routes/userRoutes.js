const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Ruta para registrar un nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificamos que todos los campos obligatorios estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificamos si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Creamos un nuevo usuario
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// Ruta para obtener todos los usuarios (solo para pruebas)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
});

module.exports = router;
