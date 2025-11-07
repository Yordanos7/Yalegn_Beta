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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  // navItems are now in the Header component

  return (
    <aside
      className={`bg-[#2C2C2C] p-6 flex-col transition-all duration-300 ease-in-out hidden md:flex ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        {isSidebarOpen && (
          <div className="flex items-center">
            <img src="/assets/logo.png" alt="Logo" className="h-8 mr-2" />
            <span className="text-xl font-bold">
              {currentPage === "dashboard" && "Dashboard"}
              {currentPage === "messages" && "Messages"}
              {currentPage === "applications" && "Applications"}
            </span>
          </div>
        )}
        {/* Removed Menu button from sidebar */}
      </div>

      {isSidebarOpen && currentPage === "messages" && (
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

      {isSidebarOpen && currentPage !== "messages" && (
        <nav className="flex-1">
          <ul>{/* Nav items are now in header */}</ul>
        </nav>
      )}

      {!isSidebarOpen && (
        <nav className="flex-1">
          <ul>{/* Nav items are now in header */}</ul>
        </nav>
      )}
    </aside>
  );
}
