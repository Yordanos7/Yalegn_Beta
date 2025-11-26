"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSession } from "@/hooks/use-session";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  DollarSign,
  TrendingUp,
  Loader,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ListingForm } from "@/components/listing-form";
import Link from "next/link";
import Image from "next/image";

export default function ListsPage() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { session, isLoading: isSessionLoading } = useSession();
  const userId = session?.user?.id;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);

  const {
    data: listings,
    isLoading,
    refetch,
  } = trpc.listing.getByUserId.useQuery(
    { userId: userId || "" },
    { enabled: !!userId }
  );

  const deleteListingMutation = trpc.listing.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to delete listing: " + error.message);
    },
  });

  const updateListingMutation = trpc.listing.update.useMutation({
    onSuccess: () => {
      toast.success("Listing updated successfully!");
      refetch();
      setEditingListing(null);
    },
    onError: (error: any) => {
      toast.error("Failed to update listing: " + error.message);
    },
  });

  const createListingMutation = trpc.listing.create.useMutation({
    onSuccess: () => {
      toast.success("Listing created successfully!");
      refetch();
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to create listing: " + error.message);
    },
  });

  const handleDelete = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteListingMutation.mutateAsync({ id: listingId });
    }
  };

  const stats = {
    total: listings?.length || 0,
    published: listings?.filter((l) => l.isPublished).length || 0,
    draft: listings?.filter((l) => !l.isPublished).length || 0,
    totalValue: listings?.reduce((sum, l) => sum + l.price, 0) || 0,
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentPage="lists"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main
        className={`flex-1 p-4 md:p-8 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your products and services
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <ListingForm
                onSubmit={(data) => createListingMutation.mutate(data)}
                onCancel={() => setIsCreateOpen(false)}
                isSubmitting={createListingMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-blue-500" />
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2">
                All your listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2 text-green-500" />
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.published}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Live on marketplace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <EyeOff className="h-4 w-4 mr-2 text-orange-500" />
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.draft}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Not yet published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ETB {stats.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Combined listing value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <Card
                key={listing.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-muted">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={listing.isPublished ? "default" : "secondary"}
                      className={
                        listing.isPublished
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500"
                      }
                    >
                      {listing.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {listing.currency} {listing.price.toLocaleString()}
                      </p>
                      {listing.category && (
                        <p className="text-xs text-muted-foreground">
                          {listing.category}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>

                    <Dialog
                      open={editingListing?.id === listing.id}
                      onOpenChange={(open) => !open && setEditingListing(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingListing(listing)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Listing</DialogTitle>
                        </DialogHeader>
                        <ListingForm
                          initialData={listing}
                          onSubmit={(data) =>
                            updateListingMutation.mutate({
                              id: listing.id,
                              ...data,
                            })
                          }
                          onCancel={() => setEditingListing(null)}
                          isSubmitting={updateListingMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleteListingMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first listing to start selling on the marketplace
              </p>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
