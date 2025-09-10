const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Rutas para el reconocimiento de voz
router.post('/recognize', upload.single('audio'), speechController.recognizeSpeech);
router.post('/recognize-stream', speechController.recognizeSpeechStream);
router.post('/text-to-speech', speechController.textToSpeech);

module.exports = router;
