import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  driftX: number;
  driftY: number;
  driftSpeed: number;
  color: string;
  type: 'particle' | 'geometric';
  rotation: number;
  rotationSpeed: number;
}

interface GeometricShape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  driftX: number;
  driftY: number;
  driftSpeed: number;
  opacity: number;
  type: 'triangle' | 'square' | 'circle' | 'hexagon';
  color: string;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Colors
    const colors = [
      '#4f46e5', // primary-600
      '#3b82f6', // secondary-500
      '#22c55e', // accent-400
    ];

    // Particles array
    const particles: Particle[] = [];
    const geometricShapes: GeometricShape[] = [];

    // Create particles
    const createParticles = () => {
      particles.length = 0;
      geometricShapes.length = 0;

      // Create fewer, more impactful particles
      const gridSpacing = 150;
      const cols = Math.ceil(canvas.width / gridSpacing) + 1;
      const rows = Math.ceil(canvas.height / gridSpacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: i * gridSpacing + (Math.random() - 0.5) * 40,
            y: j * gridSpacing + (Math.random() - 0.5) * 40,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.3 + 0.1,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.3,
            driftSpeed: Math.random() * 0.15 + 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'particle',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
          });
        }
      }

      // Add floating geometric shapes
      for (let i = 0; i < 8; i++) {
        geometricShapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 40 + 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          driftX: (Math.random() - 0.5) * 0.2,
          driftY: (Math.random() - 0.5) * 0.2,
          driftSpeed: Math.random() * 0.1 + 0.05,
          opacity: Math.random() * 0.05 + 0.02,
          type: ['triangle', 'square', 'circle', 'hexagon'][Math.floor(Math.random() * 4)] as any,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    createParticles();

    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Draw geometric shapes
    const drawGeometricShape = (shape: GeometricShape) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.globalAlpha = shape.opacity;

      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 1;
      ctx.fillStyle = `${shape.color}20`;

      switch (shape.type) {
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -shape.size / 2);
          ctx.lineTo(-shape.size / 2, shape.size / 2);
          ctx.lineTo(shape.size / 2, shape.size / 2);
          ctx.closePath();
          break;
        case 'square':
          ctx.beginPath();
          ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          break;
        case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * shape.size / 2;
            const y = Math.sin(angle) * shape.size / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
      }

      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Draw connecting lines with mouse interaction
    const drawConnections = () => {
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            // Check if mouse is near the line
            const mouseDistance = Math.abs(
              (dy * mouseX - dx * mouseY + otherParticle.x * particle.y - particle.x * otherParticle.y) / distance
            );

            let opacity = (1 - distance / 200) * 0.05;
            if (mouseDistance < 50) {
              opacity *= 2; // Brighten when mouse is near
            }

            ctx.strokeStyle = `#4f46e5${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    };

    // Animate everything
    const animate = () => {
      time += 0.01;
      
      // Clear canvas with gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(17, 24, 39, 0.8)');
      gradient.addColorStop(0.5, 'rgba(31, 41, 55, 0.6)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate geometric shapes
      geometricShapes.forEach(shape => {
        shape.rotation += shape.rotationSpeed;
        shape.x += shape.driftX * shape.driftSpeed;
        shape.y += shape.driftY * shape.driftSpeed;

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        drawGeometricShape(shape);
      });

      // Animate particles
      particles.forEach(particle => {
        particle.rotation += particle.rotationSpeed;
        particle.x += particle.driftX * particle.driftSpeed;
        particle.y += particle.driftY * particle.driftSpeed;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;
        const currentSize = particle.size * (0.8 + pulse * 0.4);

        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(particle.x - mouseX, 2) + Math.pow(particle.y - mouseY, 2)
        );
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 100);
        const finalSize = currentSize * (1 + mouseInfluence * 0.5);
        const finalOpacity = currentOpacity * (1 + mouseInfluence * 0.3);

        // Draw particle glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, finalSize * 4
        );
        gradient.addColorStop(0, `${particle.color}${Math.floor(finalOpacity * 0.4 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${particle.color}${Math.floor(finalOpacity * 0.1 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${particle.color}00`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle core
        ctx.fillStyle = `${particle.color}${Math.floor(finalOpacity * 0.6 * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      drawConnections();

      // Add floating gradient orbs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const orbX = canvas.width * (0.2 + i * 0.3) + Math.sin(time * 0.5 + i) * 100;
        const orbY = canvas.height * (0.3 + i * 0.2) + Math.cos(time * 0.3 + i) * 80;
        const orbSize = 150 + Math.sin(time * 0.2 + i) * 50;
        
        const orbGradient = ctx.createRadialGradient(
          orbX, orbY, 0,
          orbX, orbY, orbSize
        );
        orbGradient.addColorStop(0, `${colors[i]}20`);
        orbGradient.addColorStop(1, `${colors[i]}00`);
        
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 z-0 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse at 25% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 70%),
            linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)
          `
        }}
      />

      {/* Animated particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          filter: 'blur(0.5px)'
        }}
      />
    </div>
  );
};

export default ParticleBackground; 