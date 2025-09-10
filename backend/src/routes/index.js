const express = require('express');
const router = express.Router();

const signLanguageRoutes = require('./signLanguageRoutes');
const speechRoutes = require('./speechRoutes');
const translationRoutes = require('./translationRoutes');
const userRoutes = require('./userRoutes');

// Rutas principales
router.use('/sign-language', signLanguageRoutes);
router.use('/speech', speechRoutes);
router.use('/translation', translationRoutes);
router.use('/users', userRoutes);

module.exports = router;
