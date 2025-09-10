const userService = require('../services/userService');

// Controlador para usuarios
const userController = {
  // Registrar un nuevo usuario
  async registerUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos los campos son requeridos' 
        });
      }

      const result = await userService.createUser({ name, email, password, role });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          userId: result.userId,
          name: result.name,
          email: result.email,
          role: result.role
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      if (error.code === 11000) { // Error de MongoDB para duplicados
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  },

  // Iniciar sesión de usuario
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email y contraseña son requeridos' 
        });
      }

      const result = await userService.authenticateUser(email, password);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          token: result.token,
          user: {
            userId: result.user.userId,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          }
        }
      });
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      
      if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  },

  // Obtener perfil de usuario - Versión simplificada sin autenticación
  getUserProfile(req, res) {
    try {
      // Obtener usuario anónimo
      const userProfile = userService.getAnonymousUser();

      return res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener perfil de usuario',
        error: error.message
      });
    }
  },

  // Actualizar preferencias de usuario - Versión simplificada
  updateUserPreferences(req, res) {
    try {
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requieren preferencias válidas' 
        });
      }

      // En una implementación real, aquí se guardarían las preferencias
      // Como es anónimo, simplemente devolvemos las preferencias recibidas

      return res.status(200).json({
        success: true,
        message: 'Preferencias actualizadas exitosamente',
        data: {
          preferences: preferences
        }
      });
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar preferencias',
        error: error.message
      });
    }
  }
};

module.exports = userController;
