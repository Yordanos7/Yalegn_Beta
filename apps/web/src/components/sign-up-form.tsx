import { authClient } from "@/lib/auth-client"; // this is the client-side auth instance that interacts with the auth server
import { useForm } from "@tanstack/react-form"; // this  is a form management library come from tanstack for handling form state and validation
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation for Next.js 13+ but i use next js 15 ( "next": "15.5.4",)

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter(); // for navigation
  const { isPending, refetch } = authClient.useSession(); // Destructure refetch here

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            refetch(); // Call refetch from the hook
            router.push("/onboarding");
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
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
