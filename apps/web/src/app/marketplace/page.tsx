"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import {
  Star,
  Package,
  TrendingUp,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import { MarketPlaceFilters } from "@/components/MarketPlaceFilters";
import { useSidebar } from "@/hooks/use-sidebar";
import { renderStars } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { CategoryEnum } from "@my-better-t-app/db/prisma/generated/enums";
import Image from "next/image";

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
  const mediaUrl = listing.images?.[0] || listing.videos?.[0];
  const isVideo = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card className="group overflow-hidden border border-border hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 bg-card">
        {/* Image/Video Section */}
        <div className="relative h-56 overflow-hidden bg-muted">
          {mediaUrl ? (
            isVideo ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          {listing.category && (
            <Badge className="absolute top-3 left-3 bg-yellow-500 text-black hover:bg-yellow-600">
              {listing.category}
            </Badge>
          )}

          {/* New Badge */}
          {new Date(listing.createdAt).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000 && (
            <Badge className="absolute top-3 right-3 bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              New
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4 space-y-3">
          {/* Provider Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-border">
              <AvatarImage src={listing.provider.image || undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {listing.provider.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {listing.provider.name}
            </span>
            {listing.provider.accountType === "ORGANIZATION" && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Org
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-yellow-500 transition-colors">
            {listing.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium ml-1">
                {listing.rating?.toFixed(1) || "0.0"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({listing.reviewCount || 0})
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="text-xl font-bold text-yellow-600">
                {listing.currency} {listing.price.toLocaleString()}
              </p>
            </div>
            {listing.deliveryDays && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {listing.deliveryDays}d
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function MarketplacePage() {
  const { session } = useSession(); // Call useSession hook to get the session object
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
      <div className="flex min-h-screen bg-background">
        <Sidebar
          currentPage="marketplace"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main
          className={`flex-1 p-8 flex items-center justify-center transition-all duration-300 ${
            isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
          }`}
        >
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar
          currentPage="marketplace"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main
          className={`flex-1 p-8 flex items-center justify-center transition-all duration-300 ${
            isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
          }`}
        >
          <Card className="p-8 max-w-md">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Failed to Load</h2>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage="marketplace"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-4 md:p-8 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        {/* Hero Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover amazing products and services from talented creators
              </p>
            </div>
            <Link href="/profile">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-yellow-500 hover:border-yellow-600 transition-colors">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-yellow-500 text-black">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Package className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredListings.length}</p>
                <p className="text-xs text-muted-foreground">Active Listings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {
                    filteredListings.filter(
                      (l) =>
                        new Date(l.createdAt).getTime() >
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">New This Week</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Star className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(
                    filteredListings.reduce(
                      (sum, l) => sum + (l.rating || 0),
                      0
                    ) / filteredListings.length || 0
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <MarketPlaceFilters
            listings={listingsData?.listings || []}
            onFilteredListingsChange={setFilteredListings}
          />
        </div>

        {/* Product Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing: MarketplaceListing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Package className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
