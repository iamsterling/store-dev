import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductDetails } from "@/components/product-details";
import { ProductCard } from "@/components/product-card";
import { getProduct, products } from "@/lib/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return {
    title: product?.name ?? "Product not found",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <div
      className="mx-auto max-w-360 px-5 pt-6 md:px-10 lg:px-16"
      data-testid="full-product-page"
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-3 text-xs text-muted-foreground"
      >
        <Link href="/shop" className="inline-flex min-h-11 items-center gap-2">
          <ArrowLeft className="size-3" aria-hidden="true" />
          All goods
        </Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`}>
          {product.category}
        </Link>
      </nav>
      <ProductDetails product={product} />
      <section aria-labelledby="related-heading" className="pt-16">
        <h2
          id="related-heading"
          className="mb-8 font-editorial text-4xl tracking-tight"
        >
          Good company.
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6">
          {products
            .filter((item) => item.id !== product.id)
            .map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
        </div>
      </section>
    </div>
  );
}
