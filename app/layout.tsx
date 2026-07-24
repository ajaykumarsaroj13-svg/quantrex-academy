import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantrex Academy | Premium IIT JEE Mathematics",
  description: "India's most premium Mathematics learning platform for IIT JEE. Concept Creates Destiny.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-background text-text antialiased font-sans selection:bg-primary/30 selection:text-white",
        jakarta.variable,
        inter.variable
      )}>
        <div className="relative flex min-h-screen flex-col bg-noise bg-repeat">
          {children}
        </div>
      </body>
    </html>
  );
}
