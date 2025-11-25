"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Vector2D {
  x: number;
  y: number;
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };

  closeEnoughTarget = 100;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;

  startColor = { r: 0, g: 0, b: 0 };
  targetColor = { r: 0, g: 0, b: 0 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move() {
    // Check if particle is close enough to its target to slow down
    let proximityMult = 1;
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
        Math.pow(this.pos.y - this.target.y, 2)
    );

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    // Add force towards target
    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };

    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    );
    if (magnitude > 0) {
      towardsTarget.x =
        (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
      towardsTarget.y =
        (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce;
      steer.y = (steer.y / steerMagnitude) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;

    // Move particle
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    // Blend towards target color
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }

    // Calculate current color
    const currentColor = {
      r: Math.round(
        this.startColor.r +
          (this.targetColor.r - this.startColor.r) * this.colorWeight
      ),
      g: Math.round(
        this.startColor.g +
          (this.targetColor.g - this.startColor.g) * this.colorWeight
      ),
      b: Math.round(
        this.startColor.b +
          (this.targetColor.b - this.startColor.b) * this.colorWeight
      ),
    };

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(canvasWidth: number, canvasHeight: number) {
    if (!this.isKilled) {
      // Set target outside the scene
      const randomPos = this.generateRandomPos(
        canvasWidth / 2,
        canvasHeight / 2,
        (canvasWidth + canvasHeight) / 2,
        canvasWidth,
        canvasHeight
      );
      this.target.x = randomPos.x;
      this.target.y = randomPos.y;

      // Begin blending color to black
      this.startColor = {
        r:
          this.startColor.r +
          (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g:
          this.startColor.g +
          (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b:
          this.startColor.b +
          (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;

      this.isKilled = true;
    }
  }

  private generateRandomPos(
    x: number,
    y: number,
    mag: number,
    canvasWidth: number,
    canvasHeight: number
  ): Vector2D {
    const randomX = Math.random() * canvasWidth;
    const randomY = Math.random() * canvasHeight;

    const direction = {
      x: randomX - x,
      y: randomY - y,
    };

    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag;
      direction.y = (direction.y / magnitude) * mag;
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    };
  }
}

interface ParticleTextEffectProps {
  words?: string[];
}

const DEFAULT_WORDS = [
  "YALEGN",
  "ETHIOIA'S",
  "CREATIVE",
  "SOLUTIONS",
  "INNOVATE",
];

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
}: ParticleTextEffectProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const wordIndexRef = useRef(0);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    isPressed: false,
    isRightClick: false,
  });

  // Adjust pixel density based on canvas width for better text rendering
  const getPixelSteps = (canvasWidth: number) => {
    if (canvasWidth < 500) return 3; // Mobile - denser particles
    if (canvasWidth < 768) return 4; // Tablet
    return 5; // Desktop
  };

  const drawAsPoints = true;

  const generateRandomCanvasPos = (
    x: number,
    y: number,
    mag: number
  ): Vector2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 }; // Should not happen

    const randomX = Math.random() * canvas.width;
    const randomY = Math.random() * canvas.height;

    const direction = {
      x: randomX - x,
      y: randomY - y,
    };

    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag;
      direction.y = (direction.y / magnitude) * mag;
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    };
  };

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d")!;

    // Adjust font size based on canvas width for responsiveness
    const baseFontSize = canvas.width / 6.5; // Better ratio for mobile
    const fontSize = Math.max(40, Math.min(baseFontSize, 140)); // Min 40px, max 140px
    offscreenCtx.fillStyle = "white";
    offscreenCtx.font = `bold ${fontSize}px Arial`;
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";

    // Measure text to ensure it fits
    const metrics = offscreenCtx.measureText(word);
    const textWidth = metrics.width;

    // Scale down if text is too wide (leave 10% padding on each side)
    let finalFontSize = fontSize;
    if (textWidth > canvas.width * 0.85) {
      finalFontSize = (fontSize * canvas.width * 0.85) / textWidth;
      offscreenCtx.font = `bold ${finalFontSize}px Arial`;
    }

    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2);

    const imageData = offscreenCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    const pixels = imageData.data;

    const newColor = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    };

    const particles = particlesRef.current;
    let particleIndex = 0;

    // Use dynamic pixel steps based on canvas width
    const pixelSteps = getPixelSteps(canvas.width);

    const coordsIndexes: number[] = [];
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i);
    }

    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coordsIndexes[i], coordsIndexes[j]] = [
        coordsIndexes[j],
        coordsIndexes[i],
      ];
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex;
      const alpha = pixels[pixelIndex + 3];

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width;
        const y = Math.floor(pixelIndex / 4 / canvas.width);

        let particle: Particle;

        if (particleIndex < particles.length) {
          particle = particles[particleIndex];
          particle.isKilled = false;
          particleIndex++;
        } else {
          particle = new Particle();

          const randomPos = generateRandomCanvasPos(
            canvas.width / 2,
            canvas.height / 2,
            (canvas.width + canvas.height) / 2
          );
          particle.pos.x = randomPos.x;
          particle.pos.y = randomPos.y;

          particle.maxSpeed = Math.random() * 6 + 4;
          particle.maxForce = particle.maxSpeed * 0.05;
          // Smaller particles on mobile for better text clarity
          const baseSize = canvas.width < 500 ? 4 : 6;
          particle.particleSize = Math.random() * 4 + baseSize;
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;

          particles.push(particle);
        }

        particle.startColor = {
          r:
            particle.startColor.r +
            (particle.targetColor.r - particle.startColor.r) *
              particle.colorWeight,
          g:
            particle.startColor.g +
            (particle.targetColor.g - particle.startColor.g) *
              particle.colorWeight,
          b:
            particle.startColor.b +
            (particle.targetColor.b - particle.startColor.b) *
              particle.colorWeight,
        };
        particle.targetColor = newColor;
        particle.colorWeight = 0;

        particle.target.x = x;
        particle.target.y = y;
      }
    }

    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height);
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const particles = particlesRef.current;
    const backgroundColor =
      theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.move();
      particle.draw(ctx, drawAsPoints);

      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1);
        }
      }
    }

    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.pos.x - mouseRef.current.x, 2) +
            Math.pow(particle.pos.y - mouseRef.current.y, 2)
        );
        if (distance < 50) {
          particle.kill(canvas.width, canvas.height);
        }
      });
    }

    frameCountRef.current++;
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
      nextWord(words[wordIndexRef.current], canvas);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      if (particlesRef.current.length > 0) {
        nextWord(words[wordIndexRef.current], canvas);
      }
    };

    // Set initial size
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    window.addEventListener("resize", setCanvasSize);

    nextWord(words[0], canvas);

    animate();

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed = true;
      mouseRef.current.isRightClick = e.button === 2;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false;
      mouseRef.current.isRightClick = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", setCanvasSize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, theme]); // Re-run effect if words or theme change

  return (
    <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] bg-transparent overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
