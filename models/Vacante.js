const mongoose = require('mongoose');

const vacanteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  identificador: { type: String, unique: true },
  fechaCreacion: { type: Date, default: Date.now },
  posgrados: [ 
    {
      nivel: { type: String, required: true },
      nombre: { type: String, required: true },
      institucion: { type: String, required: true },
      anio_inicio: { type: Number, required: true },
      anio_fin: { type: Number, required: true },
      cedula: { type: String }
    }
  ]
});

module.exports = mongoose.model('Vacante', vacanteSchema);
