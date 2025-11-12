"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListingForm } from "@/components/listing-form";
import { Plus, Edit } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateListingDialogProps {
  onListingCreated: () => void;
}

export function CreateListingDialog({
  onListingCreated,
}: CreateListingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createListingMutation = trpc.listing.create.useMutation();

  const handleCreateListing = async (data: any) => {
    try {
      await createListingMutation.mutateAsync(data);
      toast.success("Listing created successfully!");
      setIsOpen(false);
      onListingCreated();
    } catch (err: any) {
      toast.error("Failed to create listing.", {
        description: err.message || "An unknown error occurred.",
      });
      console.error("Error creating listing:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create New Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card text-foreground p-6 rounded-lg max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="text-2xl font-bold mb-4">
          Create New Listing
        </DialogTitle>
        <ListingForm
          onSubmit={handleCreateListing}
          onCancel={() => setIsOpen(false)}
          isSubmitting={createListingMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditListingDialogProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: "ETB" | "USD";
    deliveryDays?: number | null; // Allow null for deliveryDays
    category?: string | null; // Allow null for category
    images: string[];
    videos?: string[];
    tags: string[];
    isPublished: boolean;
  };
  onListingUpdated: () => void;
}

export function EditListingDialog({
  listing,
  onListingUpdated,
}: EditListingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateListingMutation = trpc.listing.update.useMutation();

  const handleUpdateListing = async (data: any) => {
    try {
      await updateListingMutation.mutateAsync({ id: listing.id, ...data });
      toast.success("Listing updated successfully!");
      setIsOpen(false);
      onListingUpdated();
    } catch (err: any) {
      toast.error("Failed to update listing.", {
        description: err.message || "An unknown error occurred.",
      });
      console.error("Error updating listing:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card text-foreground p-6 rounded-lg max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="text-2xl font-bold mb-4">
          Edit Listing
        </DialogTitle>
        <ListingForm
          initialData={listing}
          onSubmit={handleUpdateListing}
          onCancel={() => setIsOpen(false)}
          isSubmitting={updateListingMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
