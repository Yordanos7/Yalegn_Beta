"use client";
import React from "react";
import { useTheme } from "next-themes";
import { Sparkles, Handshake, Rocket } from "lucide-react";

export const Wellcome = () => {
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const headingColor = theme === "dark" ? "text-yellow-400" : "text-blue-600";
  const iconColor = "text-orange-400"; // Changed to orange-400 as requested

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${bgColor}`}>
      <div className={`w-full p-8 rounded-xl  border  ${bgColor} p-32`}>
        <div className="flex justify-center mb-6">
          <Sparkles size={48} className={iconColor} />
        </div>
        <h1
          className={`text-5xl font-bold mb-6 text-center ${headingColor} font-playfair `}
        >
          Welcome to Yalegn!
        </h1>
        <p className={`text-xl text-center mb-8 ${textColor} font-sans p-3`}>
          We're thrilled to have you join our innovative platform. Discover a
          world of creative solutions and opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-center text-center">
            <Handshake size={36} className={`mb-3 ${iconColor}`} />
            <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>
              Connect & Collaborate
            </h3>
            <p className={`text-base ${textColor}`}>
              Find partners, clients, and talent to bring your ideas to life.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Rocket size={36} className={`mb-3 ${iconColor}`} />
            <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>
              Innovate & Grow
            </h3>
            <p className={`text-base ${textColor}`}>
              Access cutting-edge tools and resources to scale your projects.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Sparkles size={36} className={`mb-3 ${iconColor}`} />
            <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>
              Showcase Your Work
            </h3>
            <p className={`text-base ${textColor}`}>
              Present your portfolio to a global audience and get discovered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
