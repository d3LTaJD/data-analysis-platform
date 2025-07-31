import React from 'react';
import { Database, CheckCircle } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    'Role-specific analytics workflows',
    'AI-powered insights and recommendations',
    'Enterprise-grade security and privacy',
    'Seamless data import and export'
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-white">
              About DataWhiz
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Empowering data professionals with intelligent analytics solutions
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-primary-400 mb-8">
              Our Mission
            </h3>
            
            <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
              <p>
                Founded in 2024, DataWhiz was created to bridge the gap between complex 
                data science and practical business insights. Our team of data scientists, 
                engineers, and UX designers work together to make advanced analytics 
                accessible to everyone.
              </p>
              
              <p>
                DataWhiz democratizes data analytics by providing specialized workflows for 
                different roles. Whether you're a business analyst, marketer, or researcher, 
                our platform adapts to your needs.
              </p>
            </div>

            {/* Features List */}
            <div className="mt-10 space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300 text-lg font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="bg-primary-600/20 rounded-2xl p-12 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center h-64">
                <Database className="h-32 w-32 text-cyan-400" />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full opacity-15 animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 -left-6 w-4 h-4 bg-orange-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 