const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  correo: String,
  escuela: String,
  cv: String, //ruta del archivo
  vacante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacante',
    required: false
  }
});

module.exports = mongoose.model('User', userSchema);
