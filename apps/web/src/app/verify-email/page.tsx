"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Add tRPC mutation for verifying email
  const verifyEmailMutation = trpc.user.verifyEmail.useMutation();

  useEffect(() => {
    if (!token || !email) {
      setVerificationStatus("error");
      setIsVerifying(false);
      return;
    }

    verifyEmail();
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      setIsVerifying(true);

      if (!token || !email) {
        throw new Error("Missing verification token or email");
      }

      const result = await verifyEmailMutation.mutateAsync({
        token: token,
        email: email,
      });

      setVerificationStatus("success");
      toast.success(result.message);

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push("/profile?verified=true");
      }, 2000);
    } catch (error: any) {
      console.error("Email verification error:", error);

      if (
        error.message?.includes("expired") ||
        error.message?.includes("invalid")
      ) {
        setVerificationStatus("expired");
        setCanResend(true);
      } else {
        setVerificationStatus("error");
      }

      toast.error(error.message || "Failed to verify email");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Email address not found. Please try signing up again.");
      return;
    }

    try {
      setResendCooldown(60); // 60 second cooldown

      await authClient.sendVerificationEmail({
        email: email,
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

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          {verificationStatus === "success" && (
            <>
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
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified! You've earned 30
                welcome coins. You'll be redirected to your profile shortly.
              </p>
              <Button
                onClick={() => router.push("/profile?verified=true")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Profile
              </Button>
            </>
          )}

          {verificationStatus === "expired" && (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Link Expired
              </h1>
              <p className="text-gray-600 mb-6">
                This verification link has expired. Click below to receive a new
                verification email.
              </p>
              {canResend && (
                <Button
                  onClick={resendVerificationEmail}
                  disabled={resendCooldown > 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Email"}
                </Button>
              )}
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't verify your email. The link may be invalid or
                expired.
              </p>
              <div className="space-y-3">
                {email && canResend && (
                  <Button
                    onClick={resendVerificationEmail}
                    disabled={resendCooldown > 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Verification Email"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push("/signup")}
                  className="w-full"
                >
                  Back to Sign Up
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
