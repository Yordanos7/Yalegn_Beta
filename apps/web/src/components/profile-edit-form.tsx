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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react"; // Keep useState and useCallback
import {
  CategoryEnum,
  ExperienceLevel,
  FreelancerLevel,
  DeliveryTime,
  JobType,
} from "@my-better-t-app/db/prisma/generated/enums"; // Import additional enums
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  languages: z.string().optional(), // Simplified for now, could be string[]
  mainCategory: z.nativeEnum(CategoryEnum).optional().nullable(),
  headline: z.string().optional(), // Added headline
  hourlyRate: z
    .union([z.number().min(0), z.literal(null)])
    .optional()
    .nullable(), // Added hourlyRate, explicitly allowing null
  currency: z.enum(["ETB", "USD"]).optional().nullable(), // Added currency
  rateTypePreference: z.nativeEnum(JobType).optional().nullable(), // Added rateTypePreference
  experienceLevel: z.nativeEnum(ExperienceLevel).optional().nullable(), // Added experienceLevel
  freelancerLevel: z.nativeEnum(FreelancerLevel).optional().nullable(), // Added freelancerLevel
  deliveryTime: z.nativeEnum(DeliveryTime).optional().nullable(), // Added deliveryTime
  image: z.string().optional().nullable(), // Added image field
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  userId: string;
  initialData: ProfileFormValues;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData.image || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfileImageMutation = trpc.user.uploadProfileImage.useMutation({
    onSuccess: (data) => {
      const newImageUrl = data?.profileImage || null;
      setImageUrl(newImageUrl);
      form.setValue("image", newImageUrl);
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => {
      toast.error("Failed to upload profile image: " + error.message);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Image = event.target?.result as string;
          setIsUploading(true);
          try {
            await uploadProfileImageMutation.mutateAsync({
              imageData: base64Image,
            });
          } catch (error: any) {
            toast.error("Image upload failed: " + error.message);
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [uploadProfileImageMutation]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: initialData.bio || "",
      location: initialData.location || "",
      languages: initialData.languages || "",
      mainCategory: initialData.mainCategory || null,
      headline: initialData.headline || "",
      hourlyRate: initialData.hourlyRate || null,
      currency: initialData.currency || null,
      rateTypePreference: initialData.rateTypePreference || null,
      experienceLevel: initialData.experienceLevel || null,
      freelancerLevel: initialData.freelancerLevel || null,
      deliveryTime: initialData.deliveryTime || null,
      image: initialData.image || null,
    },
  });

  const { data: categoryData, isLoading: isLoadingCategories } =
    trpc.category.getAll.useQuery();

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate({
      id: userId, // Assuming the backend mutation expects 'id' for the user to update
      bio: values.bio,
      location: values.location,
      languages: values.languages ? [values.languages] : [], // Convert string to array
      mainCategory: values.mainCategory,
      headline: values.headline,
      hourlyRate: values.hourlyRate ?? undefined, // Convert null to undefined
      currency: values.currency ?? undefined, // Convert null to undefined
      rateTypePreference: values.rateTypePreference ?? undefined, // Convert null to undefined
      experienceLevel: values.experienceLevel ?? undefined, // Convert null to undefined
      freelancerLevel: values.freelancerLevel ?? undefined, // Convert null to undefined
      deliveryTime: values.deliveryTime ?? undefined, // Convert null to undefined
      image: imageUrl ?? undefined, // Pass the uploaded image URL
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div
                  {...getRootProps()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-[#3A3A3A] hover:bg-[#4A4A4A] transition-colors"
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : imageUrl ? (
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={imageUrl} alt="Profile Image" />
                      <AvatarFallback>
                        {initialData.bio?.charAt(0).toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <p>
                        Drag 'n' drop an image here, or click to select files
                      </p>
                      <p className="text-sm mt-1">(Max 4MB, JPG, PNG, GIF)</p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Upload a profile picture.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about yourself"
                  className="resize-y bg-[#3A3A3A] border-none text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Addis Ababa, Ethiopia"
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
          name="languages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Languages (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., English, Amharic"
                  className="bg-[#3A3A3A] border-none text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Fields */}
        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Experienced Web Developer"
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
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  className="bg-[#3A3A3A] border-none text-white"
                  {...field}
                  value={field.value === null ? "" : field.value} // Handle null for input
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="null">None</SelectItem>{" "}
                  {/* Changed value to "null" string */}
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rateTypePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate Type Preference</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select rate type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="null">None</SelectItem>{" "}
                  {/* Changed value to "null" string */}
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="FIXED">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="null">None</SelectItem>{" "}
                  {/* Changed value to "null" string */}
                  {trpc.category.getExperienceLevels
                    .useQuery()
                    .data?.experienceLevels.map((exp) => (
                      <SelectItem key={exp.id} value={exp.name}>
                        {exp.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="freelancerLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Freelancer Level</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select freelancer level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="null">None</SelectItem>{" "}
                  {/* Changed value to "null" string */}
                  {trpc.category.getFreelancerLevels
                    .useQuery()
                    .data?.freelancerLevels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.name}>
                        {lvl.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Delivery Time</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="null">None</SelectItem>{" "}
                  {/* Changed value to "null" string */}
                  {trpc.category.getDeliveryTimes
                    .useQuery()
                    .data?.deliveryTimes.map((time) => (
                      <SelectItem key={time.id} value={time.name}>
                        {time.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Category</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="bg-[#3A3A3A] border-none text-gray-400 hover:text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="null">None</SelectItem>{" "}
                      {/* Option to clear category, changed value to "null" string */}
                      {categoryData?.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
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
            disabled={updateProfileMutation.status === "pending" || isUploading}
          >
            {updateProfileMutation.status === "pending" ||
              (isUploading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ))}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
