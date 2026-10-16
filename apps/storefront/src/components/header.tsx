import Link from "next/link";
import { Search, Sun } from "lucide-react";
import { BagTrigger } from "./bag-trigger";
import { MobileNavigation } from "./mobile-navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-17 max-w-360 items-center justify-between gap-5 px-5 md:h-21 md:px-10 lg:px-16">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Daymark home"
        >
          <Sun
            className="size-7 text-primary"
            strokeWidth={1.2}
            aria-hidden="true"
          />
          <span className="text-xl font-semibold tracking-[-0.08em]">
            DAYMARK<span className="text-primary">.</span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-xs md:flex"
        >
          <Link href="/">Discover</Link>
          <Link href="/edits">The edits</Link>
          <Link href="/shop">All goods</Link>
          <Link href="/about" className="border-l pl-8 text-muted-foreground">
            Our point of view
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/shop#search"
            aria-label="Search products"
            className="hidden size-11 items-center justify-center md:flex"
          >
            <Search className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <BagTrigger />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
