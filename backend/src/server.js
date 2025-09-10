require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const { connectToDatabase } = require('./config/database');
const apiRoutes = require('./routes');

// Inicializar aplicación Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Conectar a la base de datos
connectToDatabase();

// Rutas API
app.use('/api', apiRoutes);

// Socket.io para comunicación en tiempo real
require('./services/socketService')(io);

// Ruta principal
app.get('/', (req, res) => {
  res.send('API del intérprete para sordomudos funcionando correctamente');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = { app, server };
