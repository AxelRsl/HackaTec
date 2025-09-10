const signLanguageService = require('./signLanguageService');
const translationService = require('./translationService');
const speechService = require('./speechService');

// Gestión de sesiones activas
const activeSessions = new Map();

// Configuración del servicio de WebSockets
module.exports = (io) => {
  // Namespace específico para intérprete de señas
  const interpreterNamespace = io.of('/interpreter');
  
  interpreterNamespace.on('connection', (socket) => {
    console.log(`Nueva conexión WebSocket establecida: ${socket.id}`);
    
    // Evento para unirse a una sesión específica
    socket.on('join_session', async (data) => {
      try {
        const { userId, sessionId, role } = data;
        
        if (!userId || !sessionId || !role) {
          socket.emit('error', { message: 'Datos incompletos para unirse a la sesión' });
          return;
        }
        
        // Unir el socket a una sala específica para esta sesión
        socket.join(`session_${sessionId}`);
        
        // Registrar información de la sesión
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, {
            id: sessionId,
            users: new Map(),
            startTime: new Date(),
            lastActivity: new Date()
          });
        }
        
        const session = activeSessions.get(sessionId);
        session.users.set(userId, { 
          socketId: socket.id, 
          role,
          joinedAt: new Date() 
        });
        
        // Notificar a todos los miembros de la sala que un nuevo usuario se ha unido
        socket.to(`session_${sessionId}`).emit('user_joined', { 
          userId, 
          role,
          timestamp: new Date() 
        });
        
        // Confirmar unión exitosa
        socket.emit('session_joined', {
          sessionId,
          activeUsers: [...session.users.keys()]
        });
        
        console.log(`Usuario ${userId} (${role}) unido a la sesión ${sessionId}`);
      } catch (error) {
        console.error('Error al unirse a la sesión:', error);
        socket.emit('error', { message: 'Error al unirse a la sesión' });
      }
    });
    
    // Evento para recibir frames de video en tiempo real (desde persona sordomuda)
    socket.on('sign_language_frame', async (data) => {
      try {
        const { sessionId, frameData, timestamp } = data;
        
        if (!sessionId || !frameData) {
          socket.emit('error', { message: 'Datos de frame incompletos' });
          return;
        }
        
        // Actualizar timestamp de última actividad
        if (activeSessions.has(sessionId)) {
          activeSessions.get(sessionId).lastActivity = new Date();
        }
        
        // Procesar el frame para reconocer lenguaje de señas
        const result = await signLanguageService.processVideoFrame(frameData, sessionId);
        
        // Emitir resultado solo a los usuarios de la sesión
        io.to(`session_${sessionId}`).emit('sign_language_result', {
          ...result,
          timestamp: new Date()
        });
        
        // Si se completó una frase, convertirla a voz para el profesor
        if (result.isCompleteSentence) {
          // Aquí podríamos emitir un evento para reproducir audio en el cliente del profesor
          io.to(`session_${sessionId}`).emit('text_to_speech', {
            text: result.accumulatedText,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error al procesar frame de lenguaje de señas:', error);
        socket.emit('error', { message: 'Error al procesar frame de video' });
      }
    });
    
    // Evento para recibir audio en tiempo real (desde el profesor)
    socket.on('speech_audio', async (data) => {
      try {
        const { sessionId, audioData, timestamp } = data;
        
        if (!sessionId || !audioData) {
          socket.emit('error', { message: 'Datos de audio incompletos' });
          return;
        }
        
        // Actualizar timestamp de última actividad
        if (activeSessions.has(sessionId)) {
          activeSessions.get(sessionId).lastActivity = new Date();
        }
        
        // Procesar el audio para reconocer voz
        const speechResult = await speechService.processSpeechAudio(audioData);
        
        if (speechResult.text) {
          // Traducir el texto a lenguaje de señas (formato de animación)
          const signLanguageAnimation = await translationService.translateTextToSignLanguage(
            speechResult.text, 'animation', 'es'
          );
          
          // Emitir la animación de lenguaje de señas a la persona sordomuda
          io.to(`session_${sessionId}`).emit('sign_language_animation', {
            animation: signLanguageAnimation,
            originalText: speechResult.text,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error al procesar audio de voz:', error);
        socket.emit('error', { message: 'Error al procesar audio' });
      }
    });
    
    // Evento para enviar mensajes de texto (como respaldo o complemento)
    socket.on('text_message', async (data) => {
      try {
        const { sessionId, text, fromUserId } = data;
        
        if (!sessionId || !text || !fromUserId) {
          socket.emit('error', { message: 'Datos de mensaje incompletos' });
          return;
        }
        
        // Actualizar timestamp de última actividad
        if (activeSessions.has(sessionId)) {
          activeSessions.get(sessionId).lastActivity = new Date();
        }
        
        // Emitir mensaje a todos en la sesión
        io.to(`session_${sessionId}`).emit('text_message', {
          text,
          fromUserId,
          timestamp: new Date()
        });
        
        // Si el mensaje es del profesor, traducirlo a lenguaje de señas
        const session = activeSessions.get(sessionId);
        const sender = session?.users.get(fromUserId);
        
        if (sender?.role === 'teacher') {
          // Traducir el texto a lenguaje de señas (formato de animación)
          const signLanguageAnimation = await translationService.translateTextToSignLanguage(
            text, 'animation', 'es'
          );
          
          // Emitir la animación de lenguaje de señas
          io.to(`session_${sessionId}`).emit('sign_language_animation', {
            animation: signLanguageAnimation,
            originalText: text,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error al procesar mensaje de texto:', error);
        socket.emit('error', { message: 'Error al procesar mensaje' });
      }
    });
    
    // Manejo de desconexión
    socket.on('disconnect', () => {
      console.log(`Conexión WebSocket cerrada: ${socket.id}`);
      
      // Buscar y actualizar sesiones donde estaba este socket
      activeSessions.forEach((session, sessionId) => {
        session.users.forEach((user, userId) => {
          if (user.socketId === socket.id) {
            // Eliminar usuario de la sesión
            session.users.delete(userId);
            
            // Notificar a otros en la sesión
            socket.to(`session_${sessionId}`).emit('user_left', { 
              userId,
              timestamp: new Date() 
            });
            
            console.log(`Usuario ${userId} eliminado de la sesión ${sessionId}`);
            
            // Si no quedan usuarios, considerar eliminar la sesión
            if (session.users.size === 0) {
              console.log(`Cerrando sesión vacía ${sessionId}`);
              activeSessions.delete(sessionId);
            }
          }
        });
      });
    });
  });

  // Limpieza periódica de sesiones inactivas (cada 15 minutos)
  setInterval(() => {
    const now = new Date();
    const inactivityThreshold = 15 * 60 * 1000; // 15 minutos en ms
    
    activeSessions.forEach((session, sessionId) => {
      const timeSinceLastActivity = now - session.lastActivity;
      
      if (timeSinceLastActivity > inactivityThreshold) {
        console.log(`Cerrando sesión inactiva ${sessionId}`);
        
        // Notificar a todos los usuarios antes de cerrar
        io.to(`session_${sessionId}`).emit('session_timeout', {
          message: 'Sesión cerrada por inactividad',
          sessionId,
          timestamp: now
        });
        
        activeSessions.delete(sessionId);
      }
    });
  }, 5 * 60 * 1000); // Ejecutar cada 5 minutos
};
