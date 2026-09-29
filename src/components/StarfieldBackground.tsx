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

    // Parallax tracking: smooth interpolation
    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
      initNebulae();
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        mouseX = (e as MouseEvent).clientX;
        mouseY = (e as MouseEvent).clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    interface Star {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
      hasSpike: boolean;
      depthLayer: number; // 0 = deep distant, 1 = mid constellation, 2 = foreground brilliant
      parallaxFactor: number;
    }

    interface NebulaCluster {
      xRatio: number;
      yRatio: number;
      radiusRatio: number;
      colorStart: string;
      colorMid: string;
      pulseSpeed: number;
      pulseOffset: number;
      parallaxFactor: number;
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
    let nebulae: NebulaCluster[] = [];
    const colors = ['#ffffff', '#fde68a', '#c7d2fe', '#e0e7ff', '#fed7aa', '#fbcfe8', '#93c5fd'];

    const initNebulae = () => {
      nebulae = [
        // 1. Cosmic Violet Nebula (Deep space left-center)
        {
          xRatio: 0.28,
          yRatio: 0.32,
          radiusRatio: 0.52,
          colorStart: 'rgba(99, 102, 241, 0.09)',
          colorMid: 'rgba(139, 92, 246, 0.035)',
          pulseSpeed: 0.0006,
          pulseOffset: 0,
          parallaxFactor: 0.015,
        },
        // 2. Solar Amber Warm Nebula (Right-center, warming Baby Shams's sky)
        {
          xRatio: 0.74,
          yRatio: 0.62,
          radiusRatio: 0.48,
          colorStart: 'rgba(245, 158, 11, 0.08)',
          colorMid: 'rgba(244, 63, 94, 0.03)',
          pulseSpeed: 0.0008,
          pulseOffset: Math.PI / 2,
          parallaxFactor: 0.025,
        },
        // 3. Celestial Aurora Cyan (Top-right crown)
        {
          xRatio: 0.82,
          yRatio: 0.18,
          radiusRatio: 0.4,
          colorStart: 'rgba(56, 189, 248, 0.07)',
          colorMid: 'rgba(99, 102, 241, 0.025)',
          pulseSpeed: 0.0007,
          pulseOffset: Math.PI,
          parallaxFactor: 0.02,
        },
        // 4. Soft Rose Stardust Veil (Lower-left horizon)
        {
          xRatio: 0.18,
          yRatio: 0.8,
          radiusRatio: 0.44,
          colorStart: 'rgba(236, 72, 153, 0.06)',
          colorMid: 'rgba(168, 85, 247, 0.02)',
          pulseSpeed: 0.0005,
          pulseOffset: (3 * Math.PI) / 2,
          parallaxFactor: 0.018,
        },
      ];
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 2200);

      for (let i = 0; i < starCount; i++) {
        // Divide into 3 distinct depth layers
        const rand = Math.random();
        let depthLayer = 0;
        let radius = 0.5;
        let parallaxFactor = 0.01;
        let hasSpike = false;
        let baseAlpha = 0.2 + Math.random() * 0.4;

        if (rand < 0.6) {
          // Layer 0: Distant micro-stars (deepest cosmic field)
          depthLayer = 0;
          radius = Math.random() * 0.5 + 0.35;
          parallaxFactor = 0.012;
          baseAlpha = 0.2 + Math.random() * 0.45;
        } else if (rand < 0.9) {
          // Layer 1: Mid-distance shimmering stars
          depthLayer = 1;
          radius = Math.random() * 0.8 + 0.8;
          parallaxFactor = 0.028;
          baseAlpha = 0.35 + Math.random() * 0.5;
        } else {
          // Layer 2: Foreground brilliant sparkling stars
          depthLayer = 2;
          radius = Math.random() * 1.3 + 1.6;
          parallaxFactor = 0.06;
          baseAlpha = 0.55 + Math.random() * 0.45;
          hasSpike = radius > 2.0 && Math.random() < 0.5;
        }

        const rx = Math.random() * width;
        const ry = Math.random() * height;

        stars.push({
          x: rx,
          y: ry,
          baseX: rx,
          baseY: ry,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.018 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
          color: colors[Math.floor(Math.random() * colors.length)],
          hasSpike,
          depthLayer,
          parallaxFactor,
        });
      }
    };

    initNebulae();
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
      const palette = meteorColorPalettes[Math.floor(Math.random() * meteorColorPalettes.length)];
      const startX = Math.random() < 0.6
        ? Math.random() * (width * 0.75) + width * 0.05
        : Math.random() * (width * 0.4);
      const startY = Math.random() * (height * 0.35);

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

      // 18% chance of twin meteor
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

    let timeoutId: number;
    const scheduleNextShootingStar = () => {
      const nextDelay = 2400 + Math.random() * 3400;
      timeoutId = window.setTimeout(() => {
        spawnShootingStar();
        scheduleNextShootingStar();
      }, nextDelay);
    };

    const initialTimer = window.setTimeout(() => {
      spawnShootingStar();
      scheduleNextShootingStar();
    }, 1200);

    let frame = 0;
    const render = () => {
      frame++;
      const time = performance.now();

      // Subtle celestial autonomous drift (ensures Android phones feel dynamic even when still)
      const autoDriftX = Math.sin(time * 0.0004) * 22;
      const autoDriftY = Math.cos(time * 0.0003) * 15;

      // Smooth parallax interpolation with pointer
      const targetX = (mouseX - width / 2) + autoDriftX;
      const targetY = (mouseY - height / 2) + autoDriftY;
      currentOffsetX += (targetX - currentOffsetX) * 0.04;
      currentOffsetY += (targetY - currentOffsetY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Deep celestial midnight background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030611');
      skyGrad.addColorStop(0.38, '#060a1d');
      skyGrad.addColorStop(0.72, '#050714');
      skyGrad.addColorStop(1, '#020308');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Render Subtle Parallax Nebula Layers
      for (const neb of nebulae) {
        const pulse = Math.sin(time * neb.pulseSpeed + neb.pulseOffset) * 0.12 + 1;
        const nebX = (width * neb.xRatio) - (currentOffsetX * neb.parallaxFactor);
        const nebY = (height * neb.yRatio) - (currentOffsetY * neb.parallaxFactor);
        const nebRadius = (Math.max(width, height) * neb.radiusRatio) * pulse;

        const nebGrad = ctx.createRadialGradient(nebX, nebY, 15, nebX, nebY, nebRadius);
        nebGrad.addColorStop(0, neb.colorStart);
        nebGrad.addColorStop(0.55, neb.colorMid);
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render Twinkling Depth Layers (Layer 0, Layer 1, Layer 2)
      for (const s of stars) {
        // Natural twinkle
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.98 || s.alpha < 0.15) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        // Apply depth-based parallax displacement
        const posX = s.baseX - (currentOffsetX * s.parallaxFactor);
        const posY = s.baseY - (currentOffsetY * s.parallaxFactor);

        // Wrap around smoothly across screen bounds
        let renderX = (posX % width + width) % width;
        let renderY = (posY % height + height) % height;

        ctx.beginPath();
        ctx.arc(renderX, renderY, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, s.alpha));
        ctx.fill();

        // Foreground stars halo (Layer 2)
        if (s.depthLayer === 2) {
          ctx.beginPath();
          ctx.arc(renderX, renderY, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.22;
          ctx.fill();

          // Cross diffraction flare on brightest foreground stars
          if (s.hasSpike && s.alpha > 0.55) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.75;
            ctx.globalAlpha = (s.alpha - 0.4) * 0.55;
            const spikeLen = s.radius * 3.6;
            ctx.beginPath();
            ctx.moveTo(renderX - spikeLen, renderY);
            ctx.lineTo(renderX + spikeLen, renderY);
            ctx.moveTo(renderX, renderY - spikeLen);
            ctx.lineTo(renderX, renderY + spikeLen);
            ctx.stroke();
          }
        }
      }

      // 3. Render falling stardust sparks from shooting star trails
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

      // 4. Render active shooting stars
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
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
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
