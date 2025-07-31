import React from 'react';
import { Database, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'API', 'Documentation'],
    Company: ['About', 'Blog', 'Careers', 'Press Kit'],
    Resources: ['Help Center', 'Tutorials', 'Community', 'Status'],
    Legal: ['Privacy', 'Terms', 'Security', 'Compliance']
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Email' }
  ];

  return (
    <footer id="contact" className="bg-black/40 backdrop-blur-sm border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 -ml-8 mb-6">
              <img 
                src="/mind-map.png" 
                alt="DataWhiz Logo" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-3xl font-bold text-white tracking-tight">DataWhiz</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md text-lg leading-relaxed">
              Transform your data into actionable insights with our AI-powered analytics platform. 
              Built for professionals who demand excellence.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-bold mb-6 text-lg">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-base"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-base">
            © 2024 DataWhiz. All rights reserved.
          </p>
          <div className="flex items-center space-x-8 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary-400 text-base transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 text-base transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 text-base transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 