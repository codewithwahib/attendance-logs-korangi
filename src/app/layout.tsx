import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./Components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Penguin's Offensive Security",
    template: "%s | Penguin's Offensive Security"
  },
  description: "Professional offensive security services, penetration testing, and cybersecurity training. Protecting your digital assets with expert ethical hacking solutions. Search pengoffsec for more information.",
  keywords: [
    "offensive security", 
    "penetration testing", 
    "ethical hacking", 
    "cybersecurity", 
    "security assessment", 
    "vulnerability testing", 
    "red team", 
    "security consulting",
    "pengoffsec",
    "penguin security",
    "offensive security services",
    "security testing",
    "penetration testers",
    "cybersecurity experts"
  ],
  authors: [{ name: "Penguin's Offensive Security", url: "https://pengoffsec.com" }],
  creator: "Penguin's Offensive Security",
  publisher: "Penguin's Offensive Security",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pengoffsec.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Penguin's Offensive Security",
    description: "Professional offensive security services, penetration testing, and cybersecurity training. Search pengoffsec for expert security solutions.",
    url: "https://pengoffsec.com",
    siteName: "Penguin's Offensive Security",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Penguin's Offensive Security - pengoffsec",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Penguin's Offensive Security",
    description: "Professional offensive security services, penetration testing, and cybersecurity training. Search pengoffsec for more.",
    images: ["/twitter-image.jpg"],
    creator: "@pengoffsec",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://pengoffsec.com" />
        <meta name="keywords" content="pengoffsec, offensive security, penetration testing, ethical hacking, cybersecurity, security assessment, vulnerability testing, red team, security consulting" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}