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
  title: "National Re-Tech Fusion 3.0 | 2026 Archive",
  description:
    "Explore the 2026 National Re-Tech Fusion congress, held 1–3 May in Sousse by the IEEE PES × PELS Joint Student Chapter at INSAT.",
  keywords: ["NRTF", "IEEE", "renewable energy", "electronics", "AI", "INSAT", "Tunisia"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${alro.variable} ${syne.variable}`}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
