import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image"; // Import Image component for Next.js
import logo from "@/../assets/logo.png"; // Import the logo image
import type { StaticImageData } from "next/image"; // Import StaticImageData type

interface Footer7Props {
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
    url: "/",
    src: logo,
    alt: "Yalegn Logo",
    title: "Yalegn",
  };

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Logo and Social Section */}
          <div className="flex flex-col gap-4 lg:w-1/3 text-center lg:text-left">
            {/* Logo */}
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src={currentLogo.src}
                  alt={currentLogo.alt}
                  title={currentLogo.title}
                  className="h-12 w-12 md:h-16 md:w-16"
                  width={64}
                  height={64}
                />
              </Link>
              <h2 className="text-base md:text-lg font-semibold">
                {currentLogo.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
              {description}
            </p>
            <ul className="flex items-center justify-center lg:justify-start gap-4 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li
                  key={idx}
                  className="font-medium hover:text-primary transition-colors"
                >
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Section - 2 columns on mobile, 3 on tablet+ */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:flex-1 text-left">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-3 font-bold text-sm md:text-base">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground md:flex-row md:justify-between md:items-center text-center md:text-left">
          <p>{copyright}</p>
          <ul className="flex flex-wrap gap-4 justify-center md:justify-end">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary transition-colors">
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
