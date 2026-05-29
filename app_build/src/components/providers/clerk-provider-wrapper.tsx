"use client";

import { ClerkProvider } from "@clerk/clerk-react";

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  if (!publishableKey) {
    console.warn("Clerk publishable key is missing. Auth will be disabled.");
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
