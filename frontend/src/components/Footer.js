import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Intérprete de Lenguaje de Señas</h4>
          <p>Facilitando la comunicación bidireccional en tiempo real</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces rápidos</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/student">Vista persona sordomuda</a></li>
            <li><a href="/teacher">Vista profesor</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Recursos</h4>
          <ul>
            <li><a href="/docs/ENTRENAMIENTO-MODELO.md" target="_blank">Documentación del modelo</a></li>
            <li><a href="https://github.com/tensorflow/tfjs-models/tree/master/handpose" target="_blank">TensorFlow.js HandPose</a></li>
            <li><a href="https://mediapipe.dev/" target="_blank">MediaPipe</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Intérprete de Lenguaje de Señas. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
