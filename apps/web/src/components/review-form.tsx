"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";

const reviewFormSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating is required")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .max(500, "Comment cannot exceed 500 characters")
    .optional(),
});

interface ReviewFormProps {
  aboutId: string;
  contractId?: string;
  listingId?: string;
  onReviewSubmitted: () => void; // Renamed from onSuccess
  onCancel: () => void;
}

export function ReviewForm({
  aboutId,
  contractId,
  listingId,
  onReviewSubmitted, // Destructure renamed prop
  onCancel,
}: ReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const createReviewMutation = trpc.review.createReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      onReviewSubmitted(); // Call renamed prop
    },
    onError: (error) => {
      toast.error("Failed to submit review.", {
        description: error.message,
      });
    },
  });

  async function onSubmit(values: z.infer<typeof reviewFormSchema>) {
    await createReviewMutation.mutateAsync({
      aboutId,
      contractId,
      listingId, // Pass listingId
      rating: values.rating,
      comment: values.comment,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                      key={starValue}
                      className={`h-8 w-8 cursor-pointer ${
                        (hoveredRating || field.value) >= starValue
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => field.onChange(starValue)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createReviewMutation.isPending}>
            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
