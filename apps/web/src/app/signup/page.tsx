"use client";

import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function SignUpPage() {
  const [isSignIn, setIsSignIn] = useState(false);

  const handleSwitchToSignIn = () => setIsSignIn(true);
  const handleSwitchToSignUp = () => setIsSignIn(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {isSignIn ? (
          <SignInForm key="signIn" onSwitchToSignUp={handleSwitchToSignUp} />
        ) : (
          <SignUpForm key="signUp" onSwitchToSignIn={handleSwitchToSignIn} />
        )}
      </div>
    </div>
  );
}
