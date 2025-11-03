"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard (Home)" },
    { href: "/marketplace", icon: Briefcase, label: "Marketplace" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/my-listings", icon: List, label: "My Listings" },
    { href: "/applications", icon: Briefcase, label: "Applications / Jobs" },
    { href: "/analytics", icon: BarChart, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/help-support", icon: HelpCircle, label: "Help / Support" },
    { href: "/logout", icon: LogOut, label: "Logout" },
  ];

  return (
    <aside className="w-64 bg-[#2C2C2C] p-6 flex flex-col">
      <div className="flex items-center mb-8">
        <img src="/assets/logo.png" alt="Logo" className="h-8 mr-2" />
        <span className="text-xl font-bold">
          {currentPage === "dashboard" && "Dashboard"}
          {currentPage === "messages" && "Messages"}
          {currentPage === "applications" && "Applications"}
        </span>
      </div>

      {currentPage === "messages" && (
        <>
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-lg bg-[#3A3A3A] border-none text-white focus:ring-0 focus:outline-none"
            />
          </div>
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <nav className="flex-1">
            <ul>
              <li className="mb-4">
                <Link
                  href="/messages"
                  className="flex items-center text-gray-400 hover:text-white"
                >
                  <MessageSquare className="mr-3" size={20} />
                  Conversations
                </Link>
              </li>
              <li className="mb-4 bg-[#3A3A3A] rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Acme Corp</p>
                    <p className="text-sm text-gray-400">Online</p>
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
                    <p className="font-semibold">Nahom E.</p>
                    <p className="text-sm text-gray-400">Offline</p>
                  </div>
                </div>
                <span className="text-gray-400"></span>
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
                    <p className="font-semibold">Nahom E.</p>
                    <p className="text-sm text-gray-400">Offline</p>
                  </div>
                </div>
                <span className="text-gray-400"></span>
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
                    <p className="font-semibold">Creative Flow</p>
                    <p className="text-sm text-gray-400">Online</p>
                  </div>
                </div>
                <span className="text-gray-400"></span>
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
                    <p className="font-semibold">Logout</p>
                    <p className="text-sm text-gray-400"></p>
                  </div>
                </div>
                <span className="text-gray-400"></span>
              </li>
            </ul>
          </nav>
        </>
      )}

      {currentPage !== "messages" && (
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
                    href={item.href}
                    className={`flex items-center ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-400 hover:text-white"
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
    </aside>
  );
}
