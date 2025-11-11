"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, ShoppingCart, Filter, X } from "lucide-react"; // Added Filter icon and X
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { CategoryEnum } from "@my-better-t-app/db/prisma/generated/enums"; // Import CategoryEnum
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components

interface Category {
  id: string;
  name: string;
  slug: string;
  label: string; // Added label property
}

interface CategoriesResponse {
  categories: Category[];
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "ETB" | "USD";
  deliveryDays: number | null; // Changed to number | null
  category: CategoryEnum | null; // Changed to CategoryEnum | null
  images: string[];
  videos: string[]; // Changed to string[]
  tags: string[];
  isPublished: boolean;
  rating: number | null; // Changed to number | null
  reviewCount: number; // Changed to number
  provider: {
    id: string;
    name: string;
    image: string | null; // Changed to string | null
    accountType: "INDIVIDUAL" | "ORGANIZATION" | null; // Changed to include null
    location: string | null; // Changed to string | null
  };
  createdAt: string; // Changed to string
  updatedAt: string; // Changed to string
}

interface FilterProps {
  listings: Listing[];
  onFilteredListingsChange: (filteredListings: Listing[]) => void;
}

export const MarketPlaceFilters: React.FC<FilterProps> = ({
  listings,
  onFilteredListingsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });
  const [shippingLocation, setShippingLocation] = useState<string | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<number | null>(
    null
  );

  const { data: categoriesData, isPending: isCategoriesPending } =
    trpc.category.getAll.useQuery<CategoriesResponse>();

  const dynamicCategories =
    (categoriesData as CategoriesResponse)?.categories || [];

  // Derive unique locations from listings
  const dynamicLocations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    listings.forEach((listing) => {
      if (listing.provider.location) {
        uniqueLocations.add(listing.provider.location);
      }
    });
    return Array.from(uniqueLocations);
  }, [listings]);

  // Derive unique delivery days from listings
  const dynamicDeliveryOptions = useMemo(() => {
    const uniqueDeliveryDays = new Set<number>();
    listings.forEach((listing) => {
      if (listing.deliveryDays !== null && listing.deliveryDays !== undefined) {
        // Handle null
        uniqueDeliveryDays.add(listing.deliveryDays);
      }
    });
    return Array.from(uniqueDeliveryDays)
      .sort((a, b) => a - b)
      .map((days) => ({ label: `${days} Days`, value: days }));
  }, [listings]);

  const applyFilters = useCallback(() => {
    let currentListings = listings;

    // Apply search term filter
    if (searchTerm) {
      currentListings = currentListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          listing.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (selectedCategory) {
      currentListings = currentListings.filter(
        (listing) => listing.category === selectedCategory
      );
    }

    // Apply price range filter
    if (priceRange.min !== null || priceRange.max !== null) {
      currentListings = currentListings.filter((listing) => {
        const minPrice = priceRange.min !== null ? priceRange.min : -Infinity;
        const maxPrice = priceRange.max !== null ? priceRange.max : Infinity;
        return listing.price >= minPrice && listing.price <= maxPrice;
      });
    }

    // Apply shipping location filter
    if (shippingLocation) {
      currentListings = currentListings.filter(
        (listing) =>
          listing.provider.location?.toLowerCase() ===
          shippingLocation.toLowerCase()
      );
    }

    // Apply estimated delivery filter
    if (estimatedDelivery !== null) {
      currentListings = currentListings.filter(
        (listing) =>
          listing.deliveryDays !== null && // Handle null
          listing.deliveryDays !== undefined &&
          listing.deliveryDays <= estimatedDelivery
      );
    }
    return currentListings;
  }, [
    listings,
    searchTerm,
    selectedCategory,
    priceRange,
    shippingLocation,
    estimatedDelivery,
  ]);

  // Use useMemo to re-filter only when dependencies change
  const memoizedFilteredListings = useMemo(() => {
    return applyFilters();
  }, [applyFilters]);

  React.useEffect(() => {
    onFilteredListingsChange(memoizedFilteredListings);
  }, [memoizedFilteredListings, onFilteredListingsChange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange({ min: null, max: null });
    setShippingLocation(null);
    setEstimatedDelivery(null);
  };

  console.log("this is category I get from Backend", dynamicCategories);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 mb-8 bg-[#2C2C2C] p-3 rounded-lg">
      <div className="relative w-full sm:w-auto flex-grow">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 rounded-lg bg-[#3A3A3A] border-none text-white focus:ring-0 focus:outline-none w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Button for small screens */}
      <Sheet>
        <SheetTrigger asChild className="sm:hidden">
          <Button
            variant="outline"
            className="w-full bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] hover:text-white"
          >
            <Filter className="mr-2" size={16} />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="bg-[#2C2C2C] text-white w-full max-w-xs sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Filter Marketplace</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex items-center w-full justify-center"
                  disabled={isCategoriesPending}
                >
                  Category ({selectedCategory || "All"}){" "}
                  <ChevronDown className="ml-1" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
                <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                {isCategoriesPending ? (
                  <DropdownMenuItem disabled>
                    Loading categories...
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => setSelectedCategory(null)}
                      className="hover:bg-[#4A4A4A] cursor-pointer"
                    >
                      All
                    </DropdownMenuItem>
                    {dynamicCategories.map(
                      (category: {
                        id: string;
                        name: string;
                        slug: string;
                      }) => (
                        <DropdownMenuItem
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className="hover:bg-[#4A4A4A] cursor-pointer"
                        >
                          {category.name}
                        </DropdownMenuItem>
                      )
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Range Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex items-center w-full justify-center"
                >
                  Price Range (
                  {priceRange.min !== null || priceRange.max !== null
                    ? `$${priceRange.min || 0} - $${priceRange.max || "Max"}`
                    : "All"}
                  ) <ChevronDown className="ml-1" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none p-2">
                <DropdownMenuLabel>Set Price Range</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                <div className="flex flex-col space-y-2 p-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min !== null ? priceRange.min : ""}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    className="bg-[#2C2C2C] border-none text-white focus:ring-0 focus:outline-none"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max !== null ? priceRange.max : ""}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    className="bg-[#2C2C2C] border-none text-white focus:ring-0 focus:outline-none"
                  />
                  <Button
                    onClick={() => setPriceRange({ min: null, max: null })}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Shipping Location Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex items-center w-full justify-center"
                >
                  Shipping Location ({shippingLocation || "All"}){" "}
                  <ChevronDown className="ml-1" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
                <DropdownMenuLabel>Select Location</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem
                  onClick={() => setShippingLocation(null)}
                  className="hover:bg-[#4A4A4A] cursor-pointer"
                >
                  All
                </DropdownMenuItem>
                {dynamicLocations.map((location) => (
                  <DropdownMenuItem
                    key={location}
                    onClick={() => setShippingLocation(location)}
                    className="hover:bg-[#4A4A4A] cursor-pointer"
                  >
                    {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Estimated Delivery Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex items-center w-full justify-center"
                >
                  Estimated Delivery (
                  {estimatedDelivery !== null
                    ? `${estimatedDelivery} Days`
                    : "Any"}
                  ) <ChevronDown className="ml-1" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
                <DropdownMenuLabel>Select Delivery Time</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem
                  onClick={() => setEstimatedDelivery(null)}
                  className="hover:bg-[#4A4A4A] cursor-pointer"
                >
                  Any
                </DropdownMenuItem>
                {dynamicDeliveryOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setEstimatedDelivery(option.value)}
                    className="hover:bg-[#4A4A4A] cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters Button */}
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white flex items-center w-full justify-center"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
                setPriceRange({ min: null, max: null });
                setShippingLocation(null);
                setEstimatedDelivery(null);
              }}
            >
              <X className="mr-1" size={16} />
              Clear
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Filters for large screens */}
      <div className="hidden sm:flex flex-wrap items-center gap-4 flex-grow">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white flex items-center w-full sm:w-auto justify-center"
              disabled={isCategoriesPending}
            >
              Category ({selectedCategory || "All"}){" "}
              <ChevronDown className="ml-1" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
            <DropdownMenuLabel>Select Category</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {isCategoriesPending ? (
              <DropdownMenuItem disabled>
                Loading categories...
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => setSelectedCategory(null)}
                  className="hover:bg-[#4A4A4A] cursor-pointer"
                >
                  All
                </DropdownMenuItem>
                {dynamicCategories.map(
                  (category: { id: string; name: string; slug: string }) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="hover:bg-[#4A4A4A] cursor-pointer"
                    >
                      {category.name}
                    </DropdownMenuItem>
                  )
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Price Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white flex items-center w-full sm:w-auto justify-center"
            >
              Price Range (
              {priceRange.min !== null || priceRange.max !== null
                ? `$${priceRange.min || 0} - $${priceRange.max || "Max"}`
                : "All"}
              ) <ChevronDown className="ml-1" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none p-2">
            <DropdownMenuLabel>Set Price Range</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            <div className="flex flex-col space-y-2 p-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={priceRange.min !== null ? priceRange.min : ""}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                className="bg-[#2C2C2C] border-none text-white focus:ring-0 focus:outline-none"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={priceRange.max !== null ? priceRange.max : ""}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                className="bg-[#2C2C2C] border-none text-white focus:ring-0 focus:outline-none"
              />
              <Button
                onClick={() => setPriceRange({ min: null, max: null })}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Shipping Location Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white flex items-center w-full sm:w-auto justify-center"
            >
              Shipping Location ({shippingLocation || "All"}){" "}
              <ChevronDown className="ml-1" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
            <DropdownMenuLabel>Select Location</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem
              onClick={() => setShippingLocation(null)}
              className="hover:bg-[#4A4A4A] cursor-pointer"
            >
              All
            </DropdownMenuItem>
            {dynamicLocations.map((location) => (
              <DropdownMenuItem
                key={location}
                onClick={() => setShippingLocation(location)}
                className="hover:bg-[#4A4A4A] cursor-pointer"
              >
                {location}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Estimated Delivery Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white flex items-center w-full sm:w-auto justify-center"
            >
              Estimated Delivery (
              {estimatedDelivery !== null ? `${estimatedDelivery} Days` : "Any"}
              ) <ChevronDown className="ml-1" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#3A3A3A] text-white border-none">
            <DropdownMenuLabel>Select Delivery Time</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem
              onClick={() => setEstimatedDelivery(null)}
              className="hover:bg-[#4A4A4A] cursor-pointer"
            >
              Any
            </DropdownMenuItem>
            {dynamicDeliveryOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setEstimatedDelivery(option.value)}
                className="hover:bg-[#4A4A4A] cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/freelancers" className="w-full sm:w-auto">
          <Button className="bg-[#3A3A3A] hover:bg-[#4A4A4A] text-gray-300 font-semibold rounded-lg px-4 py-2 flex items-center w-full justify-center">
            <ShoppingCart className="mr-2" size={16} />
            Freelancers
          </Button>
        </Link>
      </div>
    </div>
  );
};
