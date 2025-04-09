const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Vacante = require('../models/Vacante');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Validación MIME del PDF
// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'cvs/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Ruta correcta con upload.single('cv')
/*
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    const {
      nombre, edad, correo, boleta, lada, telefono, escuela, vacante
    } = req.body;

    const nuevoUsuario = new User({
      nombre,
      edad,
      correo,
      boleta,
      lada,
      telefono,
      escuela,
      cv: req.file.filename,  // ← aquí truena si req.file no existe
      vacante: vacante || null
    });

    await nuevoUsuario.save();
    res.json({ message: 'Usuario creado con éxito', user: nuevoUsuario });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});
*/
// POST /api/users/create


router.post('/create', upload.single('cv'), async (req, res) => {
  try {
    const { nombre, edad, correo, escuela, carrera, boleta, lada, telefono, vacante } = req.body;
    const cvPath = 'cvs/' + req.file.filename;

    const buffer = fs.readFileSync(cvPath);
    const data = await pdfParse(buffer);
    const textoOriginal = data.text || '';
    const textoNormalizado = textoOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const textoLimpio = textoNormalizado.replace(/\s+/g, ' ').trim();

    console.log('Texto extraído (200):', textoLimpio.slice(0, 200));

    // Lista de palabras clave
    const palabrasClaveIPN = [
      'instituto politecnico nacional',
      'ipn',
      'esime',
      'escom',
      'upiicsa',
      'upiita',
      'esia',
      'escuela superior',
      'unidad zacatenco',
      'unidad culhuacan'
    ];

    // DEBUG: Mostrar cuál coincide
    palabrasClaveIPN.forEach(p => {
      console.log(`¿Contiene "${p}"?:`, textoLimpio.includes(p));
    });

    const mencionaIPN = palabrasClaveIPN.some(p => textoLimpio.includes(p));
    console.log('¿Menciona IPN?', mencionaIPN);

    if (!mencionaIPN) {
      fs.unlinkSync(cvPath);
      return res.status(400).json({ error: 'El currículum no parece pertenecer a un egresado del IPN. Por favor verifica.' });
    }



    const nuevoUsuario = new User({
      nombre,
      edad,
      correo,
      boleta,
      lada,
      telefono,
      escuela,
      cv: req.file.filename,
      vacante: vacante || null
    });

    await nuevoUsuario.save();
    res.json({ message: 'Usuario creado con éxito', user: nuevoUsuario });

  } catch (err) {
    console.error('❌ Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});


module.exports = router;
