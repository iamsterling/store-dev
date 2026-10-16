import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { edits, getEdit, productsForEdit } from "@/lib/edits";
import { ProductCard } from "@/components/product-card";

export const dynamicParams = false;
export function generateStaticParams() {
  return edits.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return { title: getEdit((await params).slug)?.title ?? "Edit not found" };
}
export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const edit = getEdit((await params).slug);
  if (!edit) notFound();
  return (
    <div className="mx-auto max-w-360 px-5 pt-6 md:px-10 lg:px-16">
      <Link
        href="/edits"
        className="inline-flex min-h-11 items-center text-xs text-muted-foreground"
      >
        ← All edits
      </Link>
      <section
        className={`mt-4 grid overflow-hidden rounded-2xl md:grid-cols-2 ${edit.tone}`}
      >
        <div className="p-7 md:p-12">
          <p className="text-xs tracking-widest uppercase">
            The edit / {edit.number}
          </p>
          <h1 className="mt-6 font-editorial text-5xl tracking-tight">
            {edit.title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            {edit.description}
          </p>
        </div>
        <div className="relative aspect-[4/3]">
          <Image
            src={edit.image}
            alt={edit.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            preload
          />
        </div>
      </section>
      <section
        aria-label="In this edit"
        className="mt-10 grid grid-cols-2 gap-4 md:gap-7"
      >
        {productsForEdit(edit).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
      <p className="mt-7 text-xs text-muted-foreground">
        An illustrative collection. Sample prices; ordering is not enabled.
      </p>
    </div>
  );
}
