import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alchemystic Wellness",
  description: "Transform your life through holistic wellness practices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dancingScript.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
