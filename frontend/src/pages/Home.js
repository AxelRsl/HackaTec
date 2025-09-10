import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Intérprete en Tiempo Real para Lenguaje de Señas</h1>
        <p className="subtitle">
          Comunicación bidireccional entre personas sordomudas y oyentes sin barreras
        </p>
        
        <div className="action-buttons">
          <Link to="/student" className="button primary">
            Soy persona sordomuda
          </Link>
          <Link to="/teacher" className="button secondary">
            Soy oyente/profesor
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Características principales</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Reconocimiento en tiempo real</h3>
            <p>Detección inmediata de lenguaje de señas a través de la cámara web</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔊</div>
            <h3>Reconocimiento de voz</h3>
            <p>Traduce automáticamente lo que dice el profesor a lenguaje de señas</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Sin demoras</h3>
            <p>Comunicación fluida y sin retrasos significativos</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Acceso directo</h3>
            <p>Sin necesidad de registro o instalación, usa directamente desde el navegador</p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2>¿Cómo funciona?</h2>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Selecciona tu rol: persona sordomuda o profesor</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <p>Comparte el enlace de tu sesión con la otra persona</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <p>¡Comienza a comunicarte inmediatamente!</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>¿Listo para comenzar?</h2>
        <div className="action-buttons">
          <Link to="/student" className="button primary">
            Iniciar como persona sordomuda
          </Link>
          <Link to="/teacher" className="button secondary">
            Iniciar como profesor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
