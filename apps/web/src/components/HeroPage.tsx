"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fadeIn } from "@/app/utils/gsap";
import heroImage from "@/../assets/hero-bg.jpg";

// --- Type Definitions and Classes for Canvas Animation ---

interface OscillatorConfig {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

class Oscillator {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
  valueCache: number;

  constructor(e: OscillatorConfig) {
    this.phase = e.phase || 0;
    this.offset = e.offset || 0;
    this.frequency = e.frequency || 0.001;
    this.amplitude = e.amplitude || 1;
    this.valueCache = 0;
  }

  update(): number {
    this.phase += this.frequency;
    this.valueCache = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.valueCache;
  }

  value(): number {
    return this.valueCache;
  }
}

class Node {
  x: number;
  y: number;
  vy: number;
  vx: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
  }
}

interface LineConfig {
  spring: number;
}

interface GlobalSettings {
  debug: boolean;
  friction: number;
  trails: number;
  size: number;
  dampening: number;
  tension: number;
}

interface Position {
  x: number;
  y: number;
}

interface CustomCanvasRenderingContext2D extends CanvasRenderingContext2D {
  running: boolean;
  frame: number;
}

const E: GlobalSettings = {
  debug: true,
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

class Line {
  spring: number;
  friction: number;
  nodes: Node[];

  constructor(config: LineConfig, initialPos: Position) {
    this.spring = config.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (let n = 0; n < E.size; n++) {
      const t = new Node();
      t.x = initialPos.x;
      t.y = initialPos.y;
      this.nodes.push(t);
    }
  }

  update(currentPos: Position) {
    let e = this.spring;
    const t = this.nodes[0];
    t.vx += (currentPos.x - t.x) * e;
    t.vy += (currentPos.y - t.y) * e;

    for (let i = 0, a = this.nodes.length; i < a; i++) {
      const currentNode = this.nodes[i];
      if (i > 0) {
        const prevNode = this.nodes[i - 1];
        currentNode.vx += (prevNode.x - currentNode.x) * e;
        currentNode.vy += (prevNode.y - currentNode.y) * e;
        currentNode.vx += prevNode.vx * E.dampening;
        currentNode.vy += prevNode.vy * E.dampening;
      }
      currentNode.vx *= this.friction;
      currentNode.vy *= this.friction;
      currentNode.x += currentNode.vx;
      currentNode.y += currentNode.vy;
      e *= E.tension;
    }
  }

  draw(ctx: CustomCanvasRenderingContext2D) {
    let e, t;
    let n = this.nodes[0].x;
    let i = this.nodes[0].y;

    ctx.beginPath();
    ctx.moveTo(n, i);

    for (let a = 1, o = this.nodes.length - 2; a < o; a++) {
      e = this.nodes[a];
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    e = this.nodes[this.nodes.length - 2];
    t = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  }
}

const HeroPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Canvas animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CustomCanvasRenderingContext2D | null>(null);
  const oscillatorRef = useRef<Oscillator | null>(null);
  const linesRef = useRef<Line[]>([]);
  const posRef = useRef<Position>({ x: 0, y: 0 });
  const animationFrameIdRef = useRef<number | null>(null);

  const resizeCanvas = useCallback(() => {
    if (canvasRef.current && ctxRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  const createLines = useCallback(() => {
    linesRef.current = [];
    for (let i = 0; i < E.trails; i++) {
      linesRef.current.push(
        new Line({ spring: 0.45 + (i / E.trails) * 0.025 }, posRef.current)
      );
    }
  }, []);

  const onMousemove = useCallback((e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches) {
      posRef.current.x = e.touches[0].pageX;
      posRef.current.y = e.touches[0].pageY;
    } else if ("clientX" in e) {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    }
    e.preventDefault();
  }, []);

  const onTouchstart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      posRef.current.x = e.touches[0].pageX;
      posRef.current.y = e.touches[0].pageY;
    }
  }, []);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const oscillator = oscillatorRef.current;
    const lines = linesRef.current;

    if (ctx && oscillator && ctx.running) {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle =
        "hsla(" + Math.round(oscillator.update()) + ",100%,50%,0.025)";
      ctx.lineWidth = 10;

      for (let i = 0; i < E.trails; i++) {
        const line = lines[i];
        line.update(posRef.current);
        line.draw(ctx);
      }

      ctx.frame++;
      animationFrameIdRef.current = window.requestAnimationFrame(render);
    }
  }, []);

  useEffect(() => {
    // GSAP animations
    if (titleRef.current && subtitleRef.current && buttonsRef.current) {
      fadeIn(titleRef.current, 0.2);
      fadeIn(subtitleRef.current, 0.4);
      fadeIn(buttonsRef.current, 0.6);
    }

    // Canvas animation setup
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        ctxRef.current = Object.assign(context, { running: true, frame: 1 });
        oscillatorRef.current = new Oscillator({
          phase: Math.random() * 2 * Math.PI,
          amplitude: 85,
          frequency: 0.0015,
          offset: 285,
        });

        // Initial position for lines
        posRef.current = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
        createLines();

        document.addEventListener("mousemove", onMousemove);
        document.addEventListener("touchmove", onMousemove);
        document.addEventListener("touchstart", onTouchstart);
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("orientationchange", resizeCanvas); // Added for mobile

        // Start animation loop
        resizeCanvas();
        render();

        // Handle focus/blur
        const handleFocus = () => {
          if (ctxRef.current && !ctxRef.current.running) {
            ctxRef.current.running = true;
            render();
          }
        };
        const handleBlur = () => {
          if (ctxRef.current) {
            ctxRef.current.running = false; // Pause animation on blur
            if (animationFrameIdRef.current) {
              cancelAnimationFrame(animationFrameIdRef.current);
            }
          }
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        // Cleanup
        return () => {
          document.removeEventListener("mousemove", onMousemove);
          document.removeEventListener("touchmove", onMousemove);
          document.removeEventListener("touchstart", onTouchstart);
          window.removeEventListener("resize", resizeCanvas);
          window.removeEventListener("orientationchange", resizeCanvas);
          window.removeEventListener("focus", handleFocus);
          window.removeEventListener("blur", handleBlur);

          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
          }
        };
      }
    }
  }, [createLines, onMousemove, onTouchstart, render, resizeCanvas]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgb(var(--hero-gradient-start) / 0.92), rgb(var(--hero-gradient-end) / 0.85)), url(${heroImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply",
      }}
    >
      <canvas
        id="canvas"
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: "none" }}
      ></canvas>

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-royal opacity-30 z-10"></div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center text-foreground">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight opacity-0"
          >
            Empowering Ethiopia's Youth with{" "}
            <span className="text-gold-responsive">Jobs</span> and{" "}
            <span className="text-secondary">Opportunities</span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl mb-10 text-foreground/90 max-w-2xl mx-auto opacity-0"
          >
            Connect with employers, develop your skills, and access a vibrant
            marketplace—all in one platform designed for Ethiopia's future.
          </p>

          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0"
          >
            <Link href="/signup">
              <Button variant="default" size="lg" className="text-lg group">
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={"/about"}>
              <Button
                variant="outline"
                size="lg"
                className="text-lg bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gold-responsive mb-2">
                10K+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gold-responsive mb-2">
                5K+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Jobs Posted
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gold-responsive mb-2">
                2K+
              </div>
              <div className="text-sm md:text-base text-white/80">
                Success Stories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroPage;
