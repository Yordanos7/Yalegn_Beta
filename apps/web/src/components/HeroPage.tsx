"use client";
// here i have to come back to Know the Link is from react-router-dom or  next/link i think should be to next/link because its a nextjs app
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fadeIn, staggerFadeIn } from "@/app/utils/gsap";
import heroImage from "@/../assets/hero-bg.jpg";
import { useEffect, useRef } from "react";

const HeroPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current && subtitleRef.current && buttonsRef.current) {
      fadeIn(titleRef.current, 0.2);
      fadeIn(subtitleRef.current, 0.4);
      fadeIn(buttonsRef.current, 0.6);
    }
  }, []);
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
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-royal opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
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
      <div className="absolute bottom-0 left-0 right-0">
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
