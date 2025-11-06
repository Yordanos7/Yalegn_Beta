"use client";

import React from "react";
import { trpc } from "../../utils/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

interface UserProfilePageProps {
  params: { userId?: string }; // Make userId optional
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ params }) => {
  const { userId } = params;
  console.log("user Id params:", userId);

  if (!userId) {
    return <div className="container mx-auto p-4">Invalid User ID.</div>;
  }
  const {
    data: user,
    isLoading,
    error,
  } = trpc.user.getShowPublicProfile.useQuery({
    userId,
  });

  const handleShareProfile = () => {
    const profileLink = window.location.href;
    navigator.clipboard.writeText(profileLink);
    toast.success("Profile link copied to clipboard!");
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error loading profile: {error.message}
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto p-4">No user profile found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || "/default-avatar.png"} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <Button onClick={handleShareProfile} variant="outline">
          <Share2Icon className="mr-2 h-4 w-4" /> Share Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p>{user.bio || "No bio available."}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills listed.</p>
          )}
        </div>
      </div>

      {/* Add more sections as needed, e.g., listings, jobs, etc. */}
    </div>
  );
};

export default UserProfilePage;
