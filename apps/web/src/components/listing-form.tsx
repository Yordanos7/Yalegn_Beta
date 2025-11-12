"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/utils/trpc";

interface ListingFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: "ETB" | "USD";
    deliveryDays?: number | null;
    category?: string | null; // Allow null for category
    images: string[];
    videos?: string[];
    tags: string[];
    isPublished: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ListingForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [currency, setCurrency] = useState<"ETB" | "USD">(
    initialData?.currency || "ETB"
  );
  const [deliveryDays, setDeliveryDays] = useState(
    initialData?.deliveryDays?.toString() || ""
  );
  const [category, setCategory] = useState<string | null>(
    initialData?.category || null
  ); // Allow null for category
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished || false
  );

  const { data: categoriesData, isPending: isCategoriesPending } =
    trpc.category.getAll.useQuery();

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedVideos((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageToRemove: string) => {
    setImages((prevImages) =>
      prevImages.filter((image) => image !== imageToRemove)
    );
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingVideo = (videoToRemove: string) => {
    setVideos((prevVideos) =>
      prevVideos.filter((video) => video !== videoToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const uploadedImagePaths: string[] = [];
    const uploadedVideoPaths: string[] = [];

    const uploadFile = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Upload API response:", result); // Log the response from the upload API

        if (result.success) {
          return result.path;
        } else {
          console.error("Error uploading file:", result.error);
          return null;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        return null;
      }
    };

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const path = await uploadFile(file);
        if (path) {
          uploadedImagePaths.push(path);
        }
      }
    }

    if (selectedVideos.length > 0) {
      for (const file of selectedVideos) {
        const path = await uploadFile(file);
        if (path) {
          uploadedVideoPaths.push(path);
        }
      }
    }

    const finalImages = [...images, ...uploadedImagePaths];
    const finalVideos = [...videos, ...uploadedVideoPaths];

    onSubmit({
      title,
      description,
      price: parseFloat(price),
      currency,
      deliveryDays: deliveryDays ? parseInt(deliveryDays) : null, // Send null if empty
      category: category === "" ? null : category, // Send null if category is an empty string
      images: finalImages,
      videos: finalVideos,
      tags,
      isPublished,
    });

    setIsUploading(false);
  };

  return (
    <Card className="bg-[#1f1d1d] p-6 rounded-lg shadow-lg w-full   ">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {initialData ? "Edit Listing" : "Create New Listing"}
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <form onSubmit={handleSubmit} className="space-y-6 ">
          <div>
            <Label htmlFor="title" className="text-gray-300">
              Listing Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Custom Website Design Service"
              className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your product or service."
              className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1 min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-300">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 150.00"
                className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-gray-300">
                Currency
              </Label>
              <Select
                value={currency}
                onValueChange={(value: "ETB" | "USD") => setCurrency(value)}
              >
                <SelectTrigger className="bg-[#3A3A3A] border-none text-white mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-[#3A3A3A] text-white">
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="deliveryDays" className="text-gray-300">
              Estimated Delivery Days (for services, optional)
            </Label>
            <Input
              id="deliveryDays"
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              placeholder="e.g., 7"
              className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-300">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isCategoriesPending}
            >
              <SelectTrigger className="bg-[#3A3A3A] border-none text-white mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#3A3A3A] text-white">
                {isCategoriesPending ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  (categoriesData?.categories || []).map(
                    (cat: { id: string; name: string }) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    )
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Images</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(image)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div
                className="w-full h-24 border-2 border-dashed border-gray-500 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-[#3A3A3A]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-400 mt-1">Add Images</span>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Videos</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="relative group">
                  <video
                    src={video}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingVideo(video)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {selectedVideos.map((file, index) => (
                <div key={index} className="relative group">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div
                className="w-full h-24 border-2 border-dashed border-gray-500 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-[#3A3A3A]"
                onClick={() => videoInputRef.current?.click()}
              >
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-400 mt-1">Add Videos</span>
                <Input
                  id="videos"
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  ref={videoInputRef}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className="text-gray-300">
              Tags (e.g., keywords, skills)
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., React, UI/UX)"
                className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus size={20} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[#3A3A3A] text-white px-3 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <X
                    className="ml-2 cursor-pointer"
                    size={14}
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPublished" className="text-gray-300">
              Publish Listing
            </Label>
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-gray-300 hover:bg-[#3A3A3A]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? "Saving..." : "Save Listing"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
