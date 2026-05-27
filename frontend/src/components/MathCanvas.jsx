import React, { useRef, useEffect } from 'react';

export default function MathCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mathematical symbols that will float in the background
    const symbols = ['∫', '∑', 'λ', 'θ', 'π', '∞', 'lim', 'dx', 'dy/dx', '∇', '√', 'α', 'β', 'γ', 'f(x)', '矩阵'];
    const particles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        text: symbols[Math.floor(Math.random() * symbols.length)],
        fontSize: Math.floor(Math.random() * 16) + 12,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.25 + 0.05
      });
    }

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // Draw mathematical coordinate grids
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw animated Sine Wave (e.g. y = sin(x)) representing wave math
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const centerY = canvas.height * 0.5;
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * 0.003 + time) * 120 + Math.cos(x * 0.001 - time * 0.5) * 40;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw second overlapping wave (representing interference)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * 0.005 - time * 0.7) * 80 + Math.sin(x * 0.002 + time * 0.3) * 60;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw floating math symbols
      particles.forEach((p) => {
        ctx.font = `${p.fontSize}px 'Orbitron', monospace`;
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.fillText(p.text, p.x, p.y);

        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
