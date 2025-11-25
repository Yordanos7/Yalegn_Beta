"use client";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

export const HeroParallax = () => {
  return (
    <div className="relative w-full">
      {/* Particle Text Effect Section - Top of Page */}
      <div className="w-full pt-16 sm:pt-20 md:pt-24">
        <ParticleTextEffect />
      </div>

      {/* Content Below Particle Effect */}
      <div className="relative px-4 mt-8">
        {/* Add your other content here */}
      </div>
    </div>
  );
};
