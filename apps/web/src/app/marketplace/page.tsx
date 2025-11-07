"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import Link from "next/link"; // Import Link for navigation
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Star,
  MessageSquare,
  Plus,
  X, // For closing the modal
} from "lucide-react";
import { trpc } from "@/utils/trpc"; // Import trpc
import React, { useEffect, useState } from "react";
import { MarketPlaceFilters } from "@/components/MarketPlaceFilters";
import type { RouterOutputs } from "@my-better-t-app/api/routers/types"; // Use type-only import
import { useSidebar } from "@/hooks/use-sidebar"; // Import the custom hook
import { renderStars } from "@/lib/utils"; // Import renderStars helper

import { CategoryEnum } from "@my-better-t-app/db/prisma/generated/enums";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "ETB" | "USD";
  deliveryDays: number | null;
  category: CategoryEnum | null;
  images: string[];
  videos: string[];
  tags: string[];
  isPublished: boolean;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    name: string;
    image: string | null;
    accountType: "INDIVIDUAL" | "ORGANIZATION" | null;
    location: string | null; // Added location
  };
}

const ListingCard = ({ listing }: { listing: MarketplaceListing }) => {
  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isImage = (url: string) => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  console.log("ListingCard - Listing Data:", listing);

  const mediaUrl = listing.videos?.[0] || listing.images?.[0];
  const placeholderUrl = "https://via.placeholder.com/150";
  console.log("ListingCard - Media URL:", mediaUrl);
  console.log("ListingCard - Listing Images:", listing.images);
  console.log("ListingCard - Listing Videos:", listing.videos);

  console.log("this is media url mediaUrl:", mediaUrl);

  return (
    <Link href={`/marketplace/${listing.id}`} passHref legacyBehavior>
      <Card className="relative group w-full h-80 bg-cover bg-center rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105">
        {mediaUrl ? (
          isImage(mediaUrl) ? (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${mediaUrl})` }}
            />
          ) : isVideo(mediaUrl) ? (
            <video
              src={mediaUrl}
              className="absolute inset-0 w-full h-full object-cover z-0"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            // Fallback for unknown media types, or if mediaUrl is not an image or video
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${placeholderUrl})` }}
            />
          )
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${placeholderUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-opacity-100 group-hover:bg-opacity-50 transition-all duration-300 z-10" />
        <div className="absolute bottom-0 left-0 p-4 text-white w-full z-20">
          <h3 className="text-lg font-bold truncate">{listing.title}</h3>
          <div className="flex items-center mt-1">
            {renderStars({ rating: listing.rating, starClassName: "h-4 w-4" })}
            <span className="text-xs ml-1">
              ({listing.rating?.toFixed(1) || "0.0"}) (
              {listing.reviewCount || 0} reviews)
            </span>
          </div>
          <p className="text-lg font-semibold mt-2">
            {listing.currency} {listing.price.toFixed(2)}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default function MarketplacePage() {
  const {
    data: listingsData,
    isPending,
    error,
  } = trpc.listing.getAll.useQuery();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [filteredListings, setFilteredListings] = useState<
    MarketplaceListing[]
  >([]);

  useEffect(() => {
    if (listingsData?.listings) {
      setFilteredListings(listingsData.listings as MarketplaceListing[]);
    }
  }, [listingsData]);

  if (isPending) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="marketplace"
          isSidebarOpen={true} // Default to open during loading
          toggleSidebar={() => {}} // No-op during loading
        />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading listings...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="marketplace"
          isSidebarOpen={true} // Default to open during error
          toggleSidebar={() => {}} // No-op during error
        />
        <main className="flex-1 p-8 bg-[#411a1a] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">
            Failed to load listings: {error.message}
          </p>
        </main>
      </div>
    );
  }

  const listings = listingsData?.listings || [];
  // Use the custom hook

  console.log("Marketplace Listings:", listings); // Log the listings to the console

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar
        currentPage="marketplace"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-8 bg-[#202020] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        {/* Top Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="Yalegn Marketplace"
              className="h-8 mr-2"
            />
            <span className="text-xl font-bold text-gray-200">
              Yalegn Marketplace
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-4 py-2">
              Products
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Search and Filter Bar */}
        <MarketPlaceFilters
          listings={listingsData?.listings || []}
          onFilteredListingsChange={setFilteredListings}
        />

        {/* Content area for product grid and featured freelancers */}
        <div className="flex flex-1 space-x-8 ">
          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-3 gap-6 ">
            {filteredListings.map((listing: MarketplaceListing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Featured Freelancers Sidebar */}
          <Card className=""></Card>
        </div>
      </main>
    </div>
  );
}
