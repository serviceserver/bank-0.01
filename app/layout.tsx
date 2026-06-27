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
      <body className="min-h-full flex flex-col font-sans">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
