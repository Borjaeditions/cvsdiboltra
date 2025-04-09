const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  correo: String,
  boleta: String,
  lada: String,
  telefono: String,
  lada: String,
  escuela: String,
  carrera: String,
  cv: String, //ruta del archivo
  vacante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacante',
    required: false
  }
});

module.exports = mongoose.model('User', userSchema);
