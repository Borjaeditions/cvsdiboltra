const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Vacante = require('../models/Vacante');

// ✅ Crear vacante con identificador tipo VacanteIS1-25
router.post('/vacantes/create', auth, async (req, res) => {
  const { nombre, descripcion } = req.body;

  // Obtener iniciales del nombre
  const iniciales = nombre
    .split(' ')
    .map(p => p.charAt(0).toUpperCase())
    .join('');

  // Buscar cuántas ya existen con esas iniciales
  const similares = await Vacante.find({ identificador: new RegExp(`^Vacante${iniciales}`) });
  const consecutivo = similares.length + 1;

  // Año actual (dos dígitos)
  const año = new Date().getFullYear().toString().slice(-2);

  const identificador = `Vacante${iniciales}${consecutivo}-${año}`;

  const nuevaVacante = new Vacante({ nombre, descripcion, identificador });
  await nuevaVacante.save();

  res.status(201).json({ message: 'Vacante creada', vacante: nuevaVacante });
});

// ✅ Listar usuarios con vacante
router.get('/usuarios', auth, async (req, res) => {
  const users = await User.find().populate('vacante');
  res.json(users);
});

// ✅ Descargar ZIP nombrado con identificador de la vacante
router.post('/zip', auth, async (req, res) => {
  const { archivos } = req.body;
  if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
    return res.status(400).json({ error: 'No se especificaron archivos' });
  }

  // Buscar primer usuario con ese CV
  const primerUsuario = await User.findOne({ cv: archivos[0] }).populate('vacante');
  const identificador = primerUsuario?.vacante?.identificador || 'CVs';

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=${identificador}.zip`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
 
  archivos.forEach(filename => {
    const filePath = path.join(__dirname, '..', 'cvs', filename);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: filename });
    }
  });

  archive.finalize();
});

module.exports = router;
