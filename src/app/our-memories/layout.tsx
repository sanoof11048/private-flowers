import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Memories ❤️🔐 | Lena & Sanoof",
  description: "A private corner of our story with our real moments and memories.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OurMemoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
