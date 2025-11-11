"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes"; // For appearance settings

const SettingsPage = () => {
  const { session, isLoading: isSessionLoading } = useSession() as any;
  const userId = session?.user?.id;
  const { theme, setTheme } = useTheme(); // For appearance settings

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchUserProfile,
  } = trpc.user.getUserProfile.useQuery(
    { userId: userId! },
    {
      enabled: !!userId,
    }
  );

  const updateUserProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetchUserProfile();
    },
    onError: (error: any) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const [profileVisibility, setProfileVisibility] = useState("Public");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setEmail(userProfile.email || "");
      // Assuming these fields exist in userProfile or a related settings object
      // For now, using default values or placeholders
      // setEmailNotificationsEnabled(userProfile.settings?.emailNotificationsEnabled || true);
      // setPushNotificationsEnabled(userProfile.settings?.pushNotificationsEnabled || false);
      // setProfileVisibility(userProfile.settings?.profileVisibility || "Public");
      // setSelectedLanguage(userProfile.settings?.language || "English");
    }
  }, [userProfile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfileMutation.mutate({
      id: userId!, // Corrected to 'id' as per backend mutation input
      name,
      // email, // Removed email update for now, as it's not directly supported by the backend mutation without re-verification logic
    });
  };

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-foreground">
        <Loader className="animate-spin" size={48} />
        <p className="mt-4">Loading settings...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-destructive">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-4">Failed to load profile: {profileError.message}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-background text-destructive">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="mt-4">The user profile could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar for navigation within settings */}
        <aside className="md:col-span-1">
          <nav className="space-y-2">
            <a
              href="#account"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Account
            </a>
            <a
              href="#notifications"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Notifications
            </a>
            <a
              href="#privacy"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Privacy
            </a>
            <a
              href="#security"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Security
            </a>
            <a
              href="#integrations"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Integrations
            </a>
            <a
              href="#billing"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Billing & Subscription
            </a>
            <a
              href="#appearance"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Appearance
            </a>
            <a
              href="#language"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Language & Region
            </a>
            <a
              href="#help"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Help & Support
            </a>
            <a
              href="#delete-account"
              className="block px-4 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
            >
              Delete Account
            </a>
          </nav>
        </aside>

        {/* Main settings content */}
        <main className="md:col-span-3 space-y-10">
          <section
            id="account"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
            <p>Manage your profile information, email address, and password.</p>
            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="your@example.com"
                  value={email}
                  disabled // Email is not directly editable via this form for now
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={updateUserProfileMutation.isPending}
              >
                {updateUserProfileMutation.isPending
                  ? "Updating..."
                  : "Update Profile"}
              </button>
            </form>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              To change your email, please contact support.
            </p>
          </section>

          <section
            id="notifications"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Notification Preferences
            </h2>
            <p>Choose how you want to be notified.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email-notifications"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  id="email-notifications"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={emailNotificationsEnabled}
                  onChange={(e) =>
                    setEmailNotificationsEnabled(e.target.checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="push-notifications"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Push Notifications
                </label>
                <input
                  type="checkbox"
                  id="push-notifications"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={pushNotificationsEnabled}
                  onChange={(e) =>
                    setPushNotificationsEnabled(e.target.checked)
                  }
                  disabled
                />
              </div>
            </div>
          </section>

          <section
            id="privacy"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Privacy Settings</h2>
            <p>Control who can see your information and activity.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-visibility"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Profile Visibility
                </label>
                <select
                  id="profile-visibility"
                  className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                >
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends Only</option>
                </select>
              </div>
            </div>
          </section>

          <section
            id="security"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Security</h2>
            <p>
              Manage your security settings, including two-factor
              authentication.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="two-factor"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Two-Factor Authentication
                </label>
                <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                  Enable
                </button>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Change Password
              </button>
            </div>
          </section>

          <section
            id="integrations"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
            <p>Connect with third-party services.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Google Drive
                </span>
                <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Connect
                </button>
              </div>
            </div>
          </section>

          <section
            id="billing"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Billing & Subscription
            </h2>
            <p>Manage your plan and payment methods.</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Plan: Free Tier
              </p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                The Upgrade plan is coming soon!
              </button>
            </div>
          </section>

          <section
            id="appearance"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Appearance</h2>
            <p>Customize the look and feel of the application.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="theme-select"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Theme
                </label>
                <select
                  id="theme-select"
                  className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </section>

          <section
            id="help"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Help & Support</h2>
            <p>Find answers to common questions or contact support.</p>
            <div className="mt-4 space-y-2">
              <a href="/faq" className="block text-blue-600 hover:underline">
                FAQ
              </a>
              <a
                href="/support"
                className="block text-blue-600 hover:underline"
              >
                Contact Support
              </a>
            </div>
          </section>

          <section
            id="delete-account"
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-l-4 border-red-500"
          >
            <h2 className="text-2xl font-semibold mb-4 text-red-600">
              Delete Account
            </h2>
            <p className="text-red-700 dark:text-red-300">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete My Account
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
