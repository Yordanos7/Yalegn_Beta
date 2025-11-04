"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { Loader2, UserRound } from "lucide-react"; // Import UserRound icon
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // Import Button component
import { trpc } from "@/utils/trpc";

interface ProfileImageUploadProps {
  userId: string;
  initialImageUrl: string | null;
  onImageUploadSuccess?: (newImageUrl: string) => void;
}

export function ProfileImageUpload({
  userId,
  initialImageUrl,
  onImageUploadSuccess,
}: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const updateProfileImageMutation = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      const newImageUrl = data?.user?.image || null; // Access image from data.user
      setImageUrl(newImageUrl);
      toast.success("Profile image updated successfully!");
      if (onImageUploadSuccess && newImageUrl) {
        onImageUploadSuccess(newImageUrl);
      }
    },
    onError: (error) => {
      toast.error("Failed to update profile image: " + error.message);
    },
  });

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const newImageUrl = res[0].url;
        // Update the user's profile with the new image URL
        updateProfileImageMutation.mutate({
          id: userId,
          image: newImageUrl,
        });
      }
    },
    onUploadError: (error: Error) => {
      toast.error("Image upload failed: " + error.message);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        startUpload(acceptedFiles);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept([
      "image/jpeg",
      "image/png",
      "image/gif",
    ]),
    maxFiles: 1,
    noClick: true, // Disable click to open file dialog on the root div
  });

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className="relative flex items-center justify-center w-32 h-32 rounded-full bg-[#3A3A3A] overflow-hidden"
      >
        <input {...getInputProps()} ref={fileInputRef} /> {/* Hidden input */}
        {isUploading || updateProfileImageMutation.status === "pending" ? (
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        ) : imageUrl ? (
          <Avatar className="h-full w-full">
            <AvatarImage
              src={imageUrl}
              alt="Profile Image"
              className="object-cover"
            />
            <AvatarFallback className="text-5xl">
              <UserRound />
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserRound className="h-16 w-16 text-gray-400" /> // Face icon
        )}
      </div>
      <Button
        onClick={handleButtonClick}
        disabled={
          isUploading || updateProfileImageMutation.status === "pending"
        }
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUploading || updateProfileImageMutation.status === "pending" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
          </>
        ) : (
          "Select Profile Image"
        )}
      </Button>
      <p className="text-sm text-gray-500">Max 4MB, JPG, PNG, GIF</p>
    </div>
  );
}
