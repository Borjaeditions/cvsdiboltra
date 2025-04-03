// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vacante = require('../models/Vacante');

router.post('/vacantes/create', auth, async (req, res) => {
  const { nombre, descripcion } = req.body;
  const vacante = new Vacante({ nombre, descripcion });
  await vacante.save();
  res.status(201).json({ message: 'Vacante creada', vacante });
});

module.exports = router;
