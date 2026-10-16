"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings2,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/catalog", label: "Catalog", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/setup", label: "Project setup", icon: Settings2 },
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-wrap gap-1 md:flex-col"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring",
            pathname === href && "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
