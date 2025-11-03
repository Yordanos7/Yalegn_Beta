"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";

export default function OrganizationJobsPage() {
  const { session, isLoading } = useSession();
  const router = useRouter(); // Keep router for other potential navigations if needed

  useEffect(() => {
    if (!isLoading && session?.user?.accountType !== "ORGANIZATION") {
      // Redirect or show access denied if not an organization
      redirect("/access-denied"); // Using redirect for type safety
    }
  }, [session, isLoading]); // Removed router from dependency array as redirect is not dependent on router instance

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="organization-jobs" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading user data...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "ORGANIZATION") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="organization-jobs" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="organization-jobs" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <p className="text-gray-400">
              Manage your job postings and review applicants.
            </p>
          </div>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
            onClick={() => router.push(`/organization/jobs/new`)}
          >
            <Plus className="mr-2" size={20} /> Post New Job
          </Button>
        </header>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Search by job title..."
            className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Status: All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Draft</DropdownMenuItem>
              <DropdownMenuItem>Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Sort by: Newest
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Deadline</DropdownMenuItem>
              <DropdownMenuItem>Most Applicants</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {/* Example Job Card */}
          <Card
            className="bg-[#2C2C2C] p-6 rounded-lg mb-4 flex items-center justify-between cursor-pointer"
            onClick={() => router.push(`/organization/jobs/123/applicants`)} // Link to applicants page
          >
            <div className="flex items-center">
              <Briefcase className="h-12 w-12 mr-4 text-yellow-500" size={32} />
              <div>
                <p className="text-xl font-semibold">
                  Senior Frontend Developer
                </p>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <Users className="mr-1" size={16} />
                  <span>5 Applicants</span>
                  <DollarSign className="ml-4 mr-1" size={16} />
                  <span>Budget: ETB 25,000</span>
                  <Calendar className="ml-4 mr-1" size={16} />
                  <span>Deadline: Nov 30, 2025</span>
                  <Badge className="ml-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2">
                View Applicants
              </Button>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Edit Job
              </Button>
              <Button variant="destructive">Close Job</Button>
            </div>
          </Card>

          {/* Empty State for Seeker */}
          {/*
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <Briefcase size={48} className="mb-4" />
            <p className="text-lg text-center">You haven’t posted any jobs yet — post your first listing and find the right talent!</p>
            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2">
              Post New Job
            </Button>
          </div>
          */}
        </ScrollArea>
      </main>
    </div>
  );
}
