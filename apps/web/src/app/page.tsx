"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { HeroParallax } from "@/components/HeroPage";
import { Component as ImageAutoSlider } from "@/components/ui/image-auto-slider";
import Footer from "@/components/Footer";
import { Wellcome } from "@/components/Wellcome";

// import Footer from "@/components/Footer";
const products = [
  {
    title: "Job Listings",
    link: "/jobs",
    thumbnail: "/uploads/1762456790260-upwork.png",
  },
  {
    title: "Freelancer Profiles",
    link: "/freelancers",
    thumbnail: "/uploads/1762434752166-user.jpg",
  },
  {
    title: "Marketplace",
    link: "/marketplace",
    thumbnail: "/uploads/1762974874607-Untitled_design.png",
  },
  {
    title: "Analytics Dashboard",
    link: "/analytics",
    thumbnail:
      "/uploads/1763030173649-ChatGPT_Image_Oct_10,_2025,_10_30_31_PM.png",
  },
  {
    title: "Messaging System",
    link: "/messages",
    thumbnail: "/uploads/1763031567927-photo_5962874599832143430_y.jpg",
  },
  {
    title: "User Profiles",
    link: "/profile",
    thumbnail: "/uploads/1762341529956-user.jpg",
  },
  {
    title: "Application Tracking",
    link: "/applications",
    thumbnail: "/uploads/1762499352600-upwork.png",
  },
  {
    title: "Organization Jobs",
    link: "/organization/jobs",
    thumbnail: "/uploads/1762456961070-gethub.jpg",
  },
  {
    title: "Admin Verification",
    link: "/admin/verification",
    thumbnail: "/uploads/1762447648242-21.jpg",
  },
  {
    title: "Payment Management",
    link: "/admin/payments",
    thumbnail: "/uploads/1762447457830-21.jpg",
  },
  {
    title: "Job Listings",
    link: "/jobs",
    thumbnail: "/uploads/1762456790260-upwork.png",
  },
  {
    title: "Freelancer Profiles",
    link: "/freelancers",
    thumbnail: "/uploads/1762434752166-user.jpg",
  },
  {
    title: "Marketplace",
    link: "/marketplace",
    thumbnail: "/uploads/1762974874607-Untitled_design.png",
  },
  {
    title: "Analytics Dashboard",
    link: "/analytics",
    thumbnail:
      "/uploads/1763030173649-ChatGPT_Image_Oct_10,_2025,_10_30_31_PM.png",
  },
  {
    title: "Messaging System",
    link: "/messages",
    thumbnail: "/uploads/1763031567927-photo_5962874599832143430_y.jpg",
  },
];

export default function Home() {
  return (
    <>
      <HeroParallax />
      <Wellcome />
      <ImageAutoSlider />
      <Footer />
    </>
  );
}
