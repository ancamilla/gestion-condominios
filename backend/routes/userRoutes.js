const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verificarUsuario, verificarRol } = require("../middlewares/auth");

// Ruta para asignar roles (solo para administradores)
router.put("/asignar-rol/:id", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  const { role } = req.body;

  if (!["residente", "administrador"].includes(role)) {
    return res.status(400).json({ message: "Rol inválido" });
  }

  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.role = role;
    await usuario.save();
    res.json({ message: "Rol asignado exitosamente", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al asignar rol", error });
  }
});

// Ruta para registrar un nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    const contrasenaValida = await bcrypt.compare(password, usuario.password);
    if (!contrasenaValida) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    // Creamos un token JWT
    const token = jwt.sign(
      { _id: usuario._id, name: usuario.name, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, usuario: { name: usuario.name, email: usuario.email, role: usuario.role } });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error });
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
