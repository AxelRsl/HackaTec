const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Iniciando la aplicación de interpretación de lenguaje de señas...');

// Configuración de puertos con opciones alternativas para evitar conflictos
const BACKEND_PORTS = [5050, 5051, 5052, 5053, 5054]; // Puertos alternativos para el backend
const FRONTEND_PORTS = [8080, 8081, 8082, 8083, 8084]; // Puertos alternativos para el frontend

// Usar los puertos especificados en las variables de entorno o los primeros de la lista
const BACKEND_PORT = process.env.BACKEND_PORT || BACKEND_PORTS[0];
const FRONTEND_PORT = process.env.FRONTEND_PORT || FRONTEND_PORTS[0];

// Función para comprobar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // El puerto está en uso
      } else {
        resolve(false); // Otro error
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // El puerto está libre
    });
    
    server.listen(port);
  });
}

// Función para encontrar un puerto libre
async function findFreePort(preferredPort, alternativePorts) {
  // Primero intentamos con el puerto preferido
  if (!(await isPortInUse(preferredPort))) {
    return preferredPort;
  }
  
  // Si está ocupado, probamos con los alternativos
  console.log(`⚠️ Puerto ${preferredPort} ya está en uso, buscando alternativa...`);
  
  for (const port of alternativePorts) {
    if (!(await isPortInUse(port))) {
      console.log(`✅ Usando puerto alternativo: ${port}`);
      return port;
    }
  }
  
  // Si todos están ocupados, usamos un puerto aleatorio
  const randomPort = Math.floor(Math.random() * 10000) + 10000; // Puerto entre 10000 y 20000
  console.log(`⚠️ Todos los puertos predefinidos están en uso. Usando puerto aleatorio: ${randomPort}`);
  return randomPort;
}

// Rutas a los directorios del proyecto
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

// Verificar que las carpetas existan
if (!fs.existsSync(backendPath)) {
  console.error(`Error: No se encontró la carpeta backend en ${backendPath}`);
  process.exit(1);
}

if (!fs.existsSync(frontendPath)) {
  console.error(`Error: No se encontró la carpeta frontend en ${frontendPath}`);
  process.exit(1);
}

// Función para iniciar un proceso con npm
function startProcess(name, dir, command, env = {}) {
  console.log(`Iniciando ${name}...`);
  
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';
  
  // Combinar variables de entorno
  const processEnv = {
    ...process.env,
    ...env
  };
  
  const proc = spawn(npmCommand, [command], { 
    cwd: dir,
    stdio: 'inherit',
    shell: true,
    env: processEnv
  });
  
  proc.on('error', (error) => {
    console.error(`Error al iniciar ${name}:`, error.message);
  });
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`${name} se cerró con código de error ${code}`);
    } else {
      console.log(`${name} se cerró correctamente`);
    }
  });
  
  return proc;
}

// Función para iniciar los servicios
async function startServices() {
  try {
    // Encontrar puertos libres
    const actualBackendPort = await findFreePort(BACKEND_PORT, BACKEND_PORTS.slice(1));
    const actualFrontendPort = await findFreePort(FRONTEND_PORT, FRONTEND_PORTS.slice(1));
    
    // Iniciar el backend con puerto libre encontrado
    const backendProcess = startProcess('backend', backendPath, 'run dev', {
      PORT: actualBackendPort
    });
    
    // Iniciar el frontend con puerto libre encontrado y apuntando al backend
    const frontendProcess = startProcess('frontend', frontendPath, 'run serve', {
      VUE_APP_BACKEND_URL: `http://localhost:${actualBackendPort}`,
      PORT: actualFrontendPort
    });
    
    console.log('\nAplicación iniciada con éxito!');
    console.log(`Backend: http://localhost:${actualBackendPort}`);
    console.log(`Frontend: http://localhost:${actualFrontendPort}`);
    console.log('\nPresiona Ctrl+C para detener todos los procesos.');
    
    // Manejar la señal de terminación para cerrar ambos procesos
    process.on('SIGINT', () => {
      console.log('\nDeteniendo todos los procesos...');
      
      if (backendProcess) {
        backendProcess.kill();
      }
      
      if (frontendProcess) {
        frontendProcess.kill();
      }
      
      process.exit(0);
    });
  } catch (error) {
    console.error('Error al iniciar los servicios:', error);
    process.exit(1);
  }
}

// Iniciar los servicios
startServices();
// El manejo de señales se ha movido a la función startServices
