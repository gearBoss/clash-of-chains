"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/lobby", label: "Lobby" },
  { href: "/deck-builder", label: "Deck" },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/profile", label: "Profile" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg text-primary-400">
            ChainClash
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary-600/20 text-primary-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ConnectButton />
        </div>

        {/* Mobile nav */}
        <nav className="flex sm:hidden items-center gap-1 pb-2 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
