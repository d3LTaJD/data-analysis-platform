import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, Shield, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Next-Gen AI Analytics</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="block text-white mb-2">
                  Data
                </span>
                <span className="block text-primary-400">
                  Intelligence
                </span>
                <span className="block text-white text-4xl md:text-5xl lg:text-6xl mt-2">
                  Platform
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Unlock the power of your data with our revolutionary AI-driven analytics platform. 
              Transform raw information into strategic insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link 
                to="/dashboard" 
                className="group bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 text-lg"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <button 
                onClick={() => {
                  const videoElement = document.querySelector('video');
                  if (videoElement) {
                    videoElement.play();
                  }
                }}
                className="group flex items-center space-x-3 text-white hover:text-orange-400 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-orange-400/20 transition-colors duration-300">
                  <Play className="h-5 w-5 ml-1" />
                </div>
                <span className="text-lg font-medium">Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-gray-400 text-sm">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Demo Video */}
          <div className="relative">
            {/* Video Container */}
            <div className="bg-gradient-to-br from-white/15 to-white/8 backdrop-blur-xl border border-white/25 rounded-2xl p-6 shadow-2xl">
              {/* Video Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-secondary-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div className="text-white/60 text-sm">DataWhiz Demo</div>
              </div>

              {/* Video Player */}
              <div className="relative group cursor-pointer">
                {/* Video Placeholder */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-video">
                  {/* Placeholder for your video - replace src="" with your video URL */}
                  <video 
                    className="w-full h-full object-cover"
                    poster="/demo-poster.jpg"
                    preload="metadata"
                  >
                    <source src="" type="video/mp4" />
                    <source src="" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>DataWhiz Platform Demo</span>
                        <span>2:45</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                        <div className="bg-primary-400 h-1 rounded-full w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Features List */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 text-white/80 text-sm">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>AI-Powered Analytics</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/80 text-sm">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                    <span>Real-Time Dashboards</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/80 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>Role-Specific Workflows</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-secondary-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gray-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 