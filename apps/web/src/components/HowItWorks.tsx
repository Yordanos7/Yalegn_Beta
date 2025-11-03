"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Assuming these paths are correct for your assets
import iconJobs from "@/../assets/icon-jobs.png";
import iconSkills from "@/../assets/icon-skills.png";
import iconMarketplace from "@/../assets/icon-marketplace.png";

const steps = [
  {
    icon: iconJobs,
    title: "Find Jobs & Opportunities",
    description:
      "Browse thousands of job listings from verified employers. Apply with ease and track your applications in real-time.",
  },
  {
    icon: iconSkills,
    title: "Develop Your Skills",
    description:
      "Access skill-building resources, certifications, and training programs to enhance your professional growth.",
  },
  {
    icon: iconMarketplace,
    title: "Access the Marketplace",
    description:
      "Buy and sell products and services. From AgroGoods to digital services, showcase your entrepreneurial spirit.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (sectionRef.current && cardsRef.current.length === steps.length) {
      // 1. Initial setup: Set the starting position for the cards
      // They will start just below their final resting place and be transparent.
      gsap.set(cardsRef.current, { opacity: 0, y: 70, scale: 0.95 });
      gsap.set(sectionRef.current.children[0], { opacity: 0, y: 50 });

      // **2. Create the Master Timeline with Pinning**
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true, // PIN the entire section
          start: "top top", // Start pinning when the section hits the top
          // The end value determines how long the section is pinned.
          // 2000px gives enough time for the intro, the parallax, and the exit.
          end: "+=2000",
          scrub: 1, // **VERY SMOOTH:** Links animation to scroll with a 1-second lag
          // markers: true,     // Uncomment to debug the scroll positions
        },
      });

      // --- PHASE 1: Intro (Header and Cards enter the scene) ---
      // This is the beginning of the pinned section.
      tl.to(
        sectionRef.current.children[0],
        { opacity: 1, y: 0, duration: 2, ease: "power2.out" },
        0
      );
      tl.to(
        cardsRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.2, // Subtle stagger for a smoother entry
          duration: 2,
          ease: "power2.out",
        },
        0.5
      ); // Start the cards just after the header

      // --- PHASE 2: Subtle Independent Parallax (Small Y Movement) ---
      // This movement happens while the page is held/pinned.

      // Define subtle movement amounts for the core parallax phase
      const parallaxDuration = 4; // This time determines how long this phase lasts within the pin.

      // Box 1: Small Upward movement
      tl.to(
        cardsRef.current[0],
        {
          y: -10,
          x: -100, // Small horizontal shift for subtlety
          duration: parallaxDuration,
          ease: "none",
        },
        2.5
      ); // Start after intro is fully done

      // Box 2: Small Downward movement (delayed stagger)
      tl.to(
        cardsRef.current[1],
        {
          y: 20,
          x: 0,
          duration: parallaxDuration,
          ease: "none",
        },
        2.8
      ); // Slightly delayed start

      // Box 3: Small Upward movement (more delayed stagger)
      tl.to(
        cardsRef.current[2],
        {
          y: -40,
          x: 100,
          duration: parallaxDuration,
          ease: "none",
        },
        3.1
      ); // Most delayed start

      // --- PHASE 3: Exit (Move all three boxes quickly to up and unpin) ---
      // This must happen near the end of the timeline to allow the user to scroll down.
      const exitDuration = 1.5;

      // Move all boxes up and out of the viewport
      tl.to(
        cardsRef.current,
        {
          y: -1000,
          opacity: 0,
          scale: 0.8,
          stagger: 0.1,
          duration: exitDuration,
          ease: "power2.in",
        },
        7.5
      ); // Start near the end of the 2000px scroll duration

      // Move the header out as well
      tl.to(
        sectionRef.current.children[0],
        {
          y: -200,
          opacity: 0,
          duration: exitDuration,
          ease: "power2.in",
        },
        7.5
      );
    }

    // Cleanup ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-royal min-h-screen">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to unlock your potential and connect with
            opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              // Ensure the cards have room to move without changing layout flow
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-royal transition-all duration-300 border border-border hover:border-gold/50 group will-change-transform"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-gradient-royal flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img
                  src={step.icon.src}
                  alt={step.title}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
