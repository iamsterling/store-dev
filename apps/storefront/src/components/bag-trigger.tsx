"use client";

import { ShoppingBag } from "lucide-react";
import { useBag } from "./bag-provider";
import { OverlayLink } from "./overlay-link";

export function BagTrigger() {
  const { count } = useBag();
  return (
    <OverlayLink
      href="/bag"
      className="flex min-h-11 items-center gap-2 text-sm"
      aria-label={`Open shopping bag (${count} ${count === 1 ? "item" : "items"})`}
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden="true" />
      <span className="hidden md:inline">Bag</span>
      <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[10px]">
        {count}
      </span>
    </OverlayLink>
  );
}
