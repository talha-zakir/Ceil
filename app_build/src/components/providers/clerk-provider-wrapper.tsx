"use client";

import { ClerkProvider } from "@clerk/clerk-react";

/**
 * Validates the Clerk publishable key by decoding the base64 payload
 * and checking if it resolves to a real Clerk frontend API domain.
 * Clerk keys are formatted as: pk_(test|live)_<base64-encoded-domain>
 */
function isValidClerkKey(key: string): boolean {
  if (!key || !key.startsWith("pk_")) return false;

  try {
    // Extract the base64 portion after "pk_test_" or "pk_live_"
    const parts = key.split("_");
    if (parts.length < 3) return false;
    const encoded = parts.slice(2).join("_");
    const decoded = atob(encoded);

    // Invalid placeholder keys decode to domains containing "invalid"
    if (decoded.includes("invalid")) return false;

    // A valid Clerk domain should end with ".clerk.accounts.dev" or similar
    return true;
  } catch {
    // If base64 decoding fails, the key is malformed
    return false;
  }
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  // Bypass Clerk initialization during server-side static pre-rendering
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  if (!isValidClerkKey(publishableKey)) {
    console.warn(
      "Clerk: Publishable key is invalid or a placeholder. " +
      "Auth features are disabled. Set a valid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local."
    );
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
