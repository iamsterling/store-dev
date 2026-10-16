"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { MAX_QUANTITY, bagSubtotal } from "@/lib/bag";
import { formatMoney, getProduct } from "@/lib/catalog";
import { useBag } from "./bag-provider";
import { OverlayLink } from "./overlay-link";
import { ContinueShopping } from "./continue-shopping";

export function BagContent() {
  const { lines, count, changeQuantity } = useBag();
  return (
    <div className="flex min-h-full flex-1 flex-col" data-testid="bag-content">
      <div className="px-6 pt-7">
        <p className="text-[11px] tracking-[0.15em] text-primary uppercase">
          A few good things
        </p>
        <h1 className="mt-3 font-editorial text-4xl tracking-tight">
          Your bag{" "}
          <span className="font-sans text-base text-muted-foreground">
            ({count})
          </span>
        </h1>
      </div>
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <ShoppingBag
            className="mb-6 size-10 text-primary"
            strokeWidth={1}
            aria-hidden="true"
          />
          <h2 className="font-editorial text-2xl">
            Room for something lovely.
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Your bag is empty. Find your new everyday favorite.
          </p>
          <Button asChild className="mt-6 min-h-12">
            <Link href="/shop">
              Explore the collection <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 px-6">
            <ul className="divide-y">
              {lines.map((line) => {
                const product = getProduct(line.productId);
                if (!product) return null;
                return (
                  <li
                    key={`${line.productId}:${line.option}`}
                    className="flex gap-4 py-6"
                  >
                    <div className="relative h-28 w-22 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <OverlayLink
                        href={`/products/${product.id}`}
                        className="text-sm font-medium leading-6"
                      >
                        {product.name}
                      </OverlayLink>
                      <div className="mt-1 flex flex-wrap justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {line.option}
                        </p>
                        <span className="text-sm">
                          {formatMoney(product.price * line.quantity)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-11 rounded-full"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() =>
                              changeQuantity(line, line.quantity - 1)
                            }
                          >
                            <Minus className="size-3" aria-hidden="true" />
                          </Button>
                          <output
                            className="w-6 text-center text-sm"
                            aria-label={`Quantity of ${product.name}`}
                          >
                            {line.quantity}
                          </output>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-11 rounded-full"
                            disabled={line.quantity >= MAX_QUANTITY}
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() =>
                              changeQuantity(line, line.quantity + 1)
                            }
                          >
                            <Plus className="size-3" aria-hidden="true" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => changeQuantity(line, 0)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="sticky bottom-0 mt-auto border-t bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between text-base">
              <span>Subtotal</span>
              <strong data-testid="bag-subtotal" className="font-medium">
                {formatMoney(bagSubtotal(lines))}
              </strong>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Sample prices in USD. Your bag stays in this browser. Taxes,
              delivery, and checkout are not connected.
            </p>
            <Button disabled className="mt-4 h-12 w-full">
              Checkout coming soon
            </Button>
            <ContinueShopping />
          </div>
        </>
      )}
    </div>
  );
}
