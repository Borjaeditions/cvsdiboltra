const mongoose = require('mongoose');

const vacanteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  identificador: { type: String, unique: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vacante', vacanteSchema);
