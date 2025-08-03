import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baymax Lite - Your Personal Healthcare Companion",
  description:
    "Hello! I am Baymax Lite, your personal healthcare companion. I will scan you now to assess your medical needs.",
  keywords: [
    "healthcare",
    "AI",
    "Baymax",
    "medical assistant",
    "health companion",
    "Big Hero 6",
  ],
  authors: [{ name: "Baymax Healthcare Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen backdrop-blur-sm">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
