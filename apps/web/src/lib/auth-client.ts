import type { auth } from "@my-better-t-app/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const getBaseURL = () => {
    // Try primary variable
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    // Try old variable name just in case
    if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL;
    // Default to origin/api/auth (which causes 404 in this project)
    return undefined;
};

const baseURL = getBaseURL();
console.log("🛠️ Auth Client Config:");
console.log("  - baseURL:", baseURL || "❌ NOT SET (using current origin)");

export const authClient = createAuthClient({
	baseURL: baseURL,
	plugins: [inferAdditionalFields<typeof auth>()],
});
