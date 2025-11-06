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
import { useCallback, useState } from "react";
import {
  CategoryEnum,
  ExperienceLevel,
  FreelancerLevel,
  DeliveryTime,
  JobType,
  VerificationStatus,
} from "@my-better-t-app/db/prisma/generated/enums";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  languages: z.string().optional(),
  mainCategory: z.nativeEnum(CategoryEnum).optional().nullable(),
  headline: z.string().optional(),
  hourlyRate: z
    .union([z.number().min(0), z.literal(null)])
    .optional()
    .nullable(),
  currency: z.enum(["ETB", "USD"]).optional().nullable(),
  rateTypePreference: z.nativeEnum(JobType).optional().nullable(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional().nullable(),
  freelancerLevel: z.nativeEnum(FreelancerLevel).optional().nullable(),
  deliveryTime: z.nativeEnum(DeliveryTime).optional().nullable(),
  image: z.string().optional().nullable(),
  idFrontImage: z.string().optional().nullable(),
  idBackImage: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  userId: string;
  initialData: ProfileFormValues & {
    verificationStatus?: VerificationStatus | null; // Allow null for verificationStatus
    idFrontImage?: string | null;
    idBackImage?: string | null;
  };
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
      headline: initialData.headline || "",
      hourlyRate: initialData.hourlyRate || null,
      currency: initialData.currency || null,
      rateTypePreference: initialData.rateTypePreference || null,
      experienceLevel: initialData.experienceLevel || null,
      freelancerLevel: initialData.freelancerLevel || null,
      deliveryTime: initialData.deliveryTime || null,
      image: initialData.image || null,
      idFrontImage: initialData.idFrontImage || null,
      idBackImage: initialData.idBackImage || null,
    },
  });

  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData.image || null
  );
  const [idFrontImageUrl, setIdFrontImageUrl] = useState<string | null>(
    initialData.idFrontImage || null
  );
  const [idBackImageUrl, setIdBackImageUrl] = useState<string | null>(
    initialData.idBackImage || null
  );
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isUploadingIdFront, setIsUploadingIdFront] = useState(false);
  const [isUploadingIdBack, setIsUploadingIdBack] = useState(false);

  const uploadProfileImageMutation = trpc.user.uploadProfileImage.useMutation({
    onSuccess: (data) => {
      const newImageUrl = data?.profileImage || null;
      setImageUrl(newImageUrl);
      form.setValue("image", newImageUrl);
      toast.success("Profile image uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to upload profile image: " + error.message);
    },
  });

  const uploadIdVerificationMutation =
    trpc.user.updateIdVerification.useMutation({
      onSuccess: () => {
        toast.success("ID verification images submitted successfully!");
        onSuccess();
      },
      onError: (error: any) => {
        console.error("ID verification mutation error:", error);
        toast.error(
          "Failed to submit ID verification images: " +
            (error.message || "Unknown error")
        );
      },
    });

  const uploadFile = async (
    file: File,
    type: "profile" | "idFront" | "idBack"
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File upload failed");
      }

      const data = await response.json();
      return data.path;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload file: " + error.message);
    }
  };

  const onDropProfileImage = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setIsUploadingProfileImage(true);
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Image = event.target?.result as string;
            await uploadProfileImageMutation.mutateAsync({
              imageData: base64Image,
            });
          };
          reader.readAsDataURL(file);
        } catch (error: any) {
          toast.error("Profile image upload failed: " + error.message);
        } finally {
          setIsUploadingProfileImage(false);
        }
      }
    },
    [uploadProfileImageMutation]
  );

  const onDropIdFront = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setIsUploadingIdFront(true);
        try {
          const relativePath = await uploadFile(file, "idFront");
          const fullImageUrl = `${window.location.origin}${relativePath}`;
          setIdFrontImageUrl(fullImageUrl);
          form.setValue("idFrontImage", fullImageUrl);
          toast.success("ID Front image uploaded successfully!");
        } catch (error: any) {
          toast.error("ID Front image upload failed: " + error.message);
        } finally {
          setIsUploadingIdFront(false);
        }
      }
    },
    [form]
  );

  const onDropIdBack = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setIsUploadingIdBack(true);
        try {
          const relativePath = await uploadFile(file, "idBack");
          const fullImageUrl = `${window.location.origin}${relativePath}`;
          setIdBackImageUrl(fullImageUrl);
          form.setValue("idBackImage", fullImageUrl);
          toast.success("ID Back image uploaded successfully!");
        } catch (error: any) {
          toast.error("ID Back image upload failed: " + error.message);
        } finally {
          setIsUploadingIdBack(false);
        }
      }
    },
    [form]
  );

  const {
    getRootProps: getProfileImageRootProps,
    getInputProps: getProfileImageInputProps,
  } = useDropzone({
    onDrop: onDropProfileImage,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getIdFrontRootProps,
    getInputProps: getIdFrontInputProps,
  } = useDropzone({
    onDrop: onDropIdFront,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getIdBackRootProps,
    getInputProps: getIdBackInputProps,
  } = useDropzone({
    onDrop: onDropIdBack,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const { data: categoryData, isLoading: isLoadingCategories } =
    trpc.category.getAll.useQuery();

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate({
      id: userId,
      bio: values.bio,
      location: values.location,
      languages: values.languages ? [values.languages] : [],
      mainCategory: values.mainCategory,
      headline: values.headline,
      hourlyRate: values.hourlyRate ?? undefined,
      currency: values.currency ?? undefined,
      rateTypePreference: values.rateTypePreference ?? undefined,
      experienceLevel: values.experienceLevel ?? undefined,
      freelancerLevel: values.freelancerLevel ?? undefined,
      deliveryTime: values.deliveryTime ?? undefined,
    });

    if (idFrontImageUrl || idBackImageUrl) {
      uploadIdVerificationMutation.mutate({
        idFrontImage: idFrontImageUrl ?? undefined,
        idBackImage: idBackImageUrl ?? undefined,
      });
    }
  }

  const isAnyUploading =
    isUploadingProfileImage || isUploadingIdFront || isUploadingIdBack;

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
                  {...getProfileImageRootProps()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-[#3A3A3A] hover:bg-[#4A4A4A] transition-colors"
                >
                  <input {...getProfileImageInputProps()} />
                  {isUploadingProfileImage ? (
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
        {/* ID Verification Section */}
        <div className="space-y-4 border p-4 rounded-lg bg-[#3A3A3A]">
          <h3 className="text-lg font-semibold text-white">ID Verification</h3>
          {initialData.verificationStatus === VerificationStatus.APPROVED ? (
            <p className="text-sm text-gray-400">
              Thanks for verifying your identity. Your account is now verified
              By Yalegn Team
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Upload images of your ID (front and back) for verification. Your
              profile completion will increase to 100% upon approval.
            </p>
          )}

          <div className="flex items-center space-x-2 text-white">
            <span className="font-medium">Status:</span>
            {initialData.verificationStatus === VerificationStatus.APPROVED && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                Verified
              </span>
            )}
            {initialData.verificationStatus === VerificationStatus.PENDING && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                Verification Pending
              </span>
            )}
            {initialData.verificationStatus === VerificationStatus.REJECTED && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                Verification Rejected
              </span>
            )}
            {(!initialData.verificationStatus ||
              initialData.verificationStatus === VerificationStatus.NONE) && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                Verify Your ID
              </span>
            )}
          </div>

          {initialData.verificationStatus !== VerificationStatus.APPROVED && (
            <>
              <FormField
                control={form.control}
                name="idFrontImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Front Image</FormLabel>
                    <FormControl>
                      <div
                        {...getIdFrontRootProps()}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
                      >
                        <input {...getIdFrontInputProps()} capture="user" />
                        {isUploadingIdFront ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : idFrontImageUrl ? (
                          <div className="relative w-32 h-20">
                            <Image
                              src={idFrontImageUrl}
                              alt="ID Front"
                              layout="fill"
                              objectFit="contain"
                              className="rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center text-sm">
                            <p>
                              Drag 'n' drop ID front here, or click to select
                            </p>
                            <p className="mt-1">(JPG, PNG)</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Ensure the image is clear, well-lit, and all details are
                      visible. You can use your camera to take a photo directly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idBackImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Back Image</FormLabel>
                    <FormControl>
                      <div
                        {...getIdBackRootProps()}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
                      >
                        <input {...getIdBackInputProps()} capture="user" />
                        {isUploadingIdBack ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : idBackImageUrl ? (
                          <div className="relative w-32 h-20">
                            <Image
                              src={idBackImageUrl}
                              alt="ID Back"
                              layout="fill"
                              objectFit="contain"
                              className="rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center text-sm">
                            <p>
                              Drag 'n' drop ID back here, or click to select
                            </p>
                            <p className="mt-1">(JPG, PNG)</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Ensure the image is clear, well-lit, and all details are
                      visible. You can use your camera to take a photo directly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        {/* End ID Verification Section */}
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
                  value={field.value === null ? "" : field.value}
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
                  <SelectItem value="null">None</SelectItem>
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
                  <SelectItem value="null">None</SelectItem>
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
                  <SelectItem value="null">None</SelectItem>
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
                  <SelectItem value="null">None</SelectItem>
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
                  <SelectItem value="null">None</SelectItem>
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
                      <SelectItem value="null">None</SelectItem>
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
            disabled={
              updateProfileMutation.status === "pending" || isAnyUploading
            }
          >
            {updateProfileMutation.status === "pending" ||
              (isAnyUploading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ))}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
