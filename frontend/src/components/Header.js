import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <span className="logo-text">Intérprete de Señas</span>
        </Link>
      </div>
      <nav className="main-nav">
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/student">Persona Sordomuda</Link>
          </li>
          <li>
            <Link to="/teacher">Profesor</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
