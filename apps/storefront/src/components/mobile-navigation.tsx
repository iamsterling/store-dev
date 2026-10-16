"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger className="p-1 md:hidden" aria-label="Open menu">
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm">
        <SheetHeader className="border-b pb-6">
          <SheetTitle className="font-editorial text-3xl font-normal">
            Find your everyday.
          </SheetTitle>
          <SheetDescription>A few good places to start.</SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Mobile navigation"
          className="grid gap-6 px-6 py-4 text-lg"
        >
          {[
            { href: "/shop", label: "Shop all" },
            { href: "/shop?category=Living", label: "Living" },
            { href: "/shop?category=Kitchen", label: "Kitchen" },
            { href: "/shop?category=Everyday", label: "Everyday" },
            { href: "/about", label: "Our point of view" },
            { href: "/help", label: "Good to know" },
          ].map(({ href, label }) => (
            <SheetClose key={href} asChild>
              <Link href={href}>{label}</Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
