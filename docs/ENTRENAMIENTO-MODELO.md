## Entrenamiento de modelos para reconocimiento de lenguaje de señas

Para que el sistema funcione correctamente, es necesario entrenar un modelo de machine learning capaz de reconocer gestos en lenguaje de señas. A continuación, se detallan los pasos para entrenar dicho modelo utilizando TensorFlow y OpenCV.

### Recolección de datos

1. **Creación del dataset**:
   - Grabar videos de diferentes personas realizando señas específicas
   - Capturar desde distintos ángulos y con diferentes condiciones de iluminación
   - Incluir variedad de personas (diferentes complexiones, tonos de piel, etc.)

2. **Preprocesamiento con OpenCV**:
   ```python
   import cv2
   import numpy as np
   import os
   
   def preprocess_video(video_path, output_dir, num_frames=30):
       # Crear directorio de salida si no existe
       os.makedirs(output_dir, exist_ok=True)
       
       # Abrir el video
       cap = cv2.VideoCapture(video_path)
       
       # Obtener información del video
       total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
       frame_indices = np.linspace(0, total_frames-1, num_frames, dtype=int)
       
       for i, idx in enumerate(frame_indices):
           # Establecer el frame específico
           cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
           ret, frame = cap.read()
           
           if not ret:
               continue
           
           # Preprocesamiento
           # 1. Convertir a escala de grises para simplificar el análisis
           gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
           
           # 2. Aplicar filtro Gaussiano para reducir ruido
           blurred = cv2.GaussianBlur(gray, (5, 5), 0)
           
           # 3. Detección de bordes para resaltar los contornos
           edges = cv2.Canny(blurred, 50, 150)
           
           # 4. Segmentación de la mano usando umbralización adaptativa
           thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                         cv2.THRESH_BINARY_INV, 11, 2)
           
           # Guardar los frames procesados
           cv2.imwrite(f"{output_dir}/frame_{i:03d}.jpg", thresh)
       
       cap.release()
   ```

3. **Extracción de landmarks con MediaPipe**:
   ```python
   import mediapipe as mp
   import cv2
   import numpy as np
   import json
   
   def extract_hand_landmarks(image_path):
       mp_hands = mp.solutions.hands
       
       # Configurar el detector de manos
       with mp_hands.Hands(
           static_image_mode=True,
           max_num_hands=2,
           min_detection_confidence=0.5) as hands:
           
           # Leer y procesar la imagen
           image = cv2.imread(image_path)
           image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
           
           # Detectar manos
           results = hands.process(image_rgb)
           
           landmarks_data = []
           
           # Extraer landmarks si se detectaron manos
           if results.multi_hand_landmarks:
               for hand_landmarks in results.multi_hand_landmarks:
                   # Extraer coordenadas de los 21 puntos de la mano
                   landmarks = []
                   for point in hand_landmarks.landmark:
                       landmarks.append({
                           'x': point.x,
                           'y': point.y,
                           'z': point.z
                       })
                   landmarks_data.append(landmarks)
           
           return landmarks_data
   ```

### Preparación del dataset para entrenamiento

1. **Organización de datos**:
   - Estructurar los datos en carpetas por categoría de seña
   - Dividir en conjuntos de entrenamiento, validación y prueba (70%-15%-15%)

2. **Generación de secuencias temporales**:
   ```python
   def create_sequence_dataset(landmarks_dir, labels, sequence_length=30):
       sequences = []
       labels_list = []
       
       for label_idx, label in enumerate(labels):
           landmark_files = sorted(os.listdir(f"{landmarks_dir}/{label}"))
           
           # Agrupar archivos en secuencias
           for i in range(0, len(landmark_files) - sequence_length + 1):
               sequence = []
               for j in range(sequence_length):
                   with open(f"{landmarks_dir}/{label}/{landmark_files[i+j]}", 'r') as f:
                       landmarks = json.load(f)
                   
                   # Aplanar los landmarks en un vector
                   flat_landmarks = []
                   for hand in landmarks:
                       for point in hand:
                           flat_landmarks.extend([point['x'], point['y'], point['z']])
                   
                   # Si no se detectaron manos, rellenar con ceros
                   if not flat_landmarks:
                       flat_landmarks = [0] * (21 * 3 * 2)  # 21 puntos, 3 coords, max 2 manos
                   
                   sequence.append(flat_landmarks)
               
               sequences.append(sequence)
               labels_list.append(label_idx)
       
       return np.array(sequences), np.array(labels_list)
   ```

### Entrenamiento del modelo con TensorFlow

1. **Arquitectura del modelo LSTM para secuencias de gestos**:
   ```python
   import tensorflow as tf
   from tensorflow.keras.models import Sequential
   from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization

   def create_lstm_model(input_shape, num_classes):
       model = Sequential([
           LSTM(64, return_sequences=True, activation='relu', input_shape=input_shape),
           BatchNormalization(),
           Dropout(0.2),
           LSTM(128, return_sequences=True, activation='relu'),
           BatchNormalization(),
           Dropout(0.2),
           LSTM(64, activation='relu'),
           BatchNormalization(),
           Dense(64, activation='relu'),
           Dropout(0.2),
           Dense(num_classes, activation='softmax')
       ])
       
       model.compile(
           optimizer='Adam',
           loss='sparse_categorical_crossentropy',
           metrics=['accuracy']
       )
       
       return model
   ```

2. **Entrenamiento**:
   ```python
   # Crear y entrenar el modelo
   model = create_lstm_model((sequence_length, num_features), num_classes)
   
   # Callbacks para mejorar el entrenamiento
   callbacks = [
       tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
       tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=0.0001)
   ]
   
   # Entrenar
   history = model.fit(
       X_train, y_train,
       epochs=50,
       batch_size=32,
       validation_data=(X_val, y_val),
       callbacks=callbacks
   )
   
   # Evaluar
   test_loss, test_acc = model.evaluate(X_test, y_test)
   print(f"Precisión en test: {test_acc}")
   
   # Guardar el modelo
   model.save('sign_language_model')
   # Convertir a TensorFlow.js
   !tensorflowjs_converter --input_format=keras sign_language_model ./tfjs_model
   ```

### Integración con la aplicación

1. **Carga del modelo en TensorFlow.js**:
   ```javascript
   import * as tf from '@tensorflow/tfjs';

   async function loadModel() {
     try {
       // Cargar el modelo desde la carpeta donde se guardó
       const model = await tf.loadLayersModel('tfjs_model/model.json');
       console.log('Modelo cargado correctamente');
       return model;
     } catch (error) {
       console.error('Error al cargar el modelo:', error);
       throw error;
     }
   }
   ```

2. **Procesamiento de frames en tiempo real**:
   ```javascript
   async function processFrame(handLandmarks, model) {
     try {
       // Convertir landmarks a formato de entrada para el modelo
       const inputData = prepareInputData(handLandmarks);
       
       // Realizar predicción
       const tensor = tf.tensor(inputData);
       const prediction = await model.predict(tensor);
       
       // Obtener la clase con mayor probabilidad
       const result = prediction.dataSync();
       const classIdx = result.indexOf(Math.max(...result));
       
       return {
         class: SIGN_CLASSES[classIdx],
         confidence: result[classIdx]
       };
     } catch (error) {
       console.error('Error al procesar frame:', error);
       throw error;
     }
   }
   ```

### Mejora continua del modelo

1. **Recopilación de feedback**:
   - Implementar un sistema para que los usuarios reporten errores en las traducciones
   - Almacenar secuencias problemáticas para reentrenamiento

2. **Fine-tuning**:
   - Usar transfer learning para adaptar el modelo a nuevos usuarios
   - Implementar aprendizaje online para mejorar con el uso

3. **Ampliación del vocabulario**:
   - Procedimiento para agregar nuevas señas al modelo
   - Estrategia para manejar dialectos regionales del lenguaje de señas

4. **Evaluación periódica**:
   - Métricas de precisión, recall y F1-score por categoría
   - Matriz de confusión para identificar señas problemáticas

Este enfoque combina las capacidades de OpenCV para el preprocesamiento de imágenes con la potencia de MediaPipe para la detección de puntos clave y TensorFlow para el aprendizaje profundo, creando un sistema robusto para el reconocimiento de lenguaje de señas en tiempo real.
