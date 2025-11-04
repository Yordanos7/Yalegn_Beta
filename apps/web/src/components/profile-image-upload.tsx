"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Loader2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadProfileImageMutation = trpc.user.uploadProfileImage.useMutation({
    onSuccess: (data) => {
      const newImageUrl = data?.profileImage || null;
      setImageUrl(newImageUrl);
      toast.success("Profile image updated successfully!");
      if (onImageUploadSuccess && newImageUrl) {
        onImageUploadSuccess(newImageUrl);
      }
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
    noClick: true,
  });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className="relative flex items-center justify-center w-32 h-32 rounded-full bg-[#3A3A3A] overflow-hidden"
      >
        <input {...getInputProps()} ref={fileInputRef} />
        {isUploading || uploadProfileImageMutation.status === "pending" ? (
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
          <UserRound className="h-16 w-16 text-gray-400" />
        )}
      </div>
      <Button
        onClick={handleButtonClick}
        disabled={
          isUploading || uploadProfileImageMutation.status === "pending"
        }
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUploading || uploadProfileImageMutation.status === "pending" ? (
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
