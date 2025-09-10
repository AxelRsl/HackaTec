import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const TeacherView = () => {
  const { 
    connected, 
    reconnect, 
    sessionId,
    sendTextMessage 
  } = useSocket();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [isSpeechDetectionActive, setIsSpeechDetectionActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Estado para reconocimiento de voz
  const [recognition, setRecognition] = useState(null);

  // Inicializar reconocimiento de voz si está disponible
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.warn("Reconocimiento de voz no soportado en este navegador");
      return;
    }
    
    // Crear instancia de reconocimiento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configurar reconocimiento
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'es-ES';
    
    // Manejar resultados
    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        // Enviar el texto final al servidor
        sendTextMessage(finalTranscript);
          
        // Agregar a los mensajes locales
        setMessages(prev => [
          {
            text: finalTranscript,
            fromUser: 'teacher',
            timestamp: new Date()
          },
          ...prev
        ]);
      }
      
      // Actualizar transcripción en curso
      setTranscript(interimTranscript);
    };
    
    // Manejar errores
    recognitionInstance.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setError(`Error en reconocimiento de voz: ${event.error}`);
      setIsSpeechDetectionActive(false);
    };
    
    // Guardar instancia
    setRecognition(recognitionInstance);
    
    // Limpiar al desmontar
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  // Reconectar si es necesario
  useEffect(() => {
    if (!connected) {
      reconnect();
    }
  }, [connected, reconnect]);

  // Configurar los listeners de socket
  useEffect(() => {
    const { socket } = useSocket();
    
    if (!socket) return;

    // Listener para recibir mensajes de texto
    const handleTextMessage = (data) => {
      // Solo agregar si no es un mensaje propio
      if (data.fromUserId !== currentUser?.id) {
        setMessages(prev => [
          {
            text: data.text,
            fromUser: data.fromUserId,
            timestamp: new Date(data.timestamp)
          },
          ...prev
        ]);
      }
    };

    // Listener para recibir resultados de lenguaje de señas
    const handleSignLanguageResult = (data) => {
      if (data.isCompleteSentence) {
        setMessages(prev => [
          {
            text: data.accumulatedText,
            fromUser: 'sign-language',
            timestamp: new Date(data.timestamp),
            confidence: data.confidence
          },
          ...prev
        ]);
      }
    };

    // Listener para errores
    const handleError = (data) => {
      console.error('Error del socket:', data);
      setError(data.message || 'Ocurrió un error en la comunicación');
    };

    // Registrar listeners
    socket.on('text_message', handleTextMessage);
    socket.on('sign_language_result', handleSignLanguageResult);
    socket.on('error', handleError);

    // Limpiar listeners al desmontar
    return () => {
      socket.off('text_message', handleTextMessage);
      socket.off('sign_language_result', handleSignLanguageResult);
      socket.off('error', handleError);
    };
  }, [useSocket, currentUser]);

  // Función para enviar mensaje de texto
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    if (sessionId && currentUser) {
      sendTextMessage(inputText.trim(), currentUser.id);
      
      // Limpiar input
      setInputText('');
    } else {
      setError('No hay sesión activa. No se puede enviar el mensaje.');
    }
  };

  // Función para iniciar/detener reconocimiento de voz
  const toggleSpeechRecognition = () => {
    if (!recognition) {
      setError('Reconocimiento de voz no disponible en este navegador');
      return;
    }
    
    if (isSpeechDetectionActive) {
      // Detener reconocimiento
      recognition.stop();
      setIsSpeechDetectionActive(false);
      setTranscript('');
    } else {
      // Iniciar reconocimiento
      try {
        recognition.start();
        setIsSpeechDetectionActive(true);
        setError(null);
      } catch (err) {
        console.error('Error al iniciar reconocimiento de voz:', err);
        setError('Error al iniciar reconocimiento de voz');
      }
    }
  };

  // Compartir el enlace de la sesión
  const shareSessionLink = () => {
    if (!sessionId) return;
    
    const sessionUrl = `${window.location.origin}/student?session=${sessionId}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(sessionUrl)
      .then(() => {
        alert('Enlace copiado al portapapeles. Compártelo con la persona sordomuda.');
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alert(`Enlace para compartir: ${sessionUrl}`);
      });
  };

  return (
    <div className="teacher-view">
      <h1>Vista del Profesor</h1>
      
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

      <div className="communication-container">
        <h2>Comunicación</h2>
        
        <div className="speech-recognition">
          <button 
            className={`button ${isSpeechDetectionActive ? 'active' : ''}`} 
            onClick={toggleSpeechRecognition}
          >
            {isSpeechDetectionActive ? 'Detener micrófono' : 'Iniciar micrófono'}
          </button>
          
          {isSpeechDetectionActive && (
            <div className="transcript-container">
              <p className="transcript-label">Hablando:</p>
              <p className="transcript">{transcript || '...'}</p>
            </div>
          )}
        </div>
        
        <div className="text-input">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="button" onClick={handleSendMessage}>
            Enviar
          </button>
        </div>
        
        <div className="messages-container">
          <h3>Mensajes</h3>
          {messages.length > 0 ? (
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message-item ${msg.fromUser === currentUser?.id ? 'sent' : 'received'}`}
                >
                  <p className="message-text">{msg.text}</p>
                  <p className="message-meta">
                    {msg.fromUser === 'sign-language' ? 'Lenguaje de señas' : 
                      msg.fromUser === currentUser?.id ? 'Tú' : 'Estudiante'}
                    {' '}
                    {new Date(msg.timestamp).toLocaleTimeString()}
                    {msg.confidence && ` (${(msg.confidence * 100).toFixed(1)}%)`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-messages">
              No hay mensajes todavía. Envía un mensaje o utiliza el micrófono para comenzar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherView;
