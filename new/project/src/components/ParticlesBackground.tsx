import React from 'react';

const ParticlesBackground: React.FC = () => {
  return (
    <div className="dynamic-particles">
      {/* Additional floating elements for enhanced visual appeal */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-float-3d"></div>
      <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-purple-400/50 rounded-full animate-float-3d" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-green-400/70 rounded-full animate-float-3d" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-blue-400/40 rounded-full animate-float-3d" style={{ animationDelay: '6s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/80 rounded-full animate-float-3d" style={{ animationDelay: '8s' }}></div>
      
      {/* Larger floating orbs */}
      <div className="absolute top-1/6 right-1/6 w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-float-3d blur-sm" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/6 left-1/6 w-6 h-6 bg-gradient-to-r from-purple-500/20 to-green-500/20 rounded-full animate-float-3d blur-sm" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-2/3 left-1/2 w-10 h-10 bg-gradient-to-r from-green-500/15 to-blue-500/15 rounded-full animate-float-3d blur-sm" style={{ animationDelay: '5s' }}></div>
    </div>
  );
};

export default ParticlesBackground; 