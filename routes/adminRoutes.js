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
  try {
    const { nombre, descripcion } = req.body;

    const palabrasIgnoradas = ['en', 'de', 'del', 'la', 'el', 'y'];

    const siglas = nombre
      .split(/\s+/)
      .filter(p => !palabrasIgnoradas.includes(p.toLowerCase()))
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2); // Solo dos letras

    const añoActual = new Date().getFullYear().toString().slice(-2);

    // Trae todas las vacantes del año actual sin importar siglas
    const todas = await Vacante.find({ identificador: { $regex: `-${añoActual}$` } });

    const numerosUsados = todas.map(v => {
      const match = v.identificador.match(/^Vacante[A-Z]{2}(\d+)-\d{2}$/);
      console.log(match);
      return match ? parseInt(match[1]) : 0;
    });
    

    const siguienteNumero = numerosUsados.length > 0 ? Math.max(...numerosUsados) + 1 : 1;
    const identificador = `Vacante${siglas}${siguienteNumero}-${añoActual}`;

    const nuevaVacante = new Vacante({
      nombre,
      descripcion,
      identificador,
      fechaCreacion: new Date()
    });

    await nuevaVacante.save();
    res.json({ message: "Vacante creada con éxito", vacante: nuevaVacante });

  } catch (err) {
    console.error("❌ Error al crear vacante:", err);
    res.status(500).json({ error: "Error al crear vacante" });
  }
});


// ✅ Listar usuarios con vacante
router.get('/usuarios', auth, async (req, res) => {
  try {
    const users = await User.find().populate('vacante');
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
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
router.get('/cv/:filename', auth, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'cvs', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(filePath);
});

module.exports = router;
