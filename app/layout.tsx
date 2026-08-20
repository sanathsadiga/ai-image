import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PressForm — Newspaper Creative Studio",
  description: "AI-assisted, production-safe newspaper advertising studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

