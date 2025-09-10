# Intérprete para Personas Sordomudas en Tiempo Real

Este proyecto es un intérprete bidireccional para facilitar la comunicación entre personas sordomudas y personas oyentes, permitiendo la traducción en tiempo real entre lenguaje de señas y lenguaje natural.

## Características principales

- **Detección de lenguaje de señas en tiempo real**: Utiliza la cámara para reconocer gestos y traducirlos a texto.
- **Reconocimiento de voz**: Captura la voz del profesor y la traduce a lenguaje de señas.
- **Comunicación bidireccional**: Permite que ambas partes se comuniquen de manera fluida.
- **Interfaz adaptada**: Diferentes vistas para personas sordomudas y para profesores.
- **Comunicación en tiempo real**: Utiliza WebSockets para una experiencia sin retrasos.

## Estructura del proyecto

El proyecto está dividido en dos partes principales:

### Backend

```
backend/
├── src/
│   ├── config/        # Configuración (base de datos, variables de entorno)
│   ├── controllers/   # Controladores para manejar peticiones HTTP
│   ├── models/        # Modelos de datos para MongoDB
│   ├── routes/        # Rutas de la API REST
│   ├── services/      # Servicios para reconocimiento de señas, voz y traducción
│   └── server.js      # Punto de entrada del servidor
├── .env.example       # Ejemplo de variables de entorno
└── package.json       # Dependencias del backend
```

### Frontend

```
frontend/
├── src/
│   ├── assets/        # Imágenes, videos y otros recursos
│   ├── components/    # Componentes reutilizables
│   ├── store/         # Estado global de la aplicación (Vuex/Pinia)
│   ├── views/         # Vistas principales
│   ├── services/      # Servicios para comunicación con backend
│   ├── utils/         # Utilidades (helpers, formatters)
│   ├── plugins/       # Plugins de Vue.js
│   ├── App.vue        # Componente principal
│   └── main.js        # Punto de entrada
├── public/            # Archivos públicos
└── package.json       # Dependencias del frontend
```

## Tecnologías utilizadas

### Backend
- Node.js con Express
- Socket.io para comunicación en tiempo real
- MongoDB para almacenamiento de datos
- TensorFlow.js para modelos de ML
- @tensorflow-models/handpose para detección de landmarks
- OpenCV para procesamiento avanzado de imágenes

### Frontend
- Vue.js para interfaz de usuario escalable y multiplataforma
- Socket.io-client para comunicación en tiempo real
- TensorFlow.js (browser) para modelos ML en cliente
- @tensorflow-models/handpose para detección de puntos clave de manos
- Web Speech API para reconocimiento de voz

## Configuración e instalación

### Requisitos previos
- Node.js (v14 o superior)
- MongoDB
- NPM o Yarn

### Instalación e inicio de la aplicación

1. Clonar el repositorio
   ```
   git clone https://github.com/AxelRsl/HackaTec.git
   cd HackaTec
   ```

2. Instalar todas las dependencias (backend y frontend)
   ```
   npm run install-all
   ```

3. Iniciar la aplicación completa (backend y frontend)
   ```
   npm run dev
   ```

Con estos comandos, tanto el servidor backend como el frontend se iniciarán automáticamente en puertos disponibles.

#### Configuración adicional (opcional)

Si deseas configurar variables de entorno específicas para el backend, puedes crear un archivo `.env` en la carpeta `backend/` con el siguiente contenido:
   ```
   PORT=5050
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   ```
### Comandos disponibles para desarrollo

Una vez instalada la aplicación con los pasos anteriores, puedes usar estos comandos:

#### Para iniciar toda la aplicación (frontend y backend)
   ```
   npm run dev
   ```

#### Para compilar el frontend para producción (opcional)
   ```
   cd frontend
   npm run build
   ```

### Detalles del inicio rápido

Cuando ejecutas `npm run dev` desde la raíz del proyecto:

1. Primero, instala todas las dependencias desde la raíz del proyecto:
   ```
   npm run install-all
   ```

2. Desde la raíz del proyecto, ejecuta:
   ```
   npm run dev
   ```
   
Este comando iniciará automáticamente el servidor backend y frontend en puertos disponibles. Por defecto, intentará usar el puerto 5050 para el backend y 8080 para el frontend, pero si están ocupados, seleccionará automáticamente puertos alternativos.

Si deseas especificar puertos concretos, puedes configurar variables de entorno:
   ```
   # En Windows PowerShell
   $env:BACKEND_PORT=5500; $env:FRONTEND_PORT=3000; npm run dev
   
   # En CMD de Windows
   set BACKEND_PORT=5500 && set FRONTEND_PORT=3000 && npm run dev
   ```

El script muestra las URLs exactas para acceder a los servicios una vez iniciados.

## Flujo de la aplicación

1. La persona sordomuda abre la aplicación y automáticamente se inicia una sesión.
2. El sistema genera un enlace de sesión que puede compartir con el profesor.
3. La persona sordomuda utiliza el lenguaje de señas frente a la cámara inmediatamente.
4. El sistema detecta y traduce los gestos a texto en tiempo real.
5. El profesor recibe la traducción como texto en su pantalla.
6. El profesor puede responder hablando o escribiendo directamente.
7. El sistema traduce la respuesta del profesor a lenguaje de señas.
8. La persona sordomuda ve la animación correspondiente a lo que dice el profesor sin necesidad de autenticación.

## Consideraciones de seguridad y privacidad

- Los datos de video no se almacenan permanentemente.
- Las comunicaciones son cifradas.
- Cada sesión genera un ID único para la comunicación entre el profesor y la persona sordomuda.

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## Contribuciones

Las contribuciones son bienvenidas. Por favor, crea un fork del proyecto y envía un pull request con tus mejoras.

## Entrenamiento del modelo

Para detalles sobre el entrenamiento del modelo de reconocimiento de lenguaje de señas utilizando TensorFlow y OpenCV, consulta la documentación específica en [docs/training/model-training-guide.md](docs/training/model-training-guide.md).

La guía incluye:

- Recolección y preprocesamiento de datos para lenguaje de señas
- Métodos para entrenar un modelo personalizado usando TensorFlow.js
- Opciones para implementar modelos simples o avanzados (LSTM)
- Alternativas usando OpenCV para detección de gestos

## Contacto

Para más información o soporte, contacta a [tu-email@example.com](mailto:tu-email@example.com).
