/**
 * Servicio para gestión de usuarios
 * Nota: Como se solicitó eliminar la funcionalidad de login, este servicio es mínimo
 * y solo proporciona funciones básicas para mantener compatibilidad con el código existente
 */

// Este servicio ahora está simplificado ya que se ha eliminado la funcionalidad de login
const userService = {
  // Proporcionar información del usuario anónimo para mantener compatibilidad
  getAnonymousUser: () => {
    return {
      id: 'anonymous',
      username: 'Usuario',
      role: 'user',
      preferences: {
        language: 'es',
        theme: 'light'
      }
    };
  },

  // Verificar sesión - ahora siempre devuelve verdadero
  verifySession: () => {
    return true;
  },

  // Para mantener compatibilidad con el código existente
  createSession: () => {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    return {
      sessionId,
      created: new Date(),
      isValid: true
    };
  }
};

module.exports = userService;
