import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <Router>
        <App />
      </Router>
    </SocketProvider>
  </React.StrictMode>
);
