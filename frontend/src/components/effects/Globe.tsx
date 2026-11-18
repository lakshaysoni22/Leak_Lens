import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface GlobeProps {
  size?: number;
  className?: string;
}

interface GeoPoint {
  lat: number;
  lon: number;
  color: string;
}

interface Arc {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

const Globe: React.FC<GlobeProps> = ({ size = 400, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const radius = size * 0.38;
    const cx = size / 2;
    const cy = size / 2;
    const tilt = 0.22; // ~12.6 degrees tilt
    let rotation = 0;
    const rotationSpeed = 0.003;
    let animationFrameId: number;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // 10 fixed geographical nodes across the globe
    const points: GeoPoint[] = [
      { lat: 0.7, lon: -1.2, color: '#A3FF6F' },   // North America East
      { lat: 0.6, lon: -2.1, color: '#45D6FF' },   // North America West
      { lat: 0.9, lon: 0.1, color: '#A3FF6F' },    // Western Europe
      { lat: 0.6, lon: 0.6, color: '#45D6FF' },    // Eastern Europe
      { lat: 0.3, lon: 1.3, color: '#A3FF6F' },    // East Asia
      { lat: 0.2, lon: 1.8, color: '#45D6FF' },    // Tokyo
      { lat: -0.4, lon: -0.8, color: '#A3FF6F' },  // South America
      { lat: 0.1, lon: 0.2, color: '#45D6FF' },    // West Africa
      { lat: -0.6, lon: 2.6, color: '#A3FF6F' },   // Sydney
      { lat: 0.4, lon: 1.4, color: '#45D6FF' },    // South Asia
    ];

    const arcs: Arc[] = [
      { fromIndex: 0, toIndex: 2, progress: 0.1, speed: 0.008 },
      { fromIndex: 1, toIndex: 5, progress: 0.6, speed: 0.006 },
      { fromIndex: 2, toIndex: 3, progress: 0.3, speed: 0.010 },
      { fromIndex: 3, toIndex: 4, progress: 0.8, speed: 0.007 },
      { fromIndex: 4, toIndex: 8, progress: 0.4, speed: 0.005 },
      { fromIndex: 0, toIndex: 6, progress: 0.2, speed: 0.009 },
      { fromIndex: 2, toIndex: 7, progress: 0.7, speed: 0.007 },
    ];

    const project = (lat: number, lon: number, r: number) => {
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const curLon = lon + rotation;

      const x = r * cosLat * Math.sin(curLon);
      const y = r * sinLat;
      const z = r * cosLat * Math.cos(curLon);

      // Tilt around X-axis
      const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zt = y * Math.sin(tilt) + z * Math.cos(tilt);

      return {
        x: cx + x,
        y: cy - yt,
        z: zt,
        visible: zt > -r * 0.15,
        front: zt > 0,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Outer atmosphere halo
      const atmosphereGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      atmosphereGrad.addColorStop(0, 'rgba(69, 214, 255, 0.06)');
      atmosphereGrad.addColorStop(0.5, 'rgba(163, 255, 111, 0.04)');
      atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Globe sphere background (subtle dark depth)
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, 'rgba(17, 24, 39, 0.95)');
      sphereGrad.addColorStop(0.7, 'rgba(13, 18, 32, 0.98)');
      sphereGrad.addColorStop(1, 'rgba(8, 11, 18, 1)');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Latitude lines (Parallels)
      const latSteps = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0];
      latSteps.forEach((lat) => {
        ctx.beginPath();
        let first = true;
        const segments = 60;
        for (let i = 0; i <= segments; i++) {
          const lon = (i / segments) * Math.PI * 2;
          const p = project(lat, lon, radius);

          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = 'rgba(69, 214, 255, 0.12)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Longitude lines (Meridians)
      const lonCount = 12;
      for (let m = 0; m < lonCount; m++) {
        const baseLon = (m / lonCount) * Math.PI * 2;
        ctx.beginPath();
        let first = true;
        const segments = 40;
        for (let i = 0; i <= segments; i++) {
          const lat = -Math.PI / 2 + (i / segments) * Math.PI;
          const p = project(lat, baseLon, radius);

          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = `rgba(163, 255, 111, 0.08)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Outer rim edge glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(69, 214, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Draw connection arcs
      arcs.forEach((arc) => {
        const p1 = project(points[arc.fromIndex].lat, points[arc.fromIndex].lon, radius);
        const p2 = project(points[arc.toIndex].lat, points[arc.toIndex].lon, radius);

        if (p1.front || p2.front) {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - radius * 0.22;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx.strokeStyle = 'rgba(69, 214, 255, 0.18)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Animated particle moving along the arc
          if (!prefersReducedMotion) {
            arc.progress = (arc.progress + arc.speed) % 1;
          }
          const t = arc.progress;
          const invT = 1 - t;
          const curX = invT * invT * p1.x + 2 * invT * t * midX + t * t * p2.x;
          const curY = invT * invT * p1.y + 2 * invT * t * midY + t * t * p2.y;

          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#A3FF6F';
          ctx.shadowColor = '#A3FF6F';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw points / glowing nodes
      points.forEach((pt) => {
        const p = project(pt.lat, pt.lon, radius);
        if (p.visible) {
          const alpha = p.front ? 1 : 0.25;

          // Outer pulse glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.front ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = pt.color === '#A3FF6F'
            ? `rgba(163, 255, 111, ${0.3 * alpha})`
            : `rgba(69, 214, 255, ${0.3 * alpha})`;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.front ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = p.front ? 6 : 0;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      if (!prefersReducedMotion) {
        rotation += rotationSpeed;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [size]);

  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Globe;
