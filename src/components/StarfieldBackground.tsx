import React, { useEffect, useRef } from 'react';

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      initStars();
    };

    window.addEventListener('resize', handleResize);

    interface Star {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
      hasSpike: boolean;
    }

    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
      color: string;
    }

    let stars: Star[] = [];
    // Deep starry palette: icy blue, warm gold, delicate lavender, pure star white, soft rose
    const colors = ['#ffffff', '#fde68a', '#c7d2fe', '#e0e7ff', '#fed7aa', '#fbcfe8', '#93c5fd'];

    const initStars = () => {
      stars = [];
      // Dense rich starry sky
      const starCount = Math.floor((width * height) / 2800);
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.75;
        const radius = Math.random() < 0.85
          ? Math.random() * 1.1 + 0.4
          : Math.random() * 2.2 + 1.2;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.006) * (Math.random() < 0.5 ? 1 : -1),
          color: colors[Math.floor(Math.random() * colors.length)],
          hasSpike: radius > 2.2 && Math.random() < 0.4,
        });
      }
    };

    initStars();

    let shootingStars: ShootingStar[] = [
      { x: 0, y: 0, length: 140, speed: 14, angle: Math.PI / 4, opacity: 0, active: false, color: '#fde68a' },
      { x: 0, y: 0, length: 110, speed: 12, angle: Math.PI / 3.8, opacity: 0, active: false, color: '#93c5fd' },
    ];

    const triggerShootingStar = (idx: number) => {
      const s = shootingStars[idx];
      if (s.active) return;
      s.x = Math.random() * (width * 0.85) + (width * 0.1);
      s.y = Math.random() * (height * 0.35);
      s.length = 100 + Math.random() * 90;
      s.speed = 12 + Math.random() * 9;
      s.opacity = 1;
      s.active = true;
    };

    const shootingInterval = setInterval(() => {
      if (Math.random() > 0.35) {
        triggerShootingStar(Math.random() < 0.5 ? 0 : 1);
      }
    }, 6500);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Deep rich night-sky gradient background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030611');
      skyGrad.addColorStop(0.4, '#060a1d');
      skyGrad.addColorStop(0.75, '#050714');
      skyGrad.addColorStop(1, '#020308');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient celestial dust clouds (Milky Way glow)
      const nebula1 = ctx.createRadialGradient(width * 0.25, height * 0.3, 10, width * 0.25, height * 0.3, width * 0.48);
      nebula1.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      nebula1.addColorStop(0.6, 'rgba(56, 189, 248, 0.03)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.75, height * 0.65, 10, width * 0.75, height * 0.65, width * 0.45);
      nebula2.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
      nebula2.addColorStop(0.5, 'rgba(236, 72, 153, 0.03)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Render twinkling stars
      for (const s of stars) {
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.98 || s.alpha < 0.15) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, s.alpha));
        ctx.fill();

        // Soft halo glow on larger stars
        if (s.radius > 1.6) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.25;
          ctx.fill();
        }

        // Cross diffraction spikes on rare brightest stars
        if (s.hasSpike && s.alpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = (s.alpha - 0.4) * 0.6;
          const spikeLen = s.radius * 4;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
        }
      }

      // Render active shooting stars
      for (const s of shootingStars) {
        if (s.active) {
          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const starGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          starGrad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
          starGrad.addColorStop(0.25, `rgba(251, 191, 36, ${s.opacity * 0.8})`);
          starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = starGrad;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();

          // Bright head sparkle
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.opacity -= 0.014;

          if (s.opacity <= 0 || s.x > width + 50 || s.y > height + 50) {
            s.active = false;
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(shootingInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
