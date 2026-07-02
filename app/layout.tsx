import type { Metadata } from "next";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titan Bank",
  description: "Secure, fast, and transparent banking for everyone. Open an account in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}