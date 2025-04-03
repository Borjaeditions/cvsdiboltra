const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET usuarios con populate para mostrar vacante
router.get('/usuarios', auth, async (req, res) => {
  const users = await User.find().populate('vacante');
  res.json(users);
});

// POST para generar ZIP con CVs
router.post('/zip', auth, async (req, res) => {
  const { archivos } = req.body;
  if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
    return res.status(400).json({ error: 'No se especificaron archivos' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=cvs_seleccionados.zip');

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
