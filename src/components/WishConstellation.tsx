import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wish } from '../types.ts';
import { appConfig } from '../config/appConfig.ts';
import { Sparkles, Eye, ArrowUpRight } from 'lucide-react';

interface WishConstellationProps {
  wishes: Wish[];
  onSelectWish: (wish: Wish) => void;
}

interface StarNode {
  wish: Wish;
  x: number;
  y: number;
  radius: number;
  color: string;
  symbol: string;
  glow: string;
  pulsePhase: number;
}

export const WishConstellation: React.FC<WishConstellationProps> = ({ wishes, onSelectWish }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredWish, setHoveredWish] = useState<{ wish: Wish; x: number; y: number } | null>(null);

  // Map each star type to color
  const getStarColor = (starType: string) => {
    const found = appConfig.availableStarTypes.find((s) => s.id === starType.toLowerCase());
    return found ? found.glowHex : '#f59e0b';
  };

  const getStarSymbol = (starType: string) => {
    const found = appConfig.availableStarTypes.find((s) => s.id === starType.toLowerCase());
    return found ? found.symbol : '✨';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 540);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(480, Math.min(620, window.innerHeight * 0.65));
      generateNodes();
    };

    window.addEventListener('resize', handleResize);

    let nodes: StarNode[] = [];

    const generateNodes = () => {
      nodes = wishes.map((wish, index) => {
        // Distribute gracefully using pseudo-random deterministic or spiral layout
        const phi = (index * 137.5 * Math.PI) / 180;
        const dist = Math.min(width, height) * 0.42 * Math.sqrt((index + 1) / Math.max(12, wishes.length));
        const centerX = width / 2;
        const centerY = height / 2;

        const x = Math.max(40, Math.min(width - 40, centerX + Math.cos(phi) * dist + (Math.sin(index * 7) * 20)));
        const y = Math.max(40, Math.min(height - 40, centerY + Math.sin(phi) * dist + (Math.cos(index * 5) * 20)));

        return {
          wish,
          x,
          y,
          radius: 6,
          color: getStarColor(wish.star_type),
          symbol: getStarSymbol(wish.star_type),
          glow: getStarColor(wish.star_type),
          pulsePhase: Math.random() * Math.PI * 2,
        };
      });
    };

    generateNodes();

    let frame = 0;
    const render = () => {
      frame += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw faint constellation lines connecting nearby stars
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = Math.sin(frame + node.pulsePhase) * 1.5;
        const currentRadius = node.radius + pulse;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, currentRadius * 3.5);
        glowGrad.addColorStop(0, node.color + '99');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(2, currentRadius * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse / Tap interaction
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const pos = getPos(e);
      let found: StarNode | null = null;
      for (const node of nodes) {
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          found = node;
          break;
        }
      }

      if (found) {
        canvas.style.cursor = 'pointer';
        setHoveredWish({ wish: found.wish, x: found.x, y: found.y });
      } else {
        canvas.style.cursor = 'default';
        setHoveredWish(null);
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const pos = getPos(e);
      for (const node of nodes) {
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          onSelectWish(node.wish);
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [wishes]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-[0_15px_50px_rgba(0,0,0,0.6)] bg-[#070b18]/80"
      style={{ minHeight: '480px' }}
    >
      <div className="absolute top-4 left-5 z-20 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Tap or hover over any glowing star to reveal its wish</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Hover preview tooltip */}
      <AnimatePresence>
        {hoveredWish && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              left: `${Math.min(window.innerWidth - 300, Math.max(20, hoveredWish.x - 120))}px`,
              top: `${Math.max(20, hoveredWish.y - 125)}px`,
            }}
            onClick={() => onSelectWish(hoveredWish.wish)}
            className="z-30 w-64 glass-panel-golden p-3.5 rounded-2xl border border-amber-400/40 shadow-2xl pointer-events-auto cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {hoveredWish.wish.wish_energy}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white">
                <span>View Star</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-100 font-serif italic line-clamp-2 mb-2">
              “{hoveredWish.wish.message}”
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-1.5">
              <span className="font-medium text-slate-200 truncate">
                — {hoveredWish.wish.sender_name}
              </span>
              {hoveredWish.wish.one_word && (
                <span className="text-amber-300/80 italic text-[10px]">
                  “{hoveredWish.wish.one_word}”
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
