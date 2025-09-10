const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { allowAnonymous } = require('../middleware/authMiddleware');

// Rutas para usuarios - Simplificadas ya que eliminamos el login
router.get('/profile', allowAnonymous, userController.getUserProfile);
router.put('/preferences', allowAnonymous, userController.updateUserPreferences);

module.exports = router;
