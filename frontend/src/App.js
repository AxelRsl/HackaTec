import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import StudentView from './pages/StudentView';
import TeacherView from './pages/TeacherView';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentView />} />
          <Route path="/teacher" element={<TeacherView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
