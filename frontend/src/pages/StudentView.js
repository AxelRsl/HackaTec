import React, { useState, useEffect, useCallback } from 'react';
import SignLanguageCameraDetection from '../components/SignLanguageCameraDetection';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const StudentView = () => {
  const { 
    connected, 
    reconnect, 
    sessionId 
  } = useSocket();
  const navigate = useNavigate();
  
  const [translationResults, setTranslationResults] = useState([]);
  const [error, setError] = useState(null);
  const [teacherText, setTeacherText] = useState('');

  // Reconectar si es necesario
  useEffect(() => {
    if (!connected) {
      reconnect();
    }
  }, [connected, reconnect]);

  // Configurar los listeners de socket para recibir resultados
  useEffect(() => {
    const { socket } = useSocket();
    
    if (!socket) return;

    // Listener para resultados de traducción
    const handleSignLanguageResult = (data) => {
      setTranslationResults(prev => [data, ...prev].slice(0, 10));
    };

    // Listener para recibir animaciones de lenguaje de señas
    const handleSignLanguageAnimation = (data) => {
      console.log('Animación de señas recibida:', data);
      // Mostrar el texto original que envió el profesor
      setTeacherText(data.originalText);
    };

    // Listener para mensajes de texto
    const handleTextMessage = (data) => {
      setTeacherText(data.text);
    };

    // Listener para errores
    const handleError = (data) => {
      console.error('Error del socket:', data);
      setError(data.message || 'Ocurrió un error en la comunicación');
    };

    // Registrar listeners
    socket.on('sign_language_result', handleSignLanguageResult);
    socket.on('sign_language_animation', handleSignLanguageAnimation);
    socket.on('text_message', handleTextMessage);
    socket.on('error', handleError);

    // Limpiar listeners al desmontar
    return () => {
      socket.off('sign_language_result', handleSignLanguageResult);
      socket.off('sign_language_animation', handleSignLanguageAnimation);
      socket.off('text_message', handleTextMessage);
      socket.off('error', handleError);
    };
  }, []);

  // Manejar resultados de detección
  const handleDetectionResult = useCallback((result) => {
    // Puedes procesar o mostrar algo adicional con los resultados locales si es necesario
    console.log('Detección local:', result);
  }, []);

  // Compartir el enlace de la sesión
  const shareSessionLink = () => {
    if (!sessionId) return;
    
    const sessionUrl = `${window.location.origin}/teacher?session=${sessionId}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(sessionUrl)
      .then(() => {
        alert('Enlace copiado al portapapeles. Compártelo con el profesor.');
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alert(`Enlace para el profesor: ${sessionUrl}`);
      });
  };

  return (
    <div className="student-view">
      <h1>Vista del Estudiante</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="session-info">
        <p>
          Estado de conexión: <strong>{connected ? 'Conectado' : 'Desconectado'}</strong>
        </p>
        {sessionId && (
          <div className="session-details">
            <p>Sesión activa: {sessionId}</p>
            <button className="button" onClick={shareSessionLink}>
              Compartir enlace de sesión
            </button>
          </div>
        )}
      </div>

      <div className="detection-container">
        <h2>Detección de lenguaje de señas</h2>
        <SignLanguageCameraDetection 
          onDetectionResult={handleDetectionResult}
        />
      </div>

      <div className="translation-results">
        <h2>Resultados de traducción</h2>
        {translationResults.length > 0 ? (
          <div className="results-list">
            {translationResults.map((result, index) => (
              <div key={index} className="result-item">
                <p className="result-text">{result.accumulatedText}</p>
                <p className="result-confidence">
                  Confianza: {(result.confidence * 100).toFixed(1)}%
                </p>
                <p className="result-time">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results">
            No hay resultados de traducción todavía. Inicia la detección para comenzar.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentView;
