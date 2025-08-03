import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthAI Chat - AI-Powered Healthcare Assistant",
  description:
    "Get instant healthcare guidance with our AI assistant. Professional medical insights at your fingertips.",
  keywords: [
    "healthcare",
    "AI",
    "medical assistant",
    "health chat",
    "medical advice",
  ],
  authors: [{ name: "HealthAI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="min-h-screen backdrop-blur-sm">{children}</div>
      </body>
    </html>
  );
}
