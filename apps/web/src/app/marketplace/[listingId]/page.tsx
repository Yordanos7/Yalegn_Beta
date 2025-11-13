"use client";

import { useRouter, useParams } from "next/navigation"; // Import useParams
import Link from "next/link"; // Import Link for navigation
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquare,
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Play, // Import Play icon
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSession } from "@/hooks/use-session"; // Import useSession
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components
// ReviewForm will be moved to cart page
import { formatDistanceToNow } from "date-fns"; // For date formatting
import { useCart } from "@/context/CartContext"; // Import useCart
import { toast } from "sonner"; // Import toast for notifications
import {
  OrderStatus,
  Currency,
} from "@my-better-t-app/db/prisma/generated/enums"; // Import OrderStatus and Currency enum
import { Input } from "@/components/ui/input"; // Import Input for file upload
import { Label } from "@/components/ui/label"; // Import Label for file upload
// UploadButton has been removed, using standard input for URL
import { CheckCircle, XCircle } from "lucide-react"; // Import icons for status

interface ListingDetailPageProps {
  params: {
    listingId: string;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "ETB" | "USD";
  deliveryDays?: number;
  categoryId?: string;
  category?: string; // Corrected: category is a string (CategoryEnum value)
  images: string[];
  videos: string[]; // Add videos array
  tags: string[];
  isPublished: boolean;
  rating?: number;
  reviewCount?: number;
  provider: {
    id: string;
    name: string;
    image?: string;
    accountType: "INDIVIDUAL" | "ORGANIZATION" | null; // accountType can be null
    location?: string;
  };
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
}

interface OrderWithDetails {
  id: string;
  buyerId: string;
  listingId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  currency: Currency;
  paymentDetails: {
    accountNumber: string;
    accountOwner: string;
    selectedBank: string;
    paymentSenderLink: string;
  };
  orderStatus: OrderStatus;
  deliveryProofUrl: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    price: number;
    currency: Currency;
  };
  buyer: {
    id: string;
    name: string;
    image: string | null;
    email: string | null; // Changed to string | null
    phone: string | null; // Changed to string | null
  };
}

interface RelatedListing {
  id: string;
  title: string;
  price: number;
  currency: "ETB" | "USD";
  images: string[];
  rating: number | null; // Changed from number? to number | null
  reviewCount: number; // Changed from number? to number
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  by: {
    id: string;
    name: string;
    image: string | null;
  };
  contractId: string | null;
  listingId: string | null;
  aboutId: string;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.listingId as string;
  const { session } = useSession(); // Get session for authenticated user
  const currentUserId = session?.user?.id;

  const {
    data: listingData,
    isPending,
    error,
  } = trpc.listing.getById.useQuery(
    { id: listingId },
    {
      enabled: !!listingId, // Only run query if listingId is available
    }
  );

  // Fetch orders for this listing if the current user is the seller
  const {
    data: ordersForListing,
    isPending: isOrdersPending,
    error: ordersError,
    refetch: refetchOrders,
  } = trpc.order.getOrdersForSeller.useQuery(
    { listingId: listingId }, // Pass listingId as input
    {
      enabled: !!listingData && currentUserId === listingData.provider.id,
    }
  );

  const sellerOrders = ordersForListing || [];

  const uploadDeliveryProofMutation =
    trpc.order.uploadDeliveryProof.useMutation();
  const sellerConfirmProductSentMutation =
    trpc.order.sellerConfirmProductSent.useMutation(); // New mutation

  const [deliveryProofUrlInput, setDeliveryProofUrlInput] =
    useState<string>("");

  const handleConfirmProductSent = async (orderId: string) => {
    try {
      await sellerConfirmProductSentMutation.mutateAsync({ orderId });
      toast.success(
        "Product marked as sent! Buyer and admin have been notified."
      );
      refetchOrders(); // Refetch orders to update status
    } catch (err: any) {
      console.error("Error confirming product sent:", err);
      toast.error(
        `Failed to mark product as sent: ${err.message || "Unknown error"}`
      );
    }
  };

  const handleDeliveryProofUpload = async (orderId: string) => {
    if (!deliveryProofUrlInput) {
      toast.error("Please enter a delivery proof URL.");
      return;
    }

    try {
      await uploadDeliveryProofMutation.mutateAsync({
        orderId,
        deliveryProofUrl: deliveryProofUrlInput,
      });
      toast.success("Delivery proof uploaded successfully!");
      setDeliveryProofUrlInput(""); // Clear the input
      refetchOrders(); // Refetch orders to update status
    } catch (err: any) {
      console.error("Error uploading delivery proof:", err);
      toast.error(
        `Failed to upload delivery proof: ${err.message || "Unknown error"}`
      );
    }
  };

  // Use listingData directly after the initial fetch
  const listing = listingData as Listing;

  const {
    data: relatedListingsData,
    isPending: isRelatedListingsPending,
    error: relatedListingsError,
  } = trpc.listing.getRelated.useQuery(
    {
      listingId: listingId,
      categoryId: (listingData?.category as string) || "", // Explicitly cast to string
    },
    {
      enabled: !!listingData && !!listingData.category, // Only fetch if listingData and category are available
    }
  );

  const {
    data: reviewsData,
    isPending: isReviewsPending,
    error: reviewsError,
  } = trpc.review.getReviewsForListing.useQuery(
    { listingId: listingId },
    {
      enabled: !!listingId,
    }
  );

  const reviews = (reviewsData || []) as Review[];

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // this is for image/video carousel
  const [quantity, setQuantity] = useState(1); // Quantity state for purchase
  const { addToCart } = useCart(); // Use the cart context
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // State for video modal

  useEffect(() => {
    if (listing && listing.images && listing.images.length > 0) {
      setCurrentMediaIndex(0); // Reset to first image when listing changes
    }
  }, [listing]);

  const handleAddToCart = () => {
    if (!listing) return;

    const itemToAdd = {
      id: listing.id,
      name: listing.title,
      type: "product" as const, // Assuming all marketplace items are products for now
      provider: listing.provider.name,
      rating: listing.rating || 0,
      imageUrl: listing.images[0] || "/placeholder-image.jpg",
      price: listing.price,
      isInstant: false, // Assuming products are not instant services
    };
    addToCart(itemToAdd, quantity);
    toast.success(`${quantity} x "${listing.title}" added to cart!`);
  };

  useEffect(() => {
    if (listing?.images && listing.images.length > 0) {
      const currentMediaUrl = listing.images[currentMediaIndex];
      if (currentMediaUrl) {
        console.log("Current media URL:", currentMediaUrl);
        console.log("Is video:", isVideo(currentMediaUrl));
      }
    }
  }, [listing, currentMediaIndex]);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12">
        Listing not found.
      </div>
    );
  }

  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isProvider = currentUserId === listing.provider.id;
  // hasReviewed will be handled on the cart page
  // const hasReviewed = reviews.some((review) => review.by.id === currentUserId);

  console.log("Rendering listing:", listing);
  console.log("Listing images array:", listing.images);
  console.log("videoExtensions check:", isVideo(listing.images[0] || ""));

  console.log("show it is seller?", isProvider);
  console.log("show it is provider?", listing.provider.id);
  console.log("Debug Info:");
  console.log("  listingId:", listingId);
  console.log("  currentUserId:", currentUserId);
  console.log("  listingData?.provider.id:", listingData?.provider.id);
  console.log("  isProvider:", isProvider);
  console.log("  ordersForListing:", ordersForListing);
  console.log("  sellerOrders.length:", sellerOrders.length);
  console.log("  currentUserId:", currentUserId);
  console.log("  listing.provider.id:", listing.provider.id);
  console.log("  listing.images:", listing.images);
  console.log("  listing.images.some(isVideo):", listing.images.some(isVideo));

  return (
    <main className=" mx-auto px-4 py-8 md:py-12 bg-background text-foreground">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        &larr; Back to Marketplace
      </Button>

      {isProvider && (
        <Card className="p-6 bg-card rounded-lg shadow-sm mb-8">
          <CardTitle className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Orders for
            Your Listing
          </CardTitle>
          <CardContent className="p-0 space-y-6">
            {sellerOrders.length > 0 ? (
              sellerOrders.map((order: OrderWithDetails) => {
                console.log(`Order ${order.id} status:`, order.orderStatus);
                return (
                  <React.Fragment key={order.id}>
                    <div className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                order.buyer.image || "/placeholder-avatar.jpg"
                              }
                              alt={order.buyer.name}
                            />
                            <AvatarFallback>
                              {order.buyer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.buyer.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ordered {order.quantity} item(s)
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`
                            ${
                              order.orderStatus === OrderStatus.COMPLETED &&
                              "bg-green-500"
                            }
                            ${
                              order.orderStatus === OrderStatus.DELIVERED &&
                              "bg-blue-500"
                            }
                            ${
                              order.orderStatus ===
                                OrderStatus.PAYMENT_RECEIVED && "bg-yellow-500"
                            }
                            ${
                              order.orderStatus ===
                                OrderStatus.PENDING_PAYMENT && "bg-orange-500"
                            }
                            ${
                              order.orderStatus === OrderStatus.CANCELLED &&
                              "bg-red-500"
                            }
                          `}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-4">
                        <div>
                          <p>
                            <span className="font-semibold text-foreground">
                              Total Price:
                            </span>{" "}
                            {order.currency} {order.totalPrice.toFixed(2)}
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">
                              Payment Account:
                            </span>{" "}
                            {order.paymentDetails.accountNumber}
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">
                              Account Owner:
                            </span>{" "}
                            {order.paymentDetails.accountOwner}
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">
                              Selected Bank:
                            </span>{" "}
                            {order.paymentDetails.selectedBank}
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">
                              Payment Link:
                            </span>{" "}
                            <a
                              href={order.paymentDetails.paymentSenderLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {order.paymentDetails.paymentSenderLink}
                            </a>
                          </p>
                        </div>
                        {order.orderStatus === OrderStatus.PENDING_PAYMENT && (
                          <div className="space-y-2">
                            <p className="text-orange-600 font-semibold">
                              Action Required: Confirm Product Sent
                            </p>
                            <Button
                              onClick={() => handleConfirmProductSent(order.id)}
                              disabled={
                                sellerConfirmProductSentMutation.isPending
                              }
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {sellerConfirmProductSentMutation.isPending
                                ? "Sending..."
                                : "Send Product"}
                            </Button>
                            <p className="text-xs text-red-500 mt-2">
                              <span className="font-bold">
                                Important Warning:
                              </span>{" "}
                              If you confirm selling and do not send the
                              product, your account will be banned by the Yalegn
                              Team and you may face legal action. The money is
                              held by the Yalegn Team until the buyer confirms
                              delivery.
                            </p>
                          </div>
                        )}
                        {order.orderStatus === OrderStatus.DELIVERY_PENDING && (
                          <div className="space-y-2">
                            <Label htmlFor={`delivery-proof-${order.id}`}>
                              Delivery Proof (e.g., Post Office Receipt Image
                              URL)
                            </Label>
                            <Input
                              id={`delivery-proof-${order.id}`}
                              type="url"
                              placeholder="Enter URL for delivery proof"
                              value={deliveryProofUrlInput}
                              onChange={(e) =>
                                setDeliveryProofUrlInput(e.target.value)
                              }
                              className="mb-2"
                            />
                            <Button
                              onClick={() =>
                                handleDeliveryProofUpload(order.id)
                              }
                              disabled={
                                !deliveryProofUrlInput ||
                                uploadDeliveryProofMutation.isPending
                              }
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {uploadDeliveryProofMutation.isPending
                                ? "Uploading..."
                                : "Upload Delivery Proof"}
                            </Button>
                          </div>
                        )}
                        {order.orderStatus === OrderStatus.DELIVERED &&
                          order.deliveryProofUrl && (
                            <div className="text-sm text-green-600">
                              <p className="font-semibold">
                                Delivery Confirmed by Seller
                              </p>
                              <a
                                href={order.deliveryProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Delivery Proof
                              </a>
                              <p className="text-xs text-muted-foreground mt-1">
                                Waiting for buyer to confirm delivery.
                              </p>
                            </div>
                          )}
                        {order.orderStatus === OrderStatus.COMPLETED && (
                          <div className="text-sm text-green-600">
                            <p className="font-semibold flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Order
                              Completed
                            </p>
                            {order.deliveryProofUrl && (
                              <a
                                href={order.deliveryProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Delivery Proof
                              </a>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Payment released to your account.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <p className="text-muted-foreground">
                No orders for this listing yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Media Display and Thumbnails */}
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          {/* Main Media Display with Navigation */}
          <Card className="p-4 bg-card rounded-lg shadow-sm relative">
            {listing.images && listing.images.length > 0 ? (
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-muted rounded-md overflow-hidden">
                {listing.images[currentMediaIndex] &&
                isVideo(listing.images[currentMediaIndex]) ? (
                  <video
                    src={listing.images[currentMediaIndex]}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      console.error("Video error:", e.currentTarget.error)
                    }
                  />
                ) : (
                  <Image
                    src={
                      listing.images[currentMediaIndex] ||
                      "/placeholder-image.jpg"
                    } // Fallback for Image src
                    alt={listing.title}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                    onError={(e) =>
                      console.error("Image error:", e.currentTarget.src)
                    }
                  />
                )}
                {listing.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground dark:bg-black/50 dark:hover:bg-black/70 dark:text-white"
                      onClick={() =>
                        setCurrentMediaIndex((prev) =>
                          prev === 0 ? listing.images.length - 1 : prev - 1
                        )
                      }
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground dark:bg-black/50 dark:hover:bg-black/70 dark:text-white"
                      onClick={() =>
                        setCurrentMediaIndex((prev) =>
                          prev === listing.images.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[400px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                No media available
              </div>
            )}

            {/* "Watch Video" Button */}
            {listing.videos && listing.videos.length > 0 && (
              <Dialog
                open={isVideoModalOpen}
                onOpenChange={setIsVideoModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-6 py-2 flex items-center justify-center">
                    <Play className="mr-2 h-5 w-5" /> Watch Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                  <DialogTitle className="sr-only">Watch Video</DialogTitle>
                  <DialogDescription className="sr-only">
                    Playing the product video.
                  </DialogDescription>
                  <div className="relative w-full h-[450px] bg-black">
                    <video
                      src={listing.videos[0] || ""}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                      onError={(e) =>
                        console.error(
                          "Modal video error:",
                          e.currentTarget.error
                        )
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                {listing.images.map((mediaUrl, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                      index === currentMediaIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    onClick={() => setCurrentMediaIndex(index)}
                  >
                    {mediaUrl && isVideo(mediaUrl) ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          console.error(
                            "Thumbnail video error:",
                            e.currentTarget.error
                          )
                        }
                      />
                    ) : (
                      <Image
                        src={mediaUrl || "/placeholder-image.jpg"} // Fallback for Image src
                        alt={`Thumbnail ${index + 1}`}
                        width={96}
                        height={96}
                        objectFit="cover"
                        onError={(e) =>
                          console.error(
                            "Thumbnail image error:",
                            e.currentTarget.src
                          )
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Description */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-xl font-semibold mb-4">
              Description
            </CardTitle>
            <CardContent className="p-0 text-muted-foreground whitespace-pre-line">
              <p>{listing.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-xl font-semibold mb-4">Tags</CardTitle>
            <CardContent className="p-0">
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Product Info and Actions */}
        <div className="md:col-span-1 lg:col-span-1 space-y-6">
          {/* Listing Summary */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-2xl font-bold mb-2">
              {listing.title}
            </CardTitle>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(listing.rating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({listing.rating?.toFixed(1) || "N/A"}) (
                {listing.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price and Discount Section */}
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              <p className="text-sm font-semibold">Welcome deal • SuperDeals</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-primary">
                  {listing.currency} {listing.price.toFixed(2)}
                </p>
                {/* Assuming a discount for demonstration */}
                <p className="text-sm text-muted-foreground line-through">
                  {listing.currency} {(listing.price * 1.5).toFixed(2)}
                </p>
                <p className="text-xs text-red-500">Only 64 left</p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mb-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Ship to:</span>{" "}
                Ethiopia
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Free shipping over
                </span>{" "}
                {listing.currency} 1,675.25
              </p>
              <p>
                <span className="font-semibold text-foreground">Delivery:</span>{" "}
                Nov 03 - 16
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-foreground">Quantity:</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="px-3">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-6 py-2 flex items-center mb-2"
              // Removed direct navigation to review prompt from here
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center"
              onClick={handleAddToCart}
            >
              <Plus className="mr-2" /> Add to Cart
            </Button>
          </Card>

          {/* Customer Reviews Summary */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-xl font-semibold mb-4">
              Customer Reviews
            </CardTitle>
            {isReviewsPending ? (
              <p className="text-muted-foreground">Loading reviews...</p>
            ) : reviewsError ? (
              <p className="text-red-500">
                Error loading reviews: {reviewsError.message}
              </p>
            ) : reviews.length > 0 ? (
              <>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(listing.rating || 0)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold ml-2">
                    {listing.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({listing.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="space-y-4 mt-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-t border-border pt-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={review.by.image || "/placeholder-avatar.jpg"}
                            alt={review.by.name}
                          />
                          <AvatarFallback>{review.by.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {review.by.name}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                            <span className="ml-1">
                              {review.rating.toFixed(1)}
                            </span>
                            <span className="ml-2">
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            )}
          </Card>

          {/* Seller Information */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-xl font-semibold mb-4">
              Sold by
            </CardTitle>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={listing.provider.image || "/placeholder-avatar.jpg"}
                  alt={listing.provider.name}
                />
                <AvatarFallback>{listing.provider.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {listing.provider.name}
                </h3>
                <Button variant="link" className="p-0 h-auto text-sm">
                  View Store
                </Button>
              </div>
            </div>
          </Card>

          {/* Additional Details (simplified) */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardTitle className="text-xl font-semibold mb-4">
              Service Guarantees
            </CardTitle>
            <CardContent className="p-0 space-y-2 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">
                  Return & Refund Policy
                </span>
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Security & Privacy
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Message Seller Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} /> Message Seller
          </Button>
        </div>
      </div>

      {/* Related Items Section */}
      {isRelatedListingsPending ? (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      ) : relatedListingsError ? (
        <div className="mt-12 text-red-500">
          Error loading related listings: {relatedListingsError.message}
        </div>
      ) : relatedListingsData && relatedListingsData.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedListingsData.map((item: RelatedListing) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <Card className="p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-32 bg-muted rounded-md mb-2 overflow-hidden">
                    <Image
                      src={item.images[0] || `/placeholder-image.jpg`}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      onError={(e) =>
                        console.error(
                          "Related item image error:",
                          e.currentTarget.src
                        )
                      }
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.currency} {item.price.toFixed(2)}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    View
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 text-muted-foreground">
          No related items found.
        </div>
      )}
    </main>
  );
}
