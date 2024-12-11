// Requiere las dependencias necesarias
const express = require("express");  // Framework web para Node.js
const mongoose = require("mongoose");  // ORM de MongoDB para trabajar con la base de datos
const cors = require("cors");  // Middleware para permitir solicitudes de diferentes dominios

require("dotenv").config();  // Cargar variables de entorno desde el archivo .env

// Inicializamos la aplicación Express
const app = express();

// Middleware para parsear cuerpos JSON en las solicitudes entrantes
app.use(express.json());

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Esto permite que la API sea accesible desde diferentes dominios
app.use(cors());
// Importamos las rutas
const userRoutes = require("./routes/userRoutes"); 
const reservaRoutes = require("./routes/reservaRoutes");
const espacioRoutes = require("./routes/espacioRoutes");
// Usamos las rutas para la API de usuarios
app.use("/api/users", userRoutes); //Esto significa que todas las rutas en userRoutes.js están disponibles bajo la URL base /api/users

app.use("/api/espacios", espacioRoutes); // Usamos las rutas de espacios
app.use("/api/reservas", reservaRoutes);  // Usamos las rutas de reservas
// Conectamos a MongoDB utilizando la URI de conexión definida en el archivo .env
mongoose.connect(process.env.MONGO_URI)  // Usamos la URI que está en el archivo .env
  .then(() => console.log("MongoDB conectado"))  // Si la conexión es exitosa, mostramos este mensaje
  .catch(err => console.error(err));  // Si hay un error en la conexión, lo mostramos en la consola

// Iniciamos el servidor Express en el puerto 5000
app.listen(5000, () => console.log("Servidor corriendo en http://localhost:5000"));

