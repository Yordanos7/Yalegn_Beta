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
import { Loader2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const portfolioFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
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
}

export function PortfolioForm({
  userId,
  onSuccess,
  onCancel,
}: PortfolioFormProps) {
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      title: "",
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

  async function onSubmit(values: PortfolioFormValues) {
    createPortfolioMutation.mutate({
      userId,
      title: values.title,
      link: values.link,
    });
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
          <Button type="submit" disabled={createPortfolioMutation.isPending}>
            {createPortfolioMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Portfolio Item
          </Button>
        </div>
      </form>
    </Form>
  );
}
