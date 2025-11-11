"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  MessageSquare,
  Wallet,
  List,
  Briefcase,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Check,
  Plus,
  Paperclip,
  Smile,
  Calendar,
  MoreVertical,
  DollarSign,
  Package,
  Send,
  TrendingUp,
  Star,
  Coins,
  FileText,
  X,
  Clock,
  Menu, // Added Menu icon for sidebar toggle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/../assets/logo.png";

interface SidebarProps {
  currentPage: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({
  currentPage,
  isSidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard (Home)" },
    { href: "/marketplace", icon: Briefcase, label: "Marketplace" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/my-listings", icon: List, label: "My Listings" },
    { href: "/lists", icon: List, label: "Lists" },
    { href: "/applications", icon: Briefcase, label: "Applications / Jobs" },
    { href: "/analytics", icon: BarChart, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/support", icon: HelpCircle, label: "Help / Support" },
    { href: "/logout-confirmation-dialog", icon: LogOut, label: "Logout" },
  ];

  return (
    <aside
      className={`bg-background p-6 flex-col transition-all duration-300 ease-in-out hidden md:flex ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        {isSidebarOpen && (
          <div className="flex items-center">
            <img src={logo.src} alt="Logo" className="h-8 mr-2" />
            <span className="text-xl font-bold text-foreground">
              {currentPage === "dashboard" && "Dashboard"}
              {currentPage === "messages" && "Messages"}
              {currentPage === "applications" && "Applications"}
            </span>
          </div>
        )}
        <Button variant="ghost" onClick={toggleSidebar} className="p-2">
          <Menu size={24} className="text-foreground" />
        </Button>
      </div>

      {isSidebarOpen && currentPage === "messages" && (
        <>
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-lg bg-muted border-none text-foreground focus:ring-0 focus:outline-none"
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Conversations
          </h2>
          <nav className="flex-1">
            <ul>
              <li className="mb-4">
                <Link
                  href="/messages"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="mr-3" size={20} />
                  Conversations
                </Link>
              </li>
              <li className="mb-4 bg-muted rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Acme Corp</p>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <Check className="text-yellow-500" size={20} />
              </li>
              <li className="mb-4 p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>NE</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Nahom E.</p>
                    <p className="text-sm text-muted-foreground">Offline</p>
                  </div>
                </div>
                <span className="text-muted-foreground"></span>
              </li>
              <li className="mb-4 p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>NE</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Nahom E.</p>
                    <p className="text-sm text-muted-foreground">Offline</p>
                  </div>
                </div>
                <span className="text-muted-foreground"></span>
              </li>
              <li className="mb-4 p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CF</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      Creative Flow
                    </p>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <span className="text-muted-foreground"></span>
              </li>
              <li className="mb-4 p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>LO</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Logout</p>
                    <p className="text-sm text-muted-foreground"></p>
                  </div>
                </div>
                <span className="text-muted-foreground"></span>
              </li>
            </ul>
          </nav>
        </>
      )}

      {isSidebarOpen && currentPage !== "messages" && (
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li
                  key={item.href}
                  className={`mb-4 ${
                    isActive ? "border-l-4 border-yellow-500 pl-2" : ""
                  }`}
                >
                  <Link
                    href={item.href as any}
                    className={`flex items-center ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="mr-3" size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {!isSidebarOpen && (
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li
                  key={item.href}
                  className={`mb-4 flex justify-center ${
                    isActive ? "border-l-4 border-yellow-500" : ""
                  }`}
                >
                  <Link
                    href={item.href as any}
                    className={`flex items-center ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </aside>
  );
}
