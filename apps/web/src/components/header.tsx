"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart } from "lucide-react"; // Added ShoppingCart icon
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";
import logo from "@/../assets/logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md border-b border-border shadow-sm min-h-[112px] bg-background/5">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src={logo.src} alt="Yalegn Logo" className="h-20 w-20" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/marketplace"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Marketplace
            </Link>
          </div>

          {/* User Menu, Cart, or CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {session?.user ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="lg">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              How It Works
            </Link>
            <Link
              href="/marketplace"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Marketplace
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t">
              {session?.user ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
