"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreateListingDialog,
  EditListingDialog,
} from "@/components/listing-dialogs";

export default function ListsPage() {
  const { session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

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
    onError: (error) => {
      toast.error("Failed to delete listing: " + error.message);
    },
  });

  const handleDelete = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteListingMutation.mutateAsync({ id: listingId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Listings</h1>
        <p>Loading listings...</p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Listings</h1>
        <p>No listings found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <CreateListingDialog onListingCreated={refetch} />
      </div>

      <Card className="w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell>{listing.category || "N/A"}</TableCell>
                  <TableCell>${listing.price}</TableCell>
                  <TableCell>{listing.isPublished ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <EditListingDialog
                      listing={listing}
                      onListingUpdated={refetch}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleDelete(listing.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
