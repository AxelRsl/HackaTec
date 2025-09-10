const translationService = require('../services/translationService');

// Controlador para servicios de traducción
const translationController = {
  // Traducir texto a lenguaje de señas
  async textToSignLanguage(req, res) {
    try {
      const { text, format = 'video', region = 'es' } = req.body;

      if (!text) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere un texto para traducir a lenguaje de señas' 
        });
      }

      const translationResult = await translationService.translateTextToSignLanguage(text, format, region);

      return res.status(200).json({
        success: true,
        data: translationResult
      });
    } catch (error) {
      console.error('Error al traducir texto a lenguaje de señas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en la traducción a lenguaje de señas',
        error: error.message
      });
    }
  },

  // Traducir lenguaje de señas a texto
  async signLanguageToText(req, res) {
    try {
      const { signData, context, language = 'es' } = req.body;

      if (!signData || !Array.isArray(signData)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requieren datos de señas válidos para traducir a texto' 
        });
      }

      const translationResult = await translationService.translateSignLanguageToText(signData, context, language);

      return res.status(200).json({
        success: true,
        data: translationResult
      });
    } catch (error) {
      console.error('Error al traducir lenguaje de señas a texto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en la traducción de lenguaje de señas a texto',
        error: error.message
      });
    }
  },

  // Optimizar traducción basada en contexto (para mejorar la precisión)
  async optimizeTranslationForContext(req, res) {
    try {
      const { text, context, direction, subject } = req.body;

      if (!text || !context || !direction) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere texto, contexto y dirección de traducción' 
        });
      }

      const optimizedTranslation = await translationService.optimizeTranslationForContext(
        text, context, direction, subject
      );

      return res.status(200).json({
        success: true,
        data: optimizedTranslation
      });
    } catch (error) {
      console.error('Error al optimizar traducción para contexto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al optimizar la traducción',
        error: error.message
      });
    }
  }
};

module.exports = translationController;
