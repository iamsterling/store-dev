import type { Metadata } from "next";
import { BagProvider } from "@/components/bag-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Daymark — Good things for everyday living",
    template: "%s | Daymark",
  },
  description:
    "Explore considered pieces for your home, your table, and your everyday. A concept storefront with a sample collection.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:bg-primary focus:p-3 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <BagProvider>{children}</BagProvider>
      </body>
    </html>
  );
}
