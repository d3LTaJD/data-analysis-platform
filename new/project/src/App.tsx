import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Footer from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { RoleAnalysis } from './pages/RoleAnalysis';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-main-gradient text-white overflow-x-hidden">
              <ParticleBackground />
              
              <div className="relative z-10">
                <Header />
                <main>
                  <Hero />
                  <Features />
                  <Testimonials />
                  <About />
                </main>
                <Footer />
              </div>
            </div>
          } />
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          <Route path="/analyze/:roleId" element={
            <AuthGuard>
              <RoleAnalysis />
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;