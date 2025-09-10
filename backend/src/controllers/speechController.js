const speechService = require('../services/speechService');

// Controlador para reconocimiento de voz
const speechController = {
  // Reconocer voz desde un archivo de audio
  async recognizeSpeech(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo de audio' });
      }

      const audioPath = req.file.path;
      const result = await speechService.processAudioFile(audioPath);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en el reconocimiento de voz:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el audio',
        error: error.message
      });
    }
  },

  // Reconocer voz desde un stream de audio en tiempo real
  async recognizeSpeechStream(req, res) {
    try {
      // Esta función solo establece la configuración inicial
      // La comunicación real se realizará a través de websockets
      const { userId, sessionId } = req.body;

      if (!userId || !sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere userId y sessionId para iniciar el reconocimiento en tiempo real' 
        });
      }

      // Configurar la sesión para el reconocimiento en tiempo real
      await speechService.setupRealtimeSpeechRecognition(userId, sessionId);

      return res.status(200).json({
        success: true,
        message: 'Configuración para reconocimiento de voz en tiempo real establecida',
        sessionId
      });
    } catch (error) {
      console.error('Error al configurar reconocimiento de voz en tiempo real:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al configurar el reconocimiento de voz en tiempo real',
        error: error.message
      });
    }
  },

  // Convertir texto a voz
  async textToSpeech(req, res) {
    try {
      const { text, voiceType } = req.body;

      if (!text) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere un texto para convertir a voz' 
        });
      }

      const audioBuffer = await speechService.convertTextToSpeech(text, voiceType);

      // Configurar encabezados para el envío del archivo de audio
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"'
      });

      return res.send(audioBuffer);
    } catch (error) {
      console.error('Error en conversión de texto a voz:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al convertir texto a voz',
        error: error.message
      });
    }
  }
};

module.exports = speechController;
