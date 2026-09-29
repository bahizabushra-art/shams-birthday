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

    interface ShootingStarSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      color: string;
    }

    interface ShootingStar {
      id: number;
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      fadeRate: number;
      headRadius: number;
      trailWidth: number;
      primaryColor: string;
      tailColor: string;
      active: boolean;
    }

    let stars: Star[] = [];
    const colors = ['#ffffff', '#fde68a', '#c7d2fe', '#e0e7ff', '#fed7aa', '#fbcfe8', '#93c5fd'];

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 2600);
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
          hasSpike: radius > 2.2 && Math.random() < 0.35,
        });
      }
    };

    initStars();

    // Shooting stars pool & spark particles
    let shootingStars: ShootingStar[] = [];
    let sparks: ShootingStarSpark[] = [];
    let nextShootingStarId = 1;

    const meteorColorPalettes = [
      { head: '#ffffff', mid: '#fde68a', tail: 'rgba(251, 191, 36, 0)' }, // Warm Golden
      { head: '#ffffff', mid: '#93c5fd', tail: 'rgba(129, 140, 248, 0)' }, // Celestial Cyan
      { head: '#ffffff', mid: '#e9d5ff', tail: 'rgba(216, 180, 254, 0)' }, // Lavender Starlight
      { head: '#ffffff', mid: '#fbcfe8', tail: 'rgba(244, 114, 182, 0)' }, // Soft Rose
      { head: '#ffffff', mid: '#ffffff', tail: 'rgba(224, 231, 255, 0)' }, // Pure Diamond
    ];

    const spawnShootingStar = () => {
      // Pick random origin: top, top-left, or top-right
      const palette = meteorColorPalettes[Math.floor(Math.random() * meteorColorPalettes.length)];
      
      const startX = Math.random() < 0.6
        ? Math.random() * (width * 0.75) + width * 0.05
        : Math.random() * (width * 0.4);
      
      const startY = Math.random() * (height * 0.35);

      // Angle: graceful diagonal descent (~30deg to ~55deg)
      const angle = (Math.PI / 4) + (Math.random() * 0.35 - 0.17);
      const speed = 11 + Math.random() * 9;
      const length = 110 + Math.random() * 110;

      shootingStars.push({
        id: nextShootingStarId++,
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        opacity: 1,
        fadeRate: 0.012 + Math.random() * 0.008,
        headRadius: 2.2 + Math.random() * 1.2,
        trailWidth: 1.8 + Math.random() * 1.4,
        primaryColor: palette.head,
        tailColor: palette.mid,
        active: true,
      });

      // 18% chance of a twin shooting star trailing nearby!
      if (Math.random() < 0.18) {
        setTimeout(() => {
          shootingStars.push({
            id: nextShootingStarId++,
            x: startX + (Math.random() * 70 - 35),
            y: Math.max(10, startY - 20),
            length: length * 0.8,
            speed: speed * 1.05,
            angle: angle + (Math.random() * 0.06 - 0.03),
            opacity: 0.9,
            fadeRate: 0.014,
            headRadius: 2,
            trailWidth: 1.5,
            primaryColor: palette.head,
            tailColor: palette.mid,
            active: true,
          });
        }, 180 + Math.random() * 250);
      }
    };

    // Trigger occasional randomized shooting stars (every 2.5s - 5.5s)
    let timeoutId: number;
    const scheduleNextShootingStar = () => {
      const nextDelay = 2200 + Math.random() * 3200;
      timeoutId = window.setTimeout(() => {
        spawnShootingStar();
        scheduleNextShootingStar();
      }, nextDelay);
    };

    // Spawn an initial star shortly after load
    const initialTimer = window.setTimeout(() => {
      spawnShootingStar();
      scheduleNextShootingStar();
    }, 1200);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Deep celestial midnight background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030611');
      skyGrad.addColorStop(0.4, '#060a1d');
      skyGrad.addColorStop(0.75, '#050714');
      skyGrad.addColorStop(1, '#020308');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient celestial dust clouds
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

      // Render static background twinkling stars
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

        // Soft halo on brighter stars
        if (s.radius > 1.6) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.22;
          ctx.fill();
        }

        // Cross diffraction flare on brightest stars
        if (s.hasSpike && s.alpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = (s.alpha - 0.4) * 0.6;
          const spikeLen = s.radius * 3.8;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
        }
      }

      // Render falling stardust sparks from shooting star trails
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= 0.024;

        if (spark.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = spark.alpha;
        ctx.fill();
      }

      // Render active shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        // Glowing streak gradient
        const streakGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        streakGrad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        streakGrad.addColorStop(0.2, s.tailColor);
        streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = s.trailWidth;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Glowing outer head halo
        const headAura = ctx.createRadialGradient(s.x, s.y, 0.5, s.x, s.y, s.headRadius * 3.5);
        headAura.addColorStop(0, `rgba(255, 255, 255, ${s.opacity * 0.9})`);
        headAura.addColorStop(0.5, `rgba(253, 230, 138, ${s.opacity * 0.4})`);
        headAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = headAura;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.headRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright sparkling core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Emit ember sparks along streak
        if (Math.random() < 0.6) {
          sparks.push({
            x: s.x - Math.cos(s.angle) * (Math.random() * s.length * 0.4),
            y: s.y - Math.sin(s.angle) * (Math.random() * s.length * 0.4),
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() * 0.8) + 0.3,
            alpha: s.opacity * 0.8,
            size: Math.random() * 1.5 + 0.6,
            color: s.tailColor,
          });
        }

        // Advance movement
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= s.fadeRate;

        if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
          s.active = false;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(initialTimer);
      clearTimeout(timeoutId);
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
