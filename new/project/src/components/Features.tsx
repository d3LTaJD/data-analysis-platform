import React from 'react';
import { BarChart3, Zap, Shield, Globe, Brain, Rocket, Lock, Users } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms that automatically detect patterns and provide actionable recommendations.',
      color: 'bg-purple-500',
      gradient: 'bg-purple-500/20'
    },
    {
      icon: Rocket,
      title: 'Real-Time Analytics',
      description: 'Monitor your data in real-time with instant updates and live dashboards that never sleep.',
      color: 'bg-secondary-500',
      gradient: 'bg-secondary-500/20'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
      color: 'bg-red-500',
      gradient: 'bg-red-500/20'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built-in collaboration tools with role-based access control and shared workspaces.',
      color: 'bg-primary-500',
      gradient: 'bg-primary-500/20'
    },
    {
      icon: BarChart3,
      title: 'Advanced Visualizations',
      description: 'Create stunning charts, graphs, and interactive dashboards with our powerful visualization engine.',
      color: 'bg-secondary-500',
      gradient: 'bg-secondary-500/20'
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      description: 'Your data stays yours with end-to-end encryption and complete control over your information.',
      color: 'bg-emerald-500',
      gradient: 'bg-emerald-500/20'
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Core Features</span>
          </div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              <span className="text-white">
                Everything You Need
              </span>
            </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Powerful tools designed for modern data teams. From AI insights to real-time collaboration.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative ${feature.gradient} backdrop-blur-sm border border-white/15 rounded-2xl p-8 hover:border-white/25 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl`}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Corner Accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 ${feature.color} rounded-bl-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-2">Ready to get started?</h3>
              <p className="text-gray-300">Join thousands of teams already using DataWhiz</p>
            </div>
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 