"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  CategoryEnum,
  ExperienceLevel,
  FreelancerLevel,
  DeliveryTime,
  JobType,
} from "@my-better-t-app/db/prisma/generated/enums"; // Import additional enums

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
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: initialData.bio || "",
      location: initialData.location || "",
      languages: initialData.languages || "",
      mainCategory: initialData.mainCategory || null,
      headline: initialData.headline || "", // Set default
      hourlyRate: initialData.hourlyRate || null, // Set default
      currency: initialData.currency || null, // Set default
      rateTypePreference: initialData.rateTypePreference || null, // Set default
      experienceLevel: initialData.experienceLevel || null, // Set default
      freelancerLevel: initialData.freelancerLevel || null, // Set default
      deliveryTime: initialData.deliveryTime || null, // Set default
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
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            disabled={updateProfileMutation.status === "pending"}
          >
            {updateProfileMutation.status === "pending" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
