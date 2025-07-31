import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { roles } from '../data/roles';
import * as Icons from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import Header from '../components/Header';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate(`/analyze/${roleId}`);
  };

  return (
    <div className="min-h-screen bg-main-gradient text-white overflow-x-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 pt-24"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Choose Your Analytics Role
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select the analysis workflow that matches your role and get specialized insights tailored to your needs
            </p>
          </motion.div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {roles.map((role, index) => {
              const IconComponent = Icons[role.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleRoleSelect(role.id)}
                  className="group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors text-white">
                      {role.name}
                    </h3>
                    
                    <p className="text-gray-300 mb-4">
                      {role.description}
                    </p>
                    
                    <div className="mt-auto">
                      <button className="w-full bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
                        Get Started
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-white">Need Help Choosing?</h3>
              <p className="text-gray-300 mb-6">
                Not sure which role fits your needs? Start with General Analysis for a comprehensive overview
              </p>
              <button 
                onClick={() => handleRoleSelect('general')}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300"
              >
                Start with General Analysis
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};