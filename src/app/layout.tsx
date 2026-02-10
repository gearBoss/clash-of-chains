import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainClash - Card Battler on Base",
  description:
    "Async PvP turn-based card battler. Build your deck, challenge opponents, climb the leaderboard.",
  openGraph: {
    title: "ChainClash",
    description: "Turn-based card battler on Base",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
