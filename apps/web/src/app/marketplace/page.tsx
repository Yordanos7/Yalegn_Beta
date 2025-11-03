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
import { RouterOutputs } from "@my-better-t-app/api/routers/types";

type Listing = RouterOutputs["listing"]["getAll"]["listings"][number];

const ListingCard = ({ listing }: { listing: Listing }) => {
  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  console.log("ListingCard - Listing Data:", listing);

  const mediaUrl = listing.videos?.[0] || listing.images?.[0];
  const placeholderUrl = "https://via.placeholder.com/150";
  console.log("ListingCard - Media URL:", mediaUrl);
  console.log("ListingCard - Listing Images:", listing.images);
  console.log("ListingCard - Listing Videos:", listing.videos);

  return (
    <Link href={`/marketplace/${listing.id}`} passHref legacyBehavior>
      <Card className="relative group w-full h-80 bg-cover bg-center rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105">
        {mediaUrl ? (
          isVideo(mediaUrl) ? (
            <video
              src={mediaUrl}
              className="absolute inset-0 w-full h-full object-cover z-0"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${mediaUrl})` }}
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
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(listing.rating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-400"
                }`}
              />
            ))}
            <span className="text-xs ml-1">
              ({listing.rating?.toFixed(1) || "N/A"})
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

  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (listingsData?.listings) {
      setFilteredListings(listingsData.listings);
    }
  }, [listingsData]);

  if (isPending) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="marketplace" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading listings...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="marketplace" />
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
  console.log("Marketplace Listings:", listings); // Log the listings to the console

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="marketplace" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
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
        <div className="flex flex-1 space-x-8">
          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-3 gap-6">
            {filteredListings.map((listing: Listing) => (
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
