const jwt = require("jsonwebtoken");

// Middleware para verificar al usuario autenticado
const verificarUsuario = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Tomamos el token del encabezado Authorization

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificamos el token con la clave secreta
    req.usuario = decoded; // Guardamos los datos del usuario en la solicitud
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
// Middleware para verificar roles específicos
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({ message: "Acceso denegado. Permiso insuficiente." });
    }
    next();
  };
};
module.exports = { verificarUsuario, verificarRol };
