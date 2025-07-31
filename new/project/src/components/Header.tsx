import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Auth from './Auth';
import AdminPanel from './AdminPanel';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('Element found, scrolling...');
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.log('Element not found:', sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/', action: () => window.location.href = '/', isLink: true },
    { name: 'Features', href: '#features', action: () => scrollToSection('features'), isLink: false },
    { name: 'About', href: '#about', action: () => scrollToSection('about'), isLink: false },
    { name: 'Contact', href: '#contact', action: () => scrollToSection('contact'), isLink: false }
  ];

  const handleLogin = (token: string, userData: any) => {
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/40 backdrop-blur-md border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 -ml-8">
            <img 
              src="/mind-map.png" 
              alt="DataWhiz Logo" 
              className="h-12 w-12 object-contain"
            />
            <span className="text-3xl font-bold text-white tracking-tight">DataWhiz</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isLink ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white/80 hover:text-white transition-all duration-200 text-base font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="text-white/80 hover:text-white transition-all duration-200 text-base font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-200 group-hover:w-full"></span>
                </button>
              )
            ))}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80 text-sm">Welcome, {user.username}</span>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-accent-400 transition-colors p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-md border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                item.isLink ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg"
                  >
                    {item.name}
                  </button>
                )
              ))}
              {isAuthenticated && user ? (
                <div className="px-3 py-3 space-y-2">
                  <div className="text-white/80 text-sm">Welcome, {user.username}</div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuth(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 bg-primary-600 text-white font-medium rounded-lg"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {showAuth && (
        <Auth onLogin={handleLogin} onClose={() => setShowAuth(false)} />
      )}
      
      {showAdminPanel && user && (
        <AdminPanel 
          onClose={() => setShowAdminPanel(false)} 
          token={localStorage.getItem('token') || ''} 
        />
      )}
    </header>
  );
};

export default Header; 