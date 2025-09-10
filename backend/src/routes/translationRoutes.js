const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

// Rutas para traducción
router.post('/text-to-signs', translationController.textToSignLanguage);
router.post('/signs-to-text', translationController.signLanguageToText);
router.post('/optimize-for-context', translationController.optimizeTranslationForContext);

module.exports = router;
