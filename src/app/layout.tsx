import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEETINTEL — Enterprise Meeting Intelligence",
  description: "AI-powered meeting intelligence that captures decisions, actions, risks and everything your team missed. Turn every meeting into actionable intelligence.",
  keywords: ["meeting intelligence", "AI", "productivity", "enterprise", "meeting analytics", "voice box"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
