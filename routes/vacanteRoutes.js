// routes/vacanteRoutes.js
const express = require('express');
const router = express.Router();
const Vacante = require('../models/Vacante');

// Lista vacantes (para el select del formulario)
router.get('/', async (req, res) => {
  const vacantes = await Vacante.find();
  res.json(vacantes);
});

module.exports = router;
