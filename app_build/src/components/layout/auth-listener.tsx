"use client";

import { useEffect } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { toast } from "sonner";

export function AuthListener() {
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    async function setupListener() {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        try {
          unlisten = await listen<{ token: string }>("auth-token-received", (event) => {
            const token = event.payload.token;
            toast.success("Authentication Successful!", {
              description: "Received secure token via deep link.",
            });
            // Phase 9: Here we would pass the token to Clerk or Supabase client
            console.log("JWT Received via deep link:", token);
          });
        } catch (err) {
          console.warn("Failed to setup auth listener", err);
        }
      }
    }

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return null;
}
