"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, Layers3, Search, ShoppingBag } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useBag } from "./bag-provider";
import { OverlayLink } from "./overlay-link";

export function BottomNavigation() {
  const pathname = usePathname();
  const { count } = useBag();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {[
        {
          href: "/",
          label: "Discover",
          icon: Compass,
          active: pathname === "/",
        },
        {
          href: "/edits",
          label: "The edits",
          icon: Layers3,
          active: pathname.startsWith("/edits"),
        },
        {
          href: "/shop",
          label: "All goods",
          icon: Search,
          active: pathname === "/shop",
        },
      ].map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-18 flex-col items-center justify-center gap-1.5 text-[10px] text-muted-foreground",
            active && "text-primary",
          )}
        >
          <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
          {label}
        </Link>
      ))}
      <OverlayLink
        href="/bag"
        aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
        className="relative flex min-h-18 flex-col items-center justify-center gap-1.5 text-[10px] text-muted-foreground"
      >
        <span className="relative">
          <ShoppingBag
            className="size-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {count > 0 && (
            <span className="absolute -top-2 -right-3 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
              {count}
            </span>
          )}
        </span>
        Bag
      </OverlayLink>
    </nav>
  );
}
