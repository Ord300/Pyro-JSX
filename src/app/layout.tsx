import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Les Aigles du Congo — Centre Sportif",
  description: "Centre sportif officiel du Football Club Les Aigles du Congo, Les Samouraïs — fondé le 21 août 2023 à Kinshasa, champion Linafoot Ligue 1 2024-2025.",
  icons: { icon: "/aigles-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${barlowCondensed.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}