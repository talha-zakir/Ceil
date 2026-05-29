import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Dashboard — AI Cost & Quota Monitor",
  description:
    "Privacy-first, real-time LLM usage monitoring. Track token costs, rate limits, and quotas across OpenAI, Anthropic, Gemini, Groq, and Mistral.",
  keywords: [
    "AI API",
    "LLM costs",
    "rate limits",
    "token usage",
    "OpenAI",
    "Anthropic",
    "developer tools",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0e17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
        suppressHydrationWarning
      >
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(224 15% 12%)",
              border: "1px solid hsl(224 12% 20%)",
              color: "hsl(0 0% 95%)",
              fontSize: "13px",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
