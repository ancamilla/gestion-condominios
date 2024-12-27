const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verificarUsuario, verificarRol } = require("../middlewares/auth");
const Cuenta = require("../models/Cuenta");
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
    const { name, email, password, role, address } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Crear usuario
    const newUser = new User({ name, email, password, role, address });
    await newUser.save();

    // Crear cuenta asociada
    const newCuenta = new Cuenta({
      usuarioId: newUser._id,
      gastosComunes: [],
      adicionales: [],
    });
    await newCuenta.save();

    // Respuesta exitosa
    return res.status(201).json({ message: "Usuario registrado y cuenta creada exitosamente." });
  } catch (error) {
    // Manejar error inesperado
    console.error("Error inesperado al registrar usuario:", error);
    return res.status(500).json({ message: "Error al registrar usuario.", error: error.message });
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

    res.json({ token, usuario: { name: usuario.name, email: usuario.email, role: usuario.role, address: usuario.address } });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
});

// Ruta para obtener el perfil del usuario autenticado
router.get("/profile", verificarUsuario, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id, "name email role address");
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil del usuario", error });
  }
});

// Ruta para actualizar el perfil del usuario autenticado
router.put("/profile", verificarUsuario, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const usuario = await User.findById(req.usuario._id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizamos los campos del usuario
    usuario.name = name || usuario.name;
    usuario.email = email || usuario.email;
    usuario.address = address || usuario.address;

    await usuario.save();
    res.json({ message: "Perfil actualizado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el perfil", error });
  }
});

// Ruta para obtener todos los usuarios (solo para administradores)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ address: 1 });;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
});
// Ruta para que el administrador edite usuarios
router.put("/:id", verificarUsuario, verificarRol(["administrador"]), async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.name = name || usuario.name;
    usuario.email = email || usuario.email;
    usuario.address = address || usuario.address;

    await usuario.save();
    res.json({ message: "Usuario actualizado exitosamente", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error });
  }
});

module.exports = router;

