const signLanguageService = require('../services/signLanguageService');

// Controlador para reconocimiento de lenguaje de señas
const signLanguageController = {
  // Reconocer lenguaje de señas desde un archivo de video
  async recognizeSignLanguage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo de video' });
      }

      const videoPath = req.file.path;
      const result = await signLanguageService.processVideoFile(videoPath);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en el reconocimiento de lenguaje de señas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el lenguaje de señas',
        error: error.message
      });
    }
  },

  // Reconocer lenguaje de señas desde un stream de video en tiempo real
  async recognizeSignLanguageStream(req, res) {
    try {
      // Esta función solo establece la configuración inicial
      // La comunicación real se realizará a través de websockets
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere sessionId para iniciar el reconocimiento en tiempo real' 
        });
      }

      // Configurar la sesión para el reconocimiento en tiempo real
      await signLanguageService.setupRealtimeRecognition(sessionId);

      return res.status(200).json({
        success: true,
        message: 'Configuración para reconocimiento en tiempo real establecida',
        sessionId
      });
    } catch (error) {
      console.error('Error al configurar reconocimiento en tiempo real:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al configurar el reconocimiento en tiempo real',
        error: error.message
      });
    }
  },

  // Obtener la lista de gestos/señas disponibles en el sistema
  async getAvailableGestures(req, res) {
    try {
      const gestures = await signLanguageService.getAvailableGestures();
      
      return res.status(200).json({
        success: true,
        data: gestures
      });
    } catch (error) {
      console.error('Error al obtener gestos disponibles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener gestos disponibles',
        error: error.message
      });
    }
  }
};

module.exports = signLanguageController;
