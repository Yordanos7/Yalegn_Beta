import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image"; // Import Image component for Next.js
import logo from "@/../assets/logo.png"; // Import the logo image
import type { StaticImageData } from "next/image"; // Import StaticImageData type

interface Footer7Props {
  logo?: {
    url: string;
    src: string | StaticImageData; // Allow StaticImageData for Next.js Image component
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  sections = defaultSections,
  description = "A platform for connecting freelancers with clients.",
  socialLinks = defaultSocialLinks,
  copyright = ` © ${new Date().getFullYear()} Yalegn. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  const currentLogo = {
    url: "/" as string, // Explicitly cast to string to satisfy LinkProps
    src: logo, // Use the imported logo directly
    alt: "Yalegn Logo",
    title: "Yalegn",
  };

  return (
    <section className="py-8 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start text-center lg:text-left">
            {/* Logo */}
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Link
                href={currentLogo.url}
                className="flex items-center gap-2 group"
              >
                <Image
                  src={currentLogo.src}
                  alt={currentLogo.alt}
                  title={currentLogo.title}
                  className="h-16 w-16 md:h-20 md:w-20"
                  width={80} // Specify width for Next.js Image component
                  height={80} // Specify height for Next.js Image component
                />
              </Link>
              <h2 className="text-lg md:text-xl font-semibold">
                {currentLogo.title}
              </h2>
            </div>
            <p className="max-w-full text-sm text-muted-foreground px-4 lg:px-0">
              {description}
            </p>
            <ul className="flex items-center justify-center lg:justify-start space-x-4 md:space-x-6 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-primary">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:gap-10 text-center sm:text-left">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-base md:text-lg">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col justify-between gap-4 border-t py-6 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left text-center">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row justify-center md:justify-start">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
