const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createUser } = require('../controllers/userController');

router.post('/create', upload.single('cv'), createUser);

module.exports = router;
