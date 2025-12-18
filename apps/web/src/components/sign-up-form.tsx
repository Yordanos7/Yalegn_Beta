import { authClient } from "@/lib/auth-client"; // this is the client-side auth instance that interacts with the auth server
import { useForm } from "@tanstack/react-form"; // this  is a form management library come from tanstack for handling form state and validation
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation for Next.js 13+ but i use next js 15 ( "next": "15.5.4",)
import { useState } from "react";
// import { sendVerificationEmail } from "@/lib/web3forms"; // Removed

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter(); // for navigation
  const { isPending, refetch } = authClient.useSession(); // Destructure refetch here
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  // const [shouldSendEmail, setShouldSendEmail] = useState(false); // Removed

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      console.log("🚀 CLIENT DEBUG - Starting signup process");
      console.log("📧 Email:", value.email);
      console.log("👤 Name:", value.name);

      try {
        await authClient.signUp.email(
          {
            email: value.email,
            password: value.password,
            name: value.name,
          },
          {
            onSuccess: (data) => {
              console.log("✅ CLIENT DEBUG - Signup successful!");
              console.log("📧 Response data:", data);
              setUserEmail(value.email);
              setUserName(value.name);
              setShowEmailSent(true);
              // setShouldSendEmail(true); // Handled by server
              toast.success("Account created successfully! 🎉");
              console.log(
                "🎯 CLIENT DEBUG - EmailJS will send verification email"
              );
            },
            onError: (error) => {
              console.error("❌ CLIENT DEBUG - Signup failed!");
              console.error("❌ Error:", error);
              toast.error(error.error.message || error.error.statusText);
            },
          }
        );
      } catch (error) {
        console.error("❌ CLIENT DEBUG - Signup exception:", error);
        toast.error("Signup failed. Please try again.");
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const resendVerificationEmail = async () => {
    try {
      setResendCooldown(60); // 60 second cooldown

      await authClient.sendVerificationEmail({
        email: userEmail,
      });

      toast.success("Verification email sent! Check your inbox.");

      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Resend verification error:", error);
      toast.error(error.message || "Failed to resend verification email");
      setResendCooldown(0);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  if (showEmailSent) {
    return (
      <div className="w-full p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300">
        {/* EmailJS Handler - sends email automatically */}
        {/* Auto-send verification email using Web3Forms */}
        {/* Auto-send handled by better-auth server-side */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Account Created! 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            Welcome to Yalegn! We've sent a verification email to:
          </p>
          <p className="text-indigo-600 font-semibold mb-6">{userEmail}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>You have two options:</strong>
            </p>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• ✅ Verify now and get 30 welcome coins</li>
              <li>• ⏰ Skip for now and verify later from your profile</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/onboarding")}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Continue to Onboarding
            </Button>

            <Button
              onClick={resendVerificationEmail}
              disabled={resendCooldown > 0}
              variant="outline"
              className="w-full"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"}
            </Button>

            <Button
              variant="link"
              onClick={() => setShowEmailSent(false)}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:scale-[1.02]">
      <h1 className="mb-8 text-center text-4xl font-serif font-bold text-gray-800 animate-fade-in">
        Join Yalegn
      </h1>
      <p className="mb-6 text-center text-gray-600 font-sans">
        Create your royal account
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
                {field.state.meta.errors.map((error, index) =>
                  error ? (
                    <p key={index} className="text-sm text-red-500 font-medium">
                      {error.message}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email"
                />
                {field.state.meta.errors.map((error, index) =>
                  error ? (
                    <p key={index} className="text-sm text-red-500 font-medium">
                      {error.message}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                {field.state.meta.errors.map((error, index) =>
                  error ? (
                    <p key={index} className="text-sm text-red-500 font-medium">
                      {error.message}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-indigo-500 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
