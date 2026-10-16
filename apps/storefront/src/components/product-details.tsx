import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { formatMoney, type Product } from "@/lib/catalog";
import { AddToBag } from "./add-to-bag";

// Both canonical pages and intercepted previews use this server-rendered content.
export function ProductDetails({
  product,
  preview = false,
}: {
  product: Product;
  preview?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col" data-testid="product-details">
      <div
        className={
          preview
            ? "flex flex-col"
            : "grid items-start gap-10 md:grid-cols-2 md:gap-16"
        }
      >
        <div
          className={`relative overflow-hidden bg-secondary ${preview ? "aspect-[4/3] max-h-90 shrink-0" : "aspect-[4/5]"}`}
        >
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes={
              preview
                ? "(max-width: 768px) 100vw, 640px"
                : "(max-width: 768px) 100vw, 50vw"
            }
            preload
            className="object-cover"
          />
        </div>
        <div className={preview ? "px-6 py-6 md:px-8" : "py-2 md:py-8"}>
          <p className="mb-4 text-[11px] tracking-[0.16em] text-primary uppercase">
            {product.eyebrow}
          </p>
          <h1
            className={`font-editorial leading-[1.08] tracking-[-0.05em] ${preview ? "text-4xl" : "text-4xl lg:text-6xl"}`}
          >
            {product.name}
          </h1>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xl">
              {formatMoney(product.price)}{" "}
              <span className="ml-1 text-[10px] text-muted-foreground">
                USD · Sample price
              </span>
            </p>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-6 border-t pt-5">
            <p className="text-xs text-muted-foreground">Illustrative finish</p>
            <Badge
              variant="secondary"
              className="mt-3 px-4 py-2 text-xs font-normal"
            >
              {product.options[0]}
            </Badge>
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="details"
            className="mt-5"
          >
            <AccordionItem value="details">
              <AccordionTrigger>The details</AccordionTrigger>
              <AccordionContent>
                <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-muted-foreground">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery & returns</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  Delivery regions, costs, lead times, and return terms will be
                  confirmed before ordering is enabled. No delivery or return
                  promise is offered in this preview.
                </p>
                <Link
                  href="/help"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs underline"
                >
                  Good to know{" "}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
            <Info className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
            Sample product and reference photography. No live stock or ordering
            yet.
          </p>
        </div>
      </div>
      <div
        className={`sticky z-10 mt-auto flex shrink-0 items-center gap-5 border-t bg-background/95 px-5 py-4 backdrop-blur-md ${preview ? "bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]" : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-0"}`}
        data-testid="purchase-bar"
      >
        <p className="shrink-0 text-base">{formatMoney(product.price)}</p>
        <div className="flex-1">
          <AddToBag
            productId={product.id}
            option={product.options[0] ?? ""}
            name={product.name}
          />
        </div>
      </div>
    </div>
  );
}
