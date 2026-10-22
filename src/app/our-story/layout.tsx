import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Our Story ❤️ | Lena Fathima K & Sanoof",
  description:
    "Some stories begin before two people even know each other. The story of Sanoof & Lena Fathima K, from a bus in December 2023 to forever.",
  openGraph: {
    title: "Our Story ❤️ | Lena Fathima K & Sanoof",
    description:
      "Some stories begin before two people even know each other. The story of Sanoof & Lena Fathima K.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF9F6] text-[#4A383B] selection:bg-rose-200 selection:text-rose-900">
      {children}
    </div>
  );
}
