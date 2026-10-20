import type { Metadata } from "next";
import { Charis_SIL, Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const charis = Charis_SIL({ variable: "--font-charis", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: `${BRAND.name} | Tailor your resume to every job, honestly`,
  description:
    "Paste a job description and AI rewrites your resume around it using only facts you can back up. Every suggestion is fact-checked. Free to start.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${charis.variable} antialiased`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
