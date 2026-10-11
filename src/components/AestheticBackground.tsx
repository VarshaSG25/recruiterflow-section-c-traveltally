import React, { useEffect, useRef, useState } from 'react';
import { Plane, Palette } from 'lucide-react';

export const AestheticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgStyle, setBgStyle] = useState<'deep' | 'cosmic'>('deep');
  const [showParticles, setShowParticles] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // If particles are turned off, clear canvas and exit early
    if (!showParticles) {
      ctx.clearRect(0, 0, width, height);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // 3D/2D Floating Travel & Geometry Particles
    interface Particle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      type: 'dot' | 'plane' | 'star';
      angle: number;
      spinSpeed: number;
    }

    const colors = [
      'rgba(192, 132, 252, ', // light violet
      'rgba(168, 85, 247, ',  // electric purple
      'rgba(232, 121, 249, ', // fuchsia / magenta highlight
      'rgba(126, 34, 206, ',  // royal deep violet
    ];

    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35 - 0.2, // gently drift upward
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        type: i % 6 === 0 ? 'plane' : i % 4 === 0 ? 'star' : 'dot',
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    // Function to draw origami paper plane with 3D shaded wings
    const drawPaperPlane = (c: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, alpha: number) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);

      // Left wing (lighter shade)
      c.fillStyle = `rgba(216, 180, 254, ${alpha * 0.4})`;
      c.strokeStyle = `rgba(232, 121, 249, ${alpha})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, -size * 2);
      c.lineTo(-size * 1.6, size * 1.6);
      c.lineTo(0, size * 0.7);
      c.closePath();
      c.fill();
      c.stroke();

      // Right wing (darker shade for 3D depth)
      c.fillStyle = `rgba(147, 51, 234, ${alpha * 0.25})`;
      c.beginPath();
      c.moveTo(0, -size * 2);
      c.lineTo(size * 1.6, size * 1.6);
      c.lineTo(0, size * 0.7);
      c.closePath();
      c.fill();
      c.stroke();

      // Center fold spine
      c.strokeStyle = `rgba(245, 208, 254, ${alpha * 0.9})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, -size * 2);
      c.lineTo(0, size * 0.7);
      c.stroke();

      c.restore();
    };

    // Main render loop
    let time = 0;
    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Connect near dots with luminous geometric flight lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw each particle
      for (const p of particles) {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        p.angle += p.spinSpeed;

        // Wrap around boundaries
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;

        const pulse = Math.sin(time + p.x) * 0.2 + 0.8;
        const currentAlpha = p.alpha * pulse;

        if (p.type === 'plane') {
          drawPaperPlane(ctx, p.x, p.y, p.size * 2.3, p.angle, currentAlpha);
        } else if (p.type === 'star') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.strokeStyle = `${p.color}${currentAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-p.size * 1.6, 0);
          ctx.lineTo(p.size * 1.6, 0);
          ctx.moveTo(0, -p.size * 1.6);
          ctx.lineTo(0, p.size * 1.6);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(192, 132, 252, 0.7)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showParticles]);

  return (
    <>
      {/* 1. Background Visual Layers (z-0, strictly behind all content) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Uploaded Deep Purple Velvet Geometry Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-105"
          style={{
            backgroundImage: 'url(/aesthetic-bg.jpg)',
            filter: bgStyle === 'deep' 
              ? 'brightness(0.72) contrast(1.22) saturate(1.15)' 
              : 'brightness(1.08) contrast(1.35) saturate(1.5)',
            opacity: bgStyle === 'deep' ? 0.88 : 0.98,
          }}
        />

        {/* Velvet Radial Vignette Overlays matching image palette */}
        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            background: bgStyle === 'deep'
              ? `
                radial-gradient(ellipse at 50% 15%, rgba(147, 51, 234, 0.25) 0%, transparent 60%),
                radial-gradient(circle at 10% 20%, rgba(192, 132, 252, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(88, 28, 135, 0.35) 0%, transparent 60%),
                linear-gradient(180deg, rgba(11, 5, 20, 0.55) 0%, rgba(11, 5, 20, 0.92) 100%)
              `
              : `
                radial-gradient(ellipse at 50% 15%, rgba(217, 70, 239, 0.35) 0%, transparent 60%),
                radial-gradient(circle at 15% 25%, rgba(192, 132, 252, 0.28) 0%, transparent 45%),
                radial-gradient(circle at 85% 75%, rgba(168, 85, 247, 0.45) 0%, transparent 60%),
                linear-gradient(180deg, rgba(17, 6, 32, 0.35) 0%, rgba(11, 5, 20, 0.78) 100%)
              `,
          }}
        />

        {/* Interactive Floating Canvas with 3D Travel Wireframes & Airplanes */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* 2. Floating Visual Controls Overlay (z-50, topmost layer above all pages & tables) */}
      <aside 
        className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#130626]/95 backdrop-blur-2xl border border-purple-400/40 shadow-2xl shadow-purple-950/90 text-xs transition-all"
        aria-label="Background visual controls"
      >
        {/* Toggle 3D Planes & Travel Lines */}
        <button
          type="button"
          onClick={() => setShowParticles(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none active:scale-95 ${
            showParticles 
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-900/60 border border-purple-300/40' 
              : 'bg-purple-950/70 text-purple-300 hover:text-white border border-purple-500/25 hover:bg-purple-900/40'
          }`}
          title="Toggle 3D Floating Planes & Constellation flight routes"
        >
          <Plane className={`w-3.5 h-3.5 ${showParticles ? 'text-white animate-pulse' : 'text-purple-400'}`} />
          <span>{showParticles ? '3D Visuals: ON' : '3D Visuals: OFF'}</span>
        </button>

        {/* Toggle Background Theme Mood */}
        <button
          type="button"
          onClick={() => setBgStyle(prev => prev === 'deep' ? 'cosmic' : 'deep')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none active:scale-95 ${
            bgStyle === 'cosmic'
              ? 'bg-fuchsia-600/30 text-fuchsia-200 border border-fuchsia-400/50 hover:bg-fuchsia-600/40 shadow-md shadow-fuchsia-950/60'
              : 'bg-purple-950/70 text-purple-200 border border-purple-500/30 hover:text-white hover:bg-purple-900/50'
          }`}
          title="Toggle between Deep Velvet and Cosmic Glow background moods"
        >
          <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>{bgStyle === 'deep' ? 'Deep Mood' : 'Cosmic Mood'}</span>
        </button>
      </aside>
    </>
  );
};
