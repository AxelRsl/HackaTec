/**
 * Middleware de autenticación
 * Nota: Como se solicitó eliminar la funcionalidad de login,
 * este middleware está simplificado y permite acceso anónimo
 */

const authMiddleware = {
  // Middleware para permitir acceso anónimo
  allowAnonymous: (req, res, next) => {
    // Siempre permitir acceso, sin verificación
    req.user = {
      id: 'anonymous',
      role: 'user'
    };
    next();
  }
};

module.exports = authMiddleware;
