"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { XCircle } from "lucide-react"; // Import XCircle

const portfolioFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(), // Added description
  link: z
    .string()
    .url({ message: "Must be a valid URL." })
    .min(1, { message: "Link is required." }),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

interface PortfolioFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: PortfolioFormValues & { id: string }; // Added for editing
}

export function PortfolioForm({
  userId,
  onSuccess,
  onCancel,
  initialData,
}: PortfolioFormProps) {
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          link: initialData.link,
        }
      : {
          title: "",
          description: "",
          link: "",
        },
  });

  const createPortfolioMutation = trpc.user.addPortfolioItem.useMutation({
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Failed to add portfolio item: " + error.message);
    },
  });

  const editPortfolioMutation = trpc.user.editPortfolioItem.useMutation({
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Failed to edit portfolio item: " + error.message);
    },
  });

  async function onSubmit(values: PortfolioFormValues) {
    if (initialData) {
      editPortfolioMutation.mutate({
        id: initialData.id,
        userId,
        ...values,
      });
    } else {
      createPortfolioMutation.mutate({
        userId,
        ...values,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., My Awesome Project"
                  className="bg-[#3A3A3A] border-none text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  className="bg-[#3A3A3A] border-none text-white"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of your portfolio item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Link</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., https://github.com/my-project or https://my-website.com"
                  className="bg-[#3A3A3A] border-none text-white"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link to your live project, GitHub repository, or personal
                website.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createPortfolioMutation.isPending ||
              editPortfolioMutation.isPending
            }
          >
            {(createPortfolioMutation.isPending ||
              editPortfolioMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? "Save Changes" : "Add Portfolio Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
