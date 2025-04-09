const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Vacante = require('../models/Vacante');
const ExcelJS = require('exceljs');

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
    const todas = await Vacante.find({ identificador: { $regex: `-${añoActual}$` } });

    const numerosUsados = todas.map(v => {
      const match = v.identificador.match(/^Vacante[A-Z]{2}(\d+)-\d{2}$/);
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
    res.json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ✅ Descargar ZIP con CVs y resumen.xlsx
router.post('/zip', auth, async (req, res) => {
  const { archivos } = req.body;
  if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
    return res.status(400).json({ error: 'No se especificaron archivos' });
  }

  try {
    const usuarios = await User.find({ cv: { $in: archivos } }).populate('vacante');
    const primerUsuario = usuarios[0];
    const identificador = primerUsuario?.vacante?.identificador || 'CVs';

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Egresados');

    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Edad', key: 'edad', width: 10 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Boleta', key: 'boleta', width: 20 },
      { header: 'Lada', key: 'lada', width: 10 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Escuela', key: 'escuela', width: 30 },
      { header: 'Carrera', key: 'carrera', width: 30 },
      { header: 'Vacante', key: 'vacante', width: 30 }
    ];

    // Estilo para encabezados
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFEFEF' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    usuarios.forEach(user => {
      sheet.addRow({
        nombre: user.nombre,
        edad: user.edad,
        correo: user.correo,
        boleta: user.boleta,
        telefono: user.telefono,
        lada: user.lada,
        escuela: user.escuela,
        carrera: user.carrera,
        vacante: user.vacante?.nombre || 'N/A'
      });
    });

    // Estilo para las celdas de datos
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const excelPath = path.join(__dirname, '..', 'cvs', 'resumen.xlsx');
    await workbook.xlsx.writeFile(excelPath);

    // Preparar ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${identificador}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Adjuntar archivos CV
    archivos.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'cvs', filename);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: filename });
      }
    });

    // Adjuntar resumen.xlsx
    archive.file(excelPath, { name: 'resumen.xlsx' });

    await archive.finalize();

    archive.on('end', () => {
      fs.unlinkSync(excelPath); // Eliminar Excel temporal
    });

  } catch (err) {
    console.error("❌ Error al generar ZIP:", err);
    res.status(500).json({ error: 'Error al generar ZIP' });
  }
});

// ✅ Ver CV individual de forma segura
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
