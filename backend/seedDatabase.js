const mongoose = require("mongoose");
const User = require("./models/User");
const Cuenta = require("./models/Cuenta");
const Espacio = require("./models/Espacio");

const MONGO_URI = "mongodb://localhost:27017/gestion-condominios"; // Cambia según tu configuración

const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a la base de datos");

    // Limpiar las colecciones existentes
    await User.deleteMany({});
    await Cuenta.deleteMany({});
    await Espacio.deleteMany({});
    console.log("Colecciones limpiadas");

    // Crear usuarios y cuentas
    const usuarios = [];
    const cuentas = [];
    for (let piso = 1; piso <= 8; piso++) {
      for (let depto = 1; depto <= 10; depto++) {
        const numeroDepto = `${piso}0${depto}`.slice(-3); // Formato: 101, 102, ..., 805
        const address = numeroDepto;

        const user = new User({
          name: `Usuario ${numeroDepto}`,
          email: `usuario${numeroDepto}@example.com`,
          password: "123456", // Contraseña predeterminada (mejor cambiarla luego)
          role: "residente",
          address,
        });
        usuarios.push(user);

        const cuenta = new Cuenta({
          usuarioId: user._id, // Relación con el usuario
          gastosComunes: [], // Sin gastos al inicio
          adicionales: [], // Sin adicionales al inicio
        });
        cuentas.push(cuenta);
      }
    }

    // Insertar usuarios y cuentas
    await User.insertMany(usuarios);
    console.log("Usuarios insertados");

    // Asociar cuentas a los usuarios recién creados
    for (let i = 0; i < cuentas.length; i++) {
      cuentas[i].usuarioId = usuarios[i]._id;
    }
    await Cuenta.insertMany(cuentas);
    console.log("Cuentas creadas con valores iniciales");

    // Crear espacios comunes
    const espacios = [
      {
        nombre: "Estacionamientos",
        descripcion: "Estacionamientos comunes del edificio",
        horarioInicio: "06:00",
        horarioFin: "22:00",
      },
      {
        nombre: "Piscina",
        descripcion: "Piscina del edificio",
        horarioInicio: "08:00",
        horarioFin: "20:00",
      },
      {
        nombre: "Salón de Eventos",
        descripcion: "Salón para reuniones y celebraciones",
        horarioInicio: "10:00",
        horarioFin: "22:00",
      },
      {
        nombre: "Gimnasio",
        descripcion: "Gimnasio del edificio",
        horarioInicio: "06:00",
        horarioFin: "22:00",
      },
    ];
    await Espacio.insertMany(espacios);
    console.log("Espacios comunes creados");

    console.log("Base de datos inicializada exitosamente");
    process.exit(0); // Salir del proceso
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
    process.exit(1);
  }
};

seedDatabase();

