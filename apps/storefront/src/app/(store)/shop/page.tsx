import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { ProductCard } from "@/components/product-card";
import { categories, filterProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop the collection" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" &&
    categories.some((item) => item === params.category)
      ? params.category
      : "All";
  const query = typeof params.q === "string" ? params.q.slice(0, 200) : "";
  const sort =
    typeof params.sort === "string" &&
    ["price-asc", "price-desc"].includes(params.sort)
      ? params.sort
      : "featured";
  const results = filterProducts({ category, query, sort });
  return (
    <div className="mx-auto max-w-360 px-5 pt-12 md:px-10 lg:px-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-xs text-muted-foreground"
      >
        <Link href="/">Home</Link>
        <span className="mx-3">/</span>
        <span>Shop</span>
      </nav>
      <div className="mb-10">
        <p className="mb-4 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          A little less ordinary
        </p>
        <h1 className="font-editorial text-5xl tracking-[-0.05em] md:text-6xl">
          {category === "All"
            ? "Good things, all together."
            : `The ${category.toLowerCase()} edit.`}
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
          Considered pieces for your space, your table, and the everyday in
          between. Explore our sample collection.
        </p>
      </div>
      <form
        key={`${category}:${query}:${sort}`}
        action="/shop"
        className="mb-7 flex flex-wrap items-end gap-3 border-y py-5"
      >
        <input type="hidden" name="category" value={category} />
        <div id="search" className="min-w-48 flex-1">
          <label
            htmlFor="product-search"
            className="mb-2 block text-[10px] tracking-widest uppercase"
          >
            Find something good
          </label>
          <div className="relative">
            <Search
              className="absolute top-3 left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="product-search"
              name="q"
              type="search"
              defaultValue={query}
              maxLength={200}
              placeholder="Search the collection"
              className="h-10 bg-card pl-10"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="sort"
            className="mb-2 block text-[10px] tracking-widest uppercase"
          >
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-10 max-w-full border bg-card px-3 text-xs"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <Button type="submit" className="h-10 gap-3 px-5">
          Apply <SlidersHorizontal className="size-3" aria-hidden="true" />
        </Button>
      </form>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <nav aria-label="Product categories" className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              key={item}
              href={{
                pathname: "/shop",
                query: { category: item, ...(query && { q: query }), sort },
              }}
              aria-current={category === item ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-xs transition-colors hover:border-foreground",
                category === item &&
                  "border-foreground bg-foreground text-background",
              )}
            >
              {item === "All" ? "All goods" : item}
            </Link>
          ))}
        </nav>
        <p role="status" className="text-xs text-muted-foreground">
          {results.length} {results.length === 1 ? "good thing" : "good things"}
          {query && <> for “{query}”</>}
        </p>
      </div>
      {results.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="border bg-card px-6 py-20 text-center">
          <Search
            className="mx-auto mb-5 size-8 text-primary"
            strokeWidth={1}
            aria-hidden="true"
          />
          <h2 className="font-editorial text-3xl">
            No good things found. Yet.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Try a different search or explore the full collection.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">
              Clear filters <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
