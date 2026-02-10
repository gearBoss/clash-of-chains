"use client";

import { clsx } from "clsx";

interface ManaBarProps {
  current: number;
  max: number;
}

export function ManaBar({ current, max }: ManaBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-blue-400">Mana</span>
        <span className="font-mono text-blue-300">
          {current}/{max}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: Math.max(max, 1) }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-2 flex-1 rounded-sm transition-colors duration-300",
              i < current ? "bg-blue-500" : "bg-gray-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}
