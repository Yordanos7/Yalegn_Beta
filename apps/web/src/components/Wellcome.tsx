"use client";
import React from "react";
import { useTheme } from "next-themes";
import { Sparkles, Handshake, Rocket } from "lucide-react";
import Link from "next/link";

export const Wellcome = () => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full p-4 rounded-xl bg-background md:p-32">
        <div className="flex justify-center mb-6">
          <Sparkles size={48} className="text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-center text-primary font-playfair ">
          Welcome to Yalegn!
        </h1>
        <p className="text-lg md:text-xl text-center mb-6 md:mb-8 text-foreground font-sans p-3">
          We're thrilled to have you join our innovative platform. Discover a
          world of creative solutions and opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-8">
          <div className="flex flex-col items-center text-center">
            <Handshake size={36} className="mb-2 md:mb-3 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-foreground">
              Connect & Collaborate
            </h3>
            <p className="text-sm md:text-base text-foreground">
              Find partners, clients, and talent to bring your ideas to life.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Rocket size={36} className="mb-2 md:mb-3 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-foreground">
              Innovate & Grow
            </h3>
            <p className="text-sm md:text-base text-foreground">
              Access cutting-edge tools and resources to scale your projects.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Sparkles size={36} className="mb-2 md:mb-3 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-foreground">
              Showcase Your Work
            </h3>
            <p className="text-sm md:text-base text-foreground">
              Present your portfolio to a global audience and get discovered.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-4 md:mt-8">
          <Link
            href="/signup"
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 px-4 rounded"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};
