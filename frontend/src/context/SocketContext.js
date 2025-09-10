import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Inicializar la conexión socket automáticamente
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(`${SOCKET_URL}/interpreter`, {
      transports: ['websocket'],
      autoConnect: true // Conectar automáticamente
    });

    // Configurar eventos del socket
    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setConnected(true);
      
      // Crear sesión automáticamente al conectar
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      // Unirse a la sesión automáticamente
      socketInstance.emit('join_session', {
        sessionId: newSessionId,
        role: window.location.pathname.includes('teacher') ? 'teacher' : 'student'
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket desconectado');
      setConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Error de socket:', error);
    });

    // Guardar la instancia de socket
    setSocket(socketInstance);

    // Función de limpieza al desmontar
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Función para reconectar si es necesario
  const reconnect = () => {
    if (socket && !connected) {
      socket.connect();
    }
  };

  // Función para generar un ID de sesión aleatorio
  const generateSessionId = () => {
    return `session_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Emitir un frame de video para reconocimiento
  const emitVideoFrame = (frameData) => {
    if (!socket || !connected) {
      console.error('No hay conexión de socket');
      return false;
    }

    socket.emit('sign_language_frame', {
      sessionId,
      frameData,
      timestamp: new Date().toISOString()
    });

    return true;
  };

  // Emitir audio para reconocimiento
  const emitSpeechAudio = (audioData) => {
    if (!socket || !connected) {
      console.error('No hay conexión de socket');
      return false;
    }

    socket.emit('speech_audio', {
      sessionId,
      audioData,
      timestamp: new Date().toISOString()
    });

    return true;
  };

  // Emitir mensaje de texto
  const sendTextMessage = (text) => {
    if (!socket || !connected) {
      console.error('No hay conexión de socket');
      return false;
    }

    socket.emit('text_message', {
      sessionId,
      text,
      timestamp: new Date().toISOString()
    });

    return true;
  };

  const value = {
    socket,
    connected,
    sessionId,
    reconnect,
    emitVideoFrame,
    emitSpeechAudio,
    sendTextMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
