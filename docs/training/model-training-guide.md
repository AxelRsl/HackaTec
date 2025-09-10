# Guía para Entrenar un Modelo de Reconocimiento de Lenguaje de Señas

Este documento describe cómo entrenar un modelo personalizado para reconocimiento de lenguaje de señas utilizando TensorFlow.js y MediaPipe.

## Requisitos previos

- Node.js y npm instalados
- Python 3.6+ para preprocesamiento de datos (opcional)
- Conjunto de datos de lenguaje de señas (ver sección de recursos)

## Opciones para desarrollar el reconocimiento de lenguaje de señas

### 1. Utilizar modelos pre-entrenados (Enfoque actual de la aplicación)

La aplicación actualmente utiliza el modelo `handpose` de TensorFlow.js, que detecta puntos clave (landmarks) de las manos. Este modelo no reconoce lenguaje de señas directamente, pero proporciona la posición de 21 puntos en la mano, que luego podemos usar para identificar gestos específicos mediante reglas o clasificadores adicionales.

### 2. Entrenar un modelo personalizado

Para mejorar la precisión y ampliar el vocabulario de señas reconocidas, puedes entrenar un modelo personalizado.

## Proceso de entrenamiento de un modelo personalizado

### 1. Recolección de datos

1. **Crear un conjunto de datos:**
   - Graba videos de diferentes personas realizando señas específicas
   - Asegúrate de tener diversidad en términos de iluminación, fondos y personas
   - Ideal: 50-100 ejemplos por seña

2. **Preprocesar los datos:**
   - Utiliza MediaPipe o Handpose para extraer los landmarks de las manos
   - Guarda las coordenadas normalizadas (x, y, z) de cada landmark

```javascript
// Ejemplo de código para extracción de landmarks con TensorFlow.js Handpose
const video = document.querySelector('video');
const model = await handpose.load();
const predictions = await model.estimateHands(video);

if (predictions.length > 0) {
  const landmarks = predictions[0].landmarks;
  // Guardar landmarks (21 puntos con coordenadas x, y, z)
  saveLandmarks(landmarks, 'nombre-de-la-seña');
}
```

### 2. Preparación del conjunto de datos

1. **Normalizar los datos:**
   - Centrar las coordenadas respecto a la muñeca
   - Escalar para que sean invariantes al tamaño de la mano
   - Aplanar los landmarks en un vector de características (21 puntos * 3 coordenadas = 63 características)

2. **Dividir en conjuntos de entrenamiento y validación:**
   - 80% entrenamiento, 20% validación es una división común

### 3. Entrenar el modelo

#### Opción A: Modelo simple (clasificador)

Para un conjunto pequeño de señas estáticas:

```javascript
// Crear un modelo de clasificación con TensorFlow.js
const model = tf.sequential();
model.add(tf.layers.dense({
  inputShape: [63],  // 21 landmarks * 3 (x,y,z)
  units: 128,
  activation: 'relu'
}));
model.add(tf.layers.dropout(0.2));
model.add(tf.layers.dense({
  units: 64,
  activation: 'relu'
}));
model.add(tf.layers.dense({
  units: numClasses,  // Número de señas a reconocer
  activation: 'softmax'
}));

// Compilar el modelo
model.compile({
  optimizer: tf.train.adam(),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Entrenar el modelo
await model.fit(trainData, trainLabels, {
  epochs: 50,
  batchSize: 32,
  validationData: [valData, valLabels],
  callbacks: tf.callbacks.earlyStopping({ patience: 10 })
});

// Guardar el modelo
await model.save('file://./model');
```

#### Opción B: Modelo para gestos dinámicos (LSTM)

Para señas que implican movimiento:

```javascript
const model = tf.sequential();
model.add(tf.layers.lstm({
  inputShape: [sequenceLength, 63],  // Secuencia de landmarks
  units: 128,
  returnSequences: false
}));
model.add(tf.layers.dense({
  units: 64,
  activation: 'relu'
}));
model.add(tf.layers.dense({
  units: numClasses,
  activation: 'softmax'
}));

// El resto es similar a la opción A
```

### 4. Evaluar y mejorar el modelo

1. **Evaluar con datos de prueba:**
   - Medir precisión, recall, F1-score
   - Crear una matriz de confusión para identificar señas problemáticas

2. **Técnicas de mejora:**
   - Aumentar datos (pequeñas rotaciones, traslaciones)
   - Ajustar hiperparámetros
   - Usar técnicas de regularización (dropout, early stopping)
   - Agregar más datos para señas con baja precisión

### 5. Exportar e integrar el modelo

1. **Exportar el modelo:**
   ```javascript
   await model.save('file://./model');
   // o para uso en navegador
   await model.save('downloads://sign-language-model');
   ```

2. **Integrar en la aplicación:**
   ```javascript
   const model = await tf.loadLayersModel('path/to/model.json');
   // Usar el modelo para predecir
   const prediction = model.predict(preprocessedLandmarks);
   ```

## Recursos útiles

1. **Conjuntos de datos:**
   - [MS-ASL Dataset](https://www.microsoft.com/en-us/research/project/ms-asl/)
   - [ASL Lexicon Video Dataset](https://www.bu.edu/asllrp/av/dai-asllvd.html)

2. **Herramientas:**
   - [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
   - [TensorFlow.js Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
   - [TensorFlow.js](https://www.tensorflow.org/js)

3. **Tutoriales:**
   - [TensorFlow.js Sign Language Recognition Tutorial](https://www.tensorflow.org/js/tutorials)
   - [MediaPipe Hands Tutorial](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)

## Alternativa: Utilizar OpenCV para detección de gestos

Si prefieres un enfoque más tradicional de visión por computadora:

```python
import cv2
import numpy as np

# Inicializar cámara
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
        
    # Convertir a escala de grises
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Aplicar desenfoque gaussiano
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Detectar bordes
    edges = cv2.Canny(blur, 50, 150)
    
    # Encontrar contornos
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filtrar contornos por área para encontrar manos
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 1000 < area < 10000:  # Ajustar según sea necesario
            # Calcular momentos de la imagen
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10']/M['m00'])
                cy = int(M['m01']/M['m00'])
                
                # Dibujar contorno y centro
                cv2.drawContours(frame, [cnt], 0, (0, 255, 0), 2)
                cv2.circle(frame, (cx, cy), 7, (255, 0, 0), -1)
    
    # Mostrar resultado
    cv2.imshow('Hand Detection', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Conclusión

El entrenamiento de un modelo de reconocimiento de lenguaje de señas efectivo requiere una combinación de datos de calidad, preprocesamiento adecuado y una arquitectura de modelo apropiada. La aplicación actualmente utiliza un enfoque basado en reglas con el modelo handpose, pero para mayor precisión y vocabulario más amplio, se recomienda entrenar un modelo personalizado siguiendo los pasos descritos anteriormente.

Para la implementación inicial, el enfoque actual es suficiente y te permitirá reconocer gestos básicos con una configuración mínima.
