import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { ProductDetails } from "@/components/product-details";
import { RouteOverlay } from "@/components/route-overlay";

export default async function ProductPreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <RouteOverlay
      key={product.id}
      title={product.name}
      description="A closer look, without losing your place."
    >
      <ProductDetails product={product} preview />
    </RouteOverlay>
  );
}
