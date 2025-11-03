"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import HeroPage from "@/components/HeroPage";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

// import Footer from "@/components/Footer";
export default function Home() {
  return (
    <>
      <HeroPage />
      <HowItWorks />
      <Footer />
    </>
  );
}
