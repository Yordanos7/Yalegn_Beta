"use client";

import Sidebar from "@/components/sidebar"; // Import Sidebar
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"; // Import DialogTitle
import { ListingForm } from "@/components/listing-form";
import { ProfileEditForm } from "@/components/profile-edit-form"; // Import ProfileEditForm
import { Switch } from "@/components/ui/switch"; // Import Switch component
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  Award,
  BookOpen,
  Link as LinkIcon,
  Loader,
  Plus,
  CheckCircle,
  XCircle,
  BadgeCheck,
  Share2,
  Eye,
  Edit,
  User, // Added User import
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { trpc } from "@/utils/trpc";
import type { AppRouter } from "@my-better-t-app/api/src/routers"; // Corrected import path
import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
// Removed: import type { Session } from "better-auth"; // No longer needed directly

type RouterOutput = inferRouterOutputs<AppRouter>;
type UserProfile = RouterOutput["user"]["getPublicUserProfile"];

// Define a custom session type that matches what useSession returns
interface CustomSessionWithUser {
  session?: {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    expires: string; // Moved expires here
  };
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accountType?: "INDIVIDUAL" | "ORGANIZATION" | null;
    // Add other user properties if they exist in the session object
  };
  // Removed top-level expires
}

type ProfileWithSkillsAndPortfolio = NonNullable<UserProfile["profile"]> & {
  skills: { skill: { name: string } }[];
  portfolio: {
    id: string;
    media: string[];
    title: string;
    description: string;
    link?: string;
  }[];
  isPublicFreelancer: boolean;
  averageRating?: number | null; // Added
  mainCategory?: string | null; // Added
};

type Listing = RouterOutput["listing"]["getByUserId"][number]; // Use inferred type for Listing

export default function UserProfilePage() {
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession() as any; // Temporarily use 'any' to unblock
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFreelancerPublic, setIsFreelancerPublic] = useState(false); // State for freelancer public status

  const userId = session?.user?.id;

  const createListingMutation = trpc.listing.create.useMutation(); // Initialize mutation

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchUserProfile, // Add refetch to update profile data
  } = trpc.user.getPublicUserProfile.useQuery(
    { userId: userId! },
    {
      enabled: !!userId,
    }
  );

  const {
    data: listingsData,
    isLoading: isListingsLoading,
    error: listingsError,
    refetch: refetchListings,
  } = trpc.listing.getByUserId.useQuery(
    { userId: userId || "" },
    {
      enabled: !!userId,
    }
  );

  useEffect(() => {
    if (userProfile?.profile?.isPublicFreelancer !== undefined) {
      setIsFreelancerPublic(userProfile.profile.isPublicFreelancer);
    }
  }, [userProfile]);

  const togglePublicStatusMutation =
    trpc.user.toggleFreelancerPublicStatus.useMutation({
      onSuccess: (data: { isPublicFreelancer: boolean; message: string }) => {
        // Explicitly type data
        setIsFreelancerPublic(data.isPublicFreelancer);
        toast.success(data.message);
        refetchUserProfile(); // Refetch profile to ensure UI is consistent
      },
      onError: (error: any) => {
        // Explicitly type error
        toast.error("Failed to update freelancer status: " + error.message);
      },
    });

  if (isSessionLoading || isProfileLoading || isListingsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-foreground">
        <Loader className="animate-spin" size={48} />
        <p className="mt-4">Loading profile...</p>
      </div>
    );
  }

  if (profileError || listingsError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-destructive">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-4">
          Failed to load profile:{" "}
          {profileError?.message || listingsError?.message}
        </p>
      </div>
    );
  }

  if (!session?.user || !userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-destructive">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="mt-4">
          The user profile you are looking for does not exist or you are not
          logged in.
        </p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;
  const listings = listingsData as Listing[];

  const handleCreateListing = async (data: any) => {
    try {
      await createListingMutation.mutateAsync(data);
      toast.success("Listing created successfully!");
      setIsFormOpen(false); // Close the form
      refetchListings(); // Refetch listings to show the new one
    } catch (err: any) {
      toast.error("Failed to create listing.", {
        description: err.message || "An unknown error occurred.",
      });
      console.error("Error creating listing:", err);
    }
  };

  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 7; // Name, Email, Bio, Headline, Skills, Portfolio, Location

    if (userProfile.name) completedFields++;
    if (userProfile.email) completedFields++;
    if (userProfile.bio) completedFields++;
    if (userProfile.profile?.headline) completedFields++;
    if (
      (userProfile.profile as ProfileWithSkillsAndPortfolio)?.skills?.length > 0
    )
      completedFields++;
    if (
      (userProfile.profile as ProfileWithSkillsAndPortfolio)?.portfolio
        ?.length > 0
    )
      completedFields++;
    if (userProfile.location) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const joinDate = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
  const lastActive = "98%, 3hrs ago"; // Placeholder for now

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 bg-background text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Avatar className="h-24 w-24 mr-6">
                  <AvatarImage
                    src={userProfile.image || "/placeholder-avatar.jpg"}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="text-4xl">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl font-bold">{userProfile.name}</h1>
                  <div className="flex items-center text-green-500 text-sm mt-1">
                    <BadgeCheck className="mr-1 h-4 w-4" /> Faida ID Verified
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {isOwnProfile &&
                  session?.user?.accountType === "INDIVIDUAL" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="freelancer-public-status"
                        checked={isFreelancerPublic}
                        onCheckedChange={(checked) =>
                          togglePublicStatusMutation.mutate({
                            userId: userId!,
                            isPublic: checked,
                          })
                        }
                        disabled={togglePublicStatusMutation.isPending}
                      />
                      <label
                        htmlFor="freelancer-public-status"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {isFreelancerPublic
                          ? "Posted to Freelancer Page"
                          : "Unposted from Freelancer Page"}
                      </label>
                      {togglePublicStatusMutation.isPending && (
                        <Loader className="animate-spin ml-2" size={16} />
                      )}
                    </div>
                  )}
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted-foreground"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={
                        2 * Math.PI * 40 -
                        (2 * Math.PI * 40 * profileCompletion) / 100
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold fill-foreground"
                    >
                      {profileCompletion}%
                    </text>
                  </svg>
                </div>
                <Card className="p-4 bg-muted rounded-lg flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to attract more opportunities
                  </p>
                </Card>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                Rating:{" "}
                {userProfile.profile?.averageRating?.toFixed(1) || "N/A"}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                Completed Jobs: {userProfile.profile?.completedJobs || 0}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined Date: {joinDate}
              </div>
              <div className="flex items-center">
                <Loader className="h-4 w-4 mr-1" />
                Last Active: {lastActive}
              </div>
            </div>

            <div className="flex space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md px-6 py-2 flex items-center">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-foreground p-6 rounded-lg max-w-full w-full h-full overflow-y-auto">
                  {" "}
                  {/* Made DialogContent full screen and scrollable */}
                  <DialogTitle className="text-2xl font-bold mb-4">
                    Edit Profile
                  </DialogTitle>{" "}
                  {/* Added DialogTitle */}
                  <ProfileEditForm
                    userId={userId!}
                    initialData={{
                      bio: userProfile.bio || "",
                      location: userProfile.location || "",
                      languages: userProfile.languages?.join(", ") || "",
                      mainCategory: userProfile.profile?.mainCategory || null,
                      headline: userProfile.profile?.headline || "",
                      hourlyRate: userProfile.profile?.hourlyRate || null,
                      currency: userProfile.profile?.currency || null,
                      rateTypePreference:
                        userProfile.profile?.rateTypePreference || null,
                      experienceLevel:
                        userProfile.profile?.experienceLevel || null,
                      freelancerLevel:
                        userProfile.profile?.freelancerLevel || null,
                      deliveryTime: userProfile.profile?.deliveryTime || null,
                    }}
                    onSuccess={() => {
                      refetchUserProfile();
                      // Optionally refetch listings if profile changes affect them
                    }}
                    onCancel={() => {}} // Dialog handles closing
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="font-semibold rounded-md px-6 py-2 flex items-center"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share Profile Link
              </Button>
              <Button
                variant="outline"
                className="font-semibold rounded-md px-6 py-2 flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" /> Preview as Public View
              </Button>
            </div>
          </Card>

          {/* About Me Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">About Me</CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground whitespace-pre-line">
              <p className="mb-2">{userProfile.profile?.headline}</p>
              <p className="mb-2">{userProfile.bio}</p>
              {/* Placeholder for Languages, Experience Level, Badges */}
              <p className="text-sm mt-4">
                Languages: {userProfile.languages?.join(", ") || "N/A"}
              </p>
              <p className="text-sm">Experience level: Intermediate</p>
              <p className="text-sm mt-2 flex items-center">
                <BadgeCheck className="h-4 w-4 mr-1 text-green-500" /> 4/4
                Badges Unlocked
              </p>
            </CardContent>
          </Card>

          {/* Verification & Trust Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">
                Verification & Trust
              </CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Faida
                  ID Verified
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Phone
                  Verified
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Email
                  Verified
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />{" "}
                  Portfolio Verified
                </div>
              </div>
              <Button variant="outline" className="mt-4 font-semibold">
                Unlock all badges to build client trust
              </Button>
            </CardContent>
          </Card>

          {/* Reviews & Ratings Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">
                Reviews & Ratings
              </CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              <div className="flex items-center text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(userProfile.profile?.averageRating || 0)
                        ? "fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-4">
                Deliver your first project to collect reviews
              </p>
              <Button variant="outline" className="font-semibold">
                View all reviews
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Skills & Categories Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">
                Skills & Categories
              </CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              <div className="flex flex-wrap gap-2 mb-4">
                {(userProfile.profile as ProfileWithSkillsAndPortfolio)
                  ?.skills &&
                  (
                    userProfile.profile as ProfileWithSkillsAndPortfolio
                  ).skills.map((s: { skill: { name: string } }) => (
                    <Badge
                      key={s.skill.name}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {s.skill.name}
                    </Badge>
                  ))}
              </div>
              <p className="text-sm">
                Profiles with at least 5 verified skills get 2x more visibility
              </p>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              <div className="grid grid-cols-1 gap-4">
                {(userProfile.profile as ProfileWithSkillsAndPortfolio)
                  ?.portfolio &&
                  (
                    userProfile.profile as ProfileWithSkillsAndPortfolio
                  ).portfolio.map(
                    (item: {
                      id: string;
                      media: string[];
                      title: string;
                      description: string;
                      link?: string;
                    }) => (
                      <Card key={item.id} className="bg-muted p-3 rounded-lg">
                        <div className="relative w-full h-32 mb-2 rounded-md overflow-hidden">
                          <Image
                            src={item.media[0] || "/placeholder-image.jpg"}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center"
                          >
                            <LinkIcon className="mr-1 h-4 w-4" /> View Project
                          </a>
                        )}
                      </Card>
                    )
                  )}
              </div>
              <Button variant="outline" className="mt-4 w-full font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Add to Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Services Offered Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">
                Services Offered ({listings.length} Active)
              </CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              {listings && listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {listing.title}
                        </h3>
                        <p className="text-sm">
                          {listing.currency} {listing.price.toFixed(2)}
                        </p>
                      </div>
                      <Link href={`/marketplace/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No services offered yet.</p>
              )}
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 flex items-center mt-4 w-full">
                    <Plus className="mr-2" size={16} /> Post New Product/Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-foreground p-6 rounded-lg max-w-3xl overflow-y-auto max-h-[99vh] ">
                  <ListingForm
                    onSubmit={handleCreateListing}
                    onCancel={() => setIsFormOpen(false)}
                    isSubmitting={createListingMutation.isPending} // Pass isSubmitting prop
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Earnings & Analytics Snapshot Section */}
          <Card className="p-6 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-xl font-semibold">
                Earnings & Analytics Snapshot
              </CardTitle>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
              {/* Placeholder for a simple chart */}
              <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                <p>Chart Placeholder</p>
              </div>
              <p className="text-sm mt-4">
                More detailed analytics coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
