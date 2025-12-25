import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@my-better-t-app/auth";
import AdminDashboard from "./admin-dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  });

  // Check if user is logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has ADMIN role
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard"); // Redirect non-admins to regular dashboard
  }

  return <AdminDashboard />;
}

// Disable static generation for this page
export const dynamic = "force-dynamic";
