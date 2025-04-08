const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Vacante = require('../models/Vacante');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Validación MIME del PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'cvs/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  if (mimeType === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

const upload = multer({ storage, fileFilter });

// POST /api/users/create


router.post('/create', upload.single('cv'), async (req, res) => {
  try {
    const { nombre, edad, correo, escuela, vacante } = req.body;
    const cvPath = 'cvs/' + req.file.filename;

    // Leer el contenido del PDF
    const buffer = fs.readFileSync(cvPath);
    const data = await pdfParse(buffer);
    const textoCV = data.text.toLowerCase();

    // Lista de palabras clave asociadas al IPN
    const palabrasClaveIPN = [
      'instituto politécnico nacional', 'ipn',
      'esime', 'escom', 'upiicsa', 'upiita', 'esia',
      'escuela superior', 'unidad zacatenco', 'unidad culhuacán'
    ];

    const mencionaIPN = palabrasClaveIPN.some(palabra =>
      textoCV.includes(palabra)
    );

    if (!mencionaIPN) {
      // Si no se detecta IPN en el texto, elimina el archivo
      fs.unlinkSync(cvPath);
      return res.status(400).json({ error: 'El currículum no parece pertenecer a un egresado del IPN. Por favor verifica.' });
    }

    // Si pasa la validación, guardar usuario
    const nuevoUsuario = new User({
      nombre,
      edad,
      correo,
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
