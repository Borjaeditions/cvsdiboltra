const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { nombre, edad } = req.body;
    const cv = req.file ? req.file.filename : null;

    const newUser = new User({ nombre, edad, cv });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario', details: err });
  }
};
