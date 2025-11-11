"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ShoppingCart,
  Home,
  MessageSquare,
  Wallet,
  List,
  Briefcase,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"; // Added ShoppingCart icon and sidebar icons
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";
import logo from "@/../assets/logo.png";
import LogoutConfirmationDialog from "./ui/logout-confirmation-dialog";
import { useRouter } from "next/navigation";

const desktopNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "How It Works" },
  { href: "/marketplace", label: "Marketplace" },
];

const mobileNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/marketplace", icon: Briefcase, label: "Marketplace" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/my-listings", icon: List, label: "My Listings" },
  { href: "/applications", icon: Briefcase, label: "Applications / Jobs" },
  { href: "/analytics", icon: BarChart, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: HelpCircle, label: "Help / Support" },
  { href: "/logout", icon: LogOut, label: "Logout" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

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
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu, Cart, or CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart" as="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {session?.user ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login" as="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup" as="/signup">
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
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              if (item.href === "/logout") {
                return (
                  <button
                    key={item.href}
                    onClick={() => setLogoutDialogOpen(true)}
                    className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-2 w-full text-left"
                  >
                    <Icon className="mr-3" size={20} />
                    {item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  <Icon className="mr-3" size={20} />
                  {item.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {session?.user ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/login" as="/login">
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" as="/signup">
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
      <LogoutConfirmationDialog
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default Header;
