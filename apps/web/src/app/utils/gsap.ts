import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fade in animation
export const fadeIn = (element: gsap.TweenTarget, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
    }
  );
};

// Stagger fade in for multiple elements
export const staggerFadeIn = (
  elements: gsap.TweenTarget,
  staggerDelay = 0.1
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: staggerDelay,
      ease: "power3.out",
    }
  );
};

// Scroll-triggered animation
export const scrollTriggerFade = (
  element: gsap.TweenTarget,
  triggerElement?: string | Element
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: (triggerElement || element) as ScrollTrigger.Vars["trigger"],
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

// Scale on hover
export const scaleHover = (element: HTMLElement) => {
  element.addEventListener("mouseenter", () => {
    gsap.to(element, { scale: 1.05, duration: 0.3, ease: "power2.out" });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, { scale: 1, duration: 0.3, ease: "power2.out" });
  });
};

export { gsap, ScrollTrigger };
