const express = require('express');
const router = express.Router();
const signLanguageController = require('../controllers/signLanguageController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Rutas para el reconocimiento de lenguaje de señas
router.post('/recognize', upload.single('video'), signLanguageController.recognizeSignLanguage);
router.post('/recognize-stream', signLanguageController.recognizeSignLanguageStream);
router.get('/gestures', signLanguageController.getAvailableGestures);

module.exports = router;
