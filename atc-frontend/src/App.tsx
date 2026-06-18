import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Hero from "./components/Hero";
import SimulationDashboard from "./pages/SimulationDashboard";

import "./App.css";

// ─── Particle System ──────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: "blip" | "trail" | "star";
  life: number;
  maxLife: number;
}

function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const particles: Particle[] = [];
  let mouse = { x: -9999, y: -9999 };
  let animId: number;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (Math.random() < 0.3) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 12,
        y: e.clientY + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: 0.6,
        type: "trail",
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    }
  };

  window.addEventListener("mousemove", onMouseMove);

  // Background stars
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      type: "star",
      life: Math.random() * 200,
      maxLife: 300 + Math.random() * 200,
    });
  }

  const spawnBlip = () => {
    const edge = Math.floor(Math.random() * 4);

    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;

    const speed = 0.3 + Math.random() * 0.5;

    if (edge === 0) {
      x = Math.random() * canvas.width;
      y = 0;
      vx = (Math.random() - 0.5) * 0.3;
      vy = speed;
    } else if (edge === 1) {
      x = canvas.width;
      y = Math.random() * canvas.height;
      vx = -speed;
      vy = (Math.random() - 0.5) * 0.3;
    } else if (edge === 2) {
      x = Math.random() * canvas.width;
      y = canvas.height;
      vx = (Math.random() - 0.5) * 0.3;
      vy = -speed;
    } else {
      x = 0;
      y = Math.random() * canvas.height;
      vx = speed;
      vy = (Math.random() - 0.5) * 0.3;
    }

    particles.push({
      x,
      y,
      vx,
      vy,
      size: 1.5 + Math.random(),
      alpha: 0.5,
      type: "blip",
      life: 0,
      maxLife: 400 + Math.random() * 300,
    });
  };

  let frameCount = 0;

  const draw = () => {
    animId = requestAnimationFrame(draw);
    frameCount++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (
      frameCount % 80 === 0 &&
      particles.filter((p) => p.type === "blip").length < 15
    ) {
      spawnBlip();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      if (p.type === "star") {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.04;
          p.vy += (dy / dist) * force * 0.04;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
      }

      const progress = p.life / p.maxLife;
      let alpha = p.alpha;

      if (p.type === "trail") {
        alpha = p.alpha * (1 - progress);
      } else if (p.type === "star") {
        alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.life * 0.03));
      } else {
        if (progress < 0.1) {
          alpha = p.alpha * (progress / 0.1);
        } else if (progress > 0.85) {
          alpha = p.alpha * (1 - (progress - 0.85) / 0.15);
        }
      }

      if (p.life > p.maxLife) {
        if (p.type === "star") {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        } else {
          particles.splice(i, 1);
          continue;
        }
      }

      if (p.type === "star") {
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      } else if (p.type === "blip") {
        if (
          p.x < -20 ||
          p.x > canvas.width + 20 ||
          p.y < -20 ||
          p.y > canvas.height + 20
        ) {
          particles.splice(i, 1);
          continue;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === "blip") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#00d4ff";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00d4ff";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,212,255,0.15)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      } else if (p.type === "trail") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#00d4ff";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#00d4ff";
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148,163,184,0.8)";
        ctx.fill();
      }

      ctx.restore();
    }
  };

  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
  };
}

// ─── Custom Cursor ────────────────────────────────────────

function initCursor() {
  const ring = document.getElementById("cursor-ring");
  const dot = document.getElementById("cursor-dot");

  if (!ring || !dot) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  };

  window.addEventListener("mousemove", onMove);

  let animId: number;

  const animate = () => {
    animId = requestAnimationFrame(animate);

    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
  };

  animate();

  const onDown = () => document.body.classList.add("cursor-click");
  const onUp = () => document.body.classList.remove("cursor-click");

  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("mousemove", onMove);
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("mouseup", onUp);
  };
}

// ─── App Component ────────────────────────────────────────

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cleanupParticles = canvasRef.current
      ? initParticles(canvasRef.current)
      : undefined;

    const cleanupCursor = initCursor();

    return () => {
      cleanupParticles?.();
      cleanupCursor?.();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="particle-canvas"
        aria-hidden="true"
      />

      <div id="custom-cursor" aria-hidden="true">
        <span id="cursor-ring" />
        <span id="cursor-dot" />
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route
            path="/simulation"
            element={<SimulationDashboard />}
          />
        </Routes>
      </Router>
    </>
  );
}