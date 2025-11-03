"use client";

import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function SignUpPage() {
  const [isSignIn, setIsSignIn] = useState(false);

  const handleSwitchToSignIn = () => setIsSignIn(true);
  const handleSwitchToSignUp = () => setIsSignIn(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-black">
      {isSignIn ? (
        <SignInForm key="signIn" onSwitchToSignUp={handleSwitchToSignUp} />
      ) : (
        <SignUpForm key="signUp" onSwitchToSignIn={handleSwitchToSignIn} />
      )}
    </div>
  );
}
