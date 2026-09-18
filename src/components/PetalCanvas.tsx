"use client";

import React, { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
  opacity: number;
  colorType: number; // 0 = blush pink, 1 = deep rose, 2 = pale cream rose, 3 = gold speck
}

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Number of petals adjusted for mobile vs desktop for optimal 60fps
    const petalCount = width < 768 ? 16 : 28;
    const petals: Petal[] = [];

    const colors = [
      { fill: "rgba(255, 182, 193, 0.65)", stroke: "rgba(255, 160, 175, 0.4)" }, // Blush pink
      { fill: "rgba(244, 143, 177, 0.55)", stroke: "rgba(230, 104, 130, 0.35)" }, // Rose
      { fill: "rgba(255, 235, 238, 0.7)", stroke: "rgba(255, 205, 210, 0.4)" }, // Pale cream
      { fill: "rgba(255, 215, 0, 0.35)", stroke: "rgba(218, 165, 32, 0.2)" }, // Soft gold shimmer
    ];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 9 + 8,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.7 + 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.2,
        swayAmplitude: Math.random() * 1.5 + 0.5,
        swayFrequency: Math.random() * 0.02 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.45,
        colorType: Math.floor(Math.random() * colors.length),
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        // Natural petal drift and flutter
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * p.swayFrequency + p.swayOffset) * p.swayAmplitude * 0.5;
        p.rotation += p.rotationSpeed;

        // Wrap around screen
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        const col = colors[p.colorType];

        // Draw organic petal shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(
          p.size * 0.7,
          -p.size * 0.6,
          p.size * 0.8,
          p.size * 0.4,
          0,
          p.size * 0.9
        );
        ctx.bezierCurveTo(
          -p.size * 0.8,
          p.size * 0.4,
          -p.size * 0.7,
          -p.size * 0.6,
          0,
          -p.size
        );

        ctx.fillStyle = col.fill;
        ctx.fill();

        ctx.strokeStyle = col.stroke;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full opacity-80"
    />
  );
}
