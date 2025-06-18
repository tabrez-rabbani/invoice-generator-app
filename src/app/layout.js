import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContext from "../context/AuthContext";

// Optimize font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Use swap to prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ["system-ui", "sans-serif"], // Fallback fonts
  adjustFontFallback: true, // Automatically adjust metrics to match fallback fonts
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
});

export const metadata = {
  title: "Invoice Generator",
  description: "Professional invoice generator application",
  // Add caching directives
  other: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />

        {/* Add preload hints for critical resources */}
        <link
          rel="preload"
          href="/api/dashboard/stats"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AuthContext>
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
