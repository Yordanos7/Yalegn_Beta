import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers, cookies } from "next/headers"; // Import cookies
import { auth } from "@my-better-t-app/auth";
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: {
      cookie: (await cookies()).toString(), // Await cookies() before toString()
    },
  });

  console.log("Server-side session in DashboardPage:", session); // Log the session

  if (!session?.user) {
    console.log("No user in session, redirecting to login."); // Log redirection reason
    redirect("/login");
  }

  return <Dashboard />;
}
