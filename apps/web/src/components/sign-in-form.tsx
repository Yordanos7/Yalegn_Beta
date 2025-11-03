import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            // Removed authClient.useSession() from here to fix "Invalid hook call" error
            // The session will be available via the top-level useSession hook in UserMenu and other components
            router.push("/dashboard"); // Redirect to dashboard after successful login
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
      <h1 className="mb-8 text-center text-4xl font-serif font-bold text-gray-800">
        Welcome to Yalegn
      </h1>
      <p className="mb-6 text-center text-gray-600 font-sans hover:text-gold-600">
        Sign in to your Yalegn account
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
                "Sign In"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-500 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          Need an account? Create one now
        </Button>
      </div>
    </div>
  );
}
