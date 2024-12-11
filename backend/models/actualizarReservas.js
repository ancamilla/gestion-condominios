const mongoose = require("mongoose");

// Cambia esto por tu URI de conexión a MongoDB
const mongoURI = "mongodb://localhost:27017/gestion-condominios";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión a MongoDB exitosa"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));


const Reserva = require("./Reserva");
const Espacio = require("./Espacio");

// Script para actualizar las reservas
const actualizarReservas = async () => {
  try {
    const reservas = await Reserva.find();

    for (const reserva of reservas) {
      const espacio = await Espacio.findOne({ nombre: reserva.espacio }); // Busca el espacio por nombre
      if (espacio) {
        reserva.espacio = espacio._id; // Actualiza el campo espacio con la referencia
        await reserva.save();
      }
    }

    console.log("Reservas actualizadas exitosamente.");
  } catch (error) {
    console.error("Error al actualizar reservas:", error);
  }
};

actualizarReservas();
