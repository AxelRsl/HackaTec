import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useSocket } from '../context/SocketContext';
import { drawHand } from '../utils/drawingUtils';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

const SignLanguageCameraDetection = ({ onDetectionResult }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { emitVideoFrame, sessionId } = useSocket();
  
  const [model, setModel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState(null);

  // Cargar el modelo de detección de manos
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Cargando modelo de detección de manos...');
        const handModel = await handpose.load();
        console.log('Modelo cargado correctamente');
        setModel(handModel);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el modelo:', err);
        setError('No se pudo cargar el modelo de detección de manos.');
      }
    };

    loadModel();
  }, []);

  // Función para detectar las manos en cada frame
  const detect = async () => {
    if (!model || !webcamRef.current || !canvasRef.current) return;

    // Asegurarse de que el video esté listo
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    // Obtener las propiedades del video
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Configurar dimensiones del canvas para que coincidan con el video
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Realizar la detección
    const startTime = performance.now();
    const hands = await model.estimateHands(video);
    const endTime = performance.now();

    // Calcular FPS (promediar con el valor anterior para suavizar)
    const newFps = 1000 / (endTime - startTime);
    setFps(prevFps => (prevFps + newFps) / 2);

    // Dibujar los resultados en el canvas
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    // Dibujar cada mano detectada
    if (hands && hands.length > 0) {
      hands.forEach(hand => {
        drawHand(hand, ctx);
      });
      
      // Preparar datos para enviar al servidor
      const frameData = {
        hands: hands.map(hand => ({
          landmarks: hand.landmarks,
          handInViewConfidence: hand.handInViewConfidence,
          boundingBox: hand.boundingBox
        })),
        timestamp: new Date().getTime()
      };
      
      // Enviar datos al servidor si hay una sesión activa
      if (sessionId) {
        emitVideoFrame(frameData);
      }
      
      // Notificar al componente padre sobre el resultado
      if (onDetectionResult) {
        onDetectionResult(frameData);
      }
    }

    // Continuar la detección si está activada
    if (isDetecting) {
      requestAnimationFrame(detect);
    }
  };

  // Iniciar/detener la detección
  useEffect(() => {
    let detectionInterval;

    if (isDetecting && model) {
      // Iniciar bucle de detección
      detectionInterval = requestAnimationFrame(detect);
    }

    return () => {
      // Limpiar al desmontar o cuando cambia isDetecting
      if (detectionInterval) {
        cancelAnimationFrame(detectionInterval);
      }
    };
  }, [isDetecting, model, webcamRef, canvasRef]);

  // Función para iniciar la detección
  const startDetection = () => {
    if (!model) {
      setError('El modelo aún no está cargado. Espera un momento.');
      return;
    }
    setIsDetecting(true);
  };

  // Función para detener la detección
  const stopDetection = () => {
    setIsDetecting(false);
  };

  return (
    <div className="sign-language-detection">
      <div className="video-container">
        <Webcam
          ref={webcamRef}
          className="webcam"
          mirrored={true}
          audio={false}
          screenshotFormat="image/jpeg"
        />
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
        />
      </div>
      
      <div className="controls">
        {!isDetecting ? (
          <button 
            className="button start-button" 
            onClick={startDetection}
            disabled={!model}
          >
            Iniciar detección
          </button>
        ) : (
          <button 
            className="button stop-button" 
            onClick={stopDetection}
          >
            Detener detección
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="status">
        <span>Estado: {isDetecting ? 'Detectando' : 'Detenido'}</span>
        {isDetecting && <span>FPS: {fps.toFixed(1)}</span>}
      </div>
    </div>
  );
};

export default SignLanguageCameraDetection;
