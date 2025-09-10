<template>
  <div class="sign-language-detector">
    <div class="video-container">
      <video ref="video" class="webcam" autoplay muted playsinline></video>
      <canvas ref="canvas" class="overlay"></canvas>
    </div>
    <div class="detection-results">
      <h3>Detección en tiempo real</h3>
      <div class="detected-sign">{{ detectedText }}</div>
    </div>
    <div class="speech-to-sign">
      <h3>Habla al lenguaje de señas</h3>
      <div class="controls">
        <button @click="startRecording" :disabled="isRecording">Empezar a hablar</button>
        <button @click="stopRecording" :disabled="!isRecording">Detener</button>
      </div>
      <div class="speech-text">{{ speechText }}</div>
    </div>
  </div>
</template>

<script>
// Importamos los paquetes necesarios pero comentamos el que no se usa para evitar errores ESLint
// import * as tf from '@tensorflow/tfjs'; // Comentado para evitar error de no uso
import * as handpose from '@tensorflow-models/handpose';
import { io } from 'socket.io-client';

export default {
  name: 'SignLanguageDetection',
  data() {
    return {
      model: null,
      camera: null,
      socket: null,
      isModelLoaded: false,
      isRecording: false,
      detectedText: 'Esperando detección...',
      speechText: '',
      recognition: null,
      hands: []
    }
  },
  async mounted() {
    // Conectar al socket del servidor backend
    this.socket = io(process.env.VUE_APP_BACKEND_URL || 'http://localhost:3000');
    
    this.socket.on('connect', () => {
      console.log('Conectado al servidor de Socket.IO');
    });
    
    this.socket.on('translatedText', (data) => {
      this.detectedText = data.text;
    });
    
    // Configurar reconocimiento de voz si está disponible
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';
      
      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        this.speechText = transcript;
        this.socket.emit('speechToSign', { text: transcript });
      };
    }
    
    await this.loadModel();
    await this.setupCamera();
    this.detectHands();
  },
  beforeUnmount() {
    if (this.camera) {
      this.camera.stop();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.recognition) {
      this.recognition.stop();
    }
  },
  methods: {
    async loadModel() {
      try {
        console.log('Cargando modelo de detección de manos...');
        this.model = await handpose.load();
        console.log('Modelo cargado exitosamente');
        this.isModelLoaded = true;
      } catch (error) {
        console.error('Error al cargar el modelo:', error);
      }
    },
    async setupCamera() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Tu navegador no soporta acceso a la cámara web');
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        });
        
        video.srcObject = stream;
        
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resolve();
          };
        });
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
      }
    },
    async detectHands() {
      if (!this.isModelLoaded) return;
      
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      
      const detectFrame = async () => {
        if (this.model && video.readyState === 4) {
          try {
            // Detectar manos
            const predictions = await this.model.estimateHands(video);
            
            // Limpiar el canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar las manos detectadas
            if (predictions.length > 0) {
              this.hands = predictions;
              
              // Emitir la posición de las manos al servidor para interpretación
              this.socket.emit('handData', { 
                landmarks: predictions[0].landmarks,
                timestamp: new Date().getTime()
              });
              
              // Dibujar puntos en las manos
              this.drawHand(ctx, predictions[0].landmarks);
            }
          } catch (error) {
            console.error('Error al detectar manos:', error);
          }
        }
        
        requestAnimationFrame(detectFrame);
      };
      
      detectFrame();
    },
    drawHand(ctx, landmarks) {
      // Dibujar los puntos de la mano
      for (let i = 0; i < landmarks.length; i++) {
        // Desestructuramos solo las coordenadas x e y que necesitamos (z es la profundidad y no la usamos en 2D)
        const [x, y] = landmarks[i];
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Conectar los puntos de la mano con líneas
      const fingerPairs = [
        // Pulgar
        [0, 1], [1, 2], [2, 3], [3, 4],
        // Índice
        [0, 5], [5, 6], [6, 7], [7, 8],
        // Medio
        [0, 9], [9, 10], [10, 11], [11, 12],
        // Anular
        [0, 13], [13, 14], [14, 15], [15, 16],
        // Meñique
        [0, 17], [17, 18], [18, 19], [19, 20],
        // Palma
        [0, 5], [5, 9], [9, 13], [13, 17]
      ];
      
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      
      for (let pair of fingerPairs) {
        ctx.beginPath();
        ctx.moveTo(landmarks[pair[0]][0], landmarks[pair[0]][1]);
        ctx.lineTo(landmarks[pair[1]][0], landmarks[pair[1]][1]);
        ctx.stroke();
      }
    },
    startRecording() {
      if (this.recognition) {
        this.isRecording = true;
        this.recognition.start();
      } else {
        alert('El reconocimiento de voz no está disponible en este navegador');
      }
    },
    stopRecording() {
      if (this.recognition) {
        this.isRecording = false;
        this.recognition.stop();
      }
    }
  }
}
</script>

<style scoped>
.sign-language-detector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.video-container {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.webcam, .overlay {
  width: 100%;
  max-width: 640px;
  height: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
}

.detection-results, .speech-to-sign {
  width: 100%;
  margin: 10px 0;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.detected-sign, .speech-text {
  min-height: 50px;
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 18px;
}

.controls {
  margin: 15px 0;
}

button {
  padding: 10px 15px;
  margin-right: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

h3 {
  margin: 5px 0;
  color: #333;
}
</style>
