import type { Metadata, Viewport } from "next";
import { Alex_Brush, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "For Lena Fathima K",
  description: "A digital bouquet blooming just for Lena Fathima K.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${alexBrush.variable} ${cormorant.variable} ${jakarta.variable}`}
    >
      <body className="bg-[#050505] text-[#ECE6E2] font-sans antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
