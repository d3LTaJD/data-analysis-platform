import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X, Sparkles, BarChart3 } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  onNavigate?: (sectionId: string) => void;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showBackButton = false, 
  onNavigate, 
  isMenuOpen = false, 
  onMenuToggle 
}) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-professional"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="p-3 rounded-xl bg-[rgba(79,70,229,0.1)] hover:bg-[rgba(79,70,229,0.2)] transition-all duration-300 border border-[rgba(79,70,229,0.3)]"
              >
                <ArrowLeft className="w-5 h-5 text-[#4f46e5]" />
              </motion.button>
            )}
            
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
                <img 
                src="/mind-map.png" 
                  alt="DataWhiz Logo" 
                className="w-12 h-12 object-contain"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Logo loaded successfully');
                  }}
                />
              
              <div className="flex flex-col">
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  DataWhiz
                </motion.span>
                <span className="text-xs text-[#d1d5db] -mt-1">Analytics Platform</span>
              </div>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(59, 130, 246, 0.1))"
                }}
                onClick={() => onNavigate?.(item.id)}
                className="nav-professional font-medium text-base px-4 py-2 rounded-lg transition-all duration-300"
              >
                {item.label}
              </motion.button>
            ))}
            
            <motion.button 
              className="btn-primary group px-6 py-3"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(79, 70, 229, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Start Analyzing
              </span>
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="md:hidden p-3 rounded-xl bg-[rgba(79,70,229,0.1)] hover:bg-[rgba(79,70,229,0.2)] transition-all duration-300 border border-[rgba(79,70,229,0.3)]"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[#4f46e5]" />
            ) : (
              <Menu className="w-6 h-6 text-[#4f46e5]" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-professional border-t border-[rgba(255,255,255,0.1)] mt-4"
          >
            <div className="py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  onClick={() => onNavigate?.(item.id)}
                  className="block w-full text-left px-6 py-3 text-[#d1d5db] hover:text-[#4f46e5] transition-all duration-300 rounded-xl hover:bg-[rgba(79,70,229,0.1)] text-base font-medium"
                >
                  {item.label}
                </motion.button>
              ))}
              
              <div className="px-6 pt-6">
                <motion.button 
                  className="btn-primary w-full group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Start Analyzing
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};