import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dashboard.dolla.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Dolla Dashboard",
  description:
    "Personal finance and budgeting app for managing money, investments, expenses and retirement planning.",
  authors: [
    {
      name: "Rodney Osodo",
      url: "https://rodneyosodo.com",
    },
  ],
  keywords: [
    "dollar",
    "budget",
    "finance",
    "investments",
    "retirement",
    "dashboard",
  ],
  creator: "Rodney Osodo",
  publisher: "Rodney Osodo",

  openGraph: {
    type: "website",
    title: "Dolla Dashboard",
    description:
      "Personal finance and budgeting app for managing money, investments, expenses and retirement planning.",
    url: baseUrl,
    siteName: "Dolla Dashboard",
    images: [
      {
        url: `${baseUrl}/opengraph-image.jpg`,
        secureUrl: `${baseUrl}/opengraph-image.jpg`,
        alt: "Dolla Dashboard",
        type: "image/jpeg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dolla Dashboard",
    description:
      "Personal finance and budgeting app for managing money, investments, expenses and retirement planning.",
    images: [
      {
        url: `${baseUrl}/opengraph-image.jpg`,
        secureUrl: `${baseUrl}/opengraph-image.jpg`,
        alt: "Dolla Dashboard",
        type: "image/jpeg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
