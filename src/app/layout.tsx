import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://whattodovictoria.com.au"),
  title: {
    default: "What To Do Victoria — Events, Restaurants & Things To Do in Victoria",
    template: "%s | What To Do Victoria",
  },
  description:
    "Your local guide to Victoria — discover events, restaurants, cafes, bars, hotels, and things to do across Geelong, Ballarat, Bendigo and beyond.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://whattodovictoria.com.au",
    siteName: "What To Do Victoria",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 font-sans antialiased">{children}</body>
    </html>
  );
}
