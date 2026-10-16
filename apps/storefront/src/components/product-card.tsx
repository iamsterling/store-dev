import Image from "next/image";
import { OverlayLink } from "./overlay-link";
import { formatMoney, type Product } from "@/lib/catalog";
import { AddToBag } from "./add-to-bag";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <OverlayLink
          href={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
          className="block h-full"
        >
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
          />
        </OverlayLink>
        <span className="absolute top-3 left-3 bg-background/95 px-2.5 py-1.5 text-[9px] tracking-[0.12em] uppercase">
          The {product.category.toLowerCase()} edit
        </span>
        <div className="absolute right-3 bottom-3">
          <AddToBag
            productId={product.id}
            option={product.options[0] ?? ""}
            name={product.name}
            compact
          />
        </div>
      </div>
      <div className="pt-4">
        <p className="mb-2 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
          {product.eyebrow}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="text-[13px] font-medium leading-6 sm:text-sm">
            <OverlayLink
              href={`/products/${product.id}`}
              className="hover:underline"
            >
              {product.name}
            </OverlayLink>
          </h3>
          <p className="text-[13px] leading-6">{formatMoney(product.price)}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.options[0]}
        </p>
      </div>
    </article>
  );
}
