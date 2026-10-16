import Link from "next/link";
import { ArrowUpRight, Sun } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary/50">
      <div className="mx-auto grid max-w-360 gap-10 px-5 py-14 md:grid-cols-[1.7fr_1fr_1fr] md:px-10 lg:px-16">
        <div>
          <Link
            href="/"
            aria-label="Daymark home"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.06em]"
          >
            <Sun
              className="size-6 text-primary"
              strokeWidth={1.2}
              aria-hidden="true"
            />
            DAYMARK
          </Link>
          <p className="mt-4 max-w-xs font-editorial text-2xl leading-snug">
            Good things for the places
            <br />
            and moments you call yours.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-[10px] font-semibold tracking-[0.18em] uppercase">
            Find your everyday
          </h2>
          <nav
            aria-label="Shop footer"
            className="grid gap-3 text-sm text-muted-foreground"
          >
            <Link href="/shop">Shop the collection</Link>
            <Link href="/shop?category=Living">For your space</Link>
            <Link href="/shop?category=Kitchen">For your table</Link>
            <Link href="/shop?category=Everyday">For the way out</Link>
          </nav>
        </div>
        <div>
          <h2 className="mb-5 text-[10px] font-semibold tracking-[0.18em] uppercase">
            A little more about us
          </h2>
          <nav
            aria-label="Information footer"
            className="grid gap-3 text-sm text-muted-foreground"
          >
            <Link href="/about">Our point of view</Link>
            <Link href="/help" className="inline-flex items-center gap-2">
              Good to know{" "}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </nav>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            Storefront preview. Sample products and prices. Orders are not
            enabled.
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-360 flex-wrap justify-between gap-3 border-t px-5 py-5 text-[10px] text-muted-foreground md:px-10 lg:px-16">
        <span>© {new Date().getFullYear()} Daymark. A concept storefront.</span>
        <span>A more thoughtful everyday.</span>
      </div>
    </footer>
  );
}
