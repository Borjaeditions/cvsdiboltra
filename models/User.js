const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  vacante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacante'
  },
 
  cv: String // Ruta del archivo CV
});

module.exports = mongoose.model('User', userSchema);
