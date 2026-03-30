import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const alro = localFont({
  src: [
    { path: "../public/fonts/alro-regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/alro-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-alro",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "National Re-Tech Fusion 3.0 | 1–3 Mai 2026",
  description:
    "The unique national event uniting Renewable Energy, Electronics Technologies, and Artificial Intelligence. Organized by IEEE PES & IEEE PELS at INSAT, Tunis.",
  keywords: ["NRTF", "IEEE", "renewable energy", "electronics", "AI", "INSAT", "Tunisia"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${alro.variable} ${syne.variable}`}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
