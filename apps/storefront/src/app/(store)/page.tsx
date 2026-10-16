import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Sun } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";
import { EditGrid } from "@/components/edit-grid";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-360 px-5 py-10 md:px-10 lg:px-16">
        <p className="text-xs tracking-widest text-primary uppercase">
          Not more things. More feeling.
        </p>
        <h2 className="mt-3 font-editorial text-4xl tracking-tight">
          Find your kind of everyday.
        </h2>
        <p className="mt-3 mb-7 text-sm text-muted-foreground">
          Four small edits. A different way into the collection.
        </p>
        <EditGrid />
      </section>
      <section className="mx-auto grid max-w-360 md:min-h-150 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center bg-[#eee9dd] px-7 py-14 md:px-10 lg:px-16 lg:py-20">
          <p className="mb-7 flex items-center gap-3 text-[10px] font-medium tracking-[0.2em] uppercase">
            <span className="h-px w-8 bg-primary" />
            The art of the everyday
          </p>
          <h1 className="font-editorial text-[clamp(3.5rem,6.3vw,6.8rem)] leading-[1.02] tracking-[-0.065em]">
            Good things.
            <br />
            <span className="italic text-primary">Every day.</span>
          </h1>
          <p className="mt-7 max-w-76 text-sm leading-7 text-muted-foreground">
            For the slow mornings, the shared tables, and everything in between.
            Find a little something that feels like you.
          </p>
          <Button asChild className="mt-8 h-12 w-fit gap-8 px-6 text-xs">
            <Link href="/shop">
              Find your everyday{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <a
            href="#everyday-edit"
            className="mt-12 flex w-fit items-center gap-3 text-[10px] tracking-[0.1em] uppercase"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-foreground/25">
              <ArrowDown className="size-3" aria-hidden="true" />
            </span>
            A few of our favorite things
          </a>
        </div>
        <div className="relative min-h-100 overflow-hidden md:min-h-full">
          <Image
            src="/images/hero.jpg"
            alt="Sunlit living room with natural textures, a cream sofa, and a round wooden table"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            preload
            className="object-cover object-[58%_50%]"
          />
          <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4 border-t border-white/70 pt-4 text-white [text-shadow:0_1px_8px_#000] md:right-8 md:bottom-8 md:left-8">
            <p className="text-xs leading-6">
              A space to slow down.
              <br />
              <span className="text-[10px] tracking-[0.12em] uppercase">
                The living edit
              </span>
            </p>
            <Link
              href="/shop?category=Living"
              aria-label="Explore the living edit"
              className="flex size-10 items-center justify-center rounded-full border border-white/80"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <div className="border-y bg-background">
        <div className="mx-auto flex max-w-360 flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-[10px] tracking-[0.15em] text-muted-foreground uppercase md:gap-x-20">
          <span>Simple by design</span>
          <Sun
            className="size-4 text-primary"
            strokeWidth={1}
            aria-hidden="true"
          />
          <span>Made for your everyday</span>
          <Sun
            className="hidden size-4 text-primary sm:block"
            strokeWidth={1}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">A little less ordinary</span>
        </div>
      </div>
      <section
        id="everyday-edit"
        aria-labelledby="edit-heading"
        className="mx-auto max-w-360 px-5 pt-16 md:px-10 lg:px-16 lg:pt-22"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Meet your new favorites
            </p>
            <h2
              id="edit-heading"
              className="font-editorial text-4xl tracking-[-0.04em] md:text-5xl"
            >
              The everyday edit.
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-4 border-b border-foreground pb-1.5 text-xs"
          >
            Explore the collection{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section
        aria-labelledby="collections-heading"
        className="mx-auto max-w-360 px-5 pt-20 md:px-10 lg:px-16"
      >
        <div className="mb-8 flex items-end justify-between">
          <h2
            id="collections-heading"
            className="font-editorial text-3xl tracking-[-0.04em] md:text-4xl"
          >
            Make room for the good.
          </h2>
          <span className="hidden text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:inline">
            Explore by collection
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              name: "For your space",
              category: "Living",
              image: "/images/hero.jpg",
              alt: "A light-filled living space",
              caption: "A softer place to land.",
            },
            {
              name: "For your table",
              category: "Kitchen",
              image: "/images/dinnerware.jpg",
              alt: "Blue ceramic dinnerware",
              caption: "Set the scene for the everyday.",
            },
            {
              name: "For the way out",
              category: "Everyday",
              image: "/images/bag.jpg",
              alt: "A tan everyday tote",
              caption: "Good company, wherever you go.",
            },
          ].map((collection) => (
            <Link
              key={collection.category}
              href={`/shop?category=${collection.category}`}
              className="group relative aspect-[4/3] overflow-hidden bg-secondary"
            >
              <Image
                src={collection.image}
                alt={collection.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-editorial text-3xl tracking-tight">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-xs text-white/85">
                    {collection.caption}
                  </p>
                </div>
                <ArrowRight className="mb-1 size-5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-20 grid max-w-360 md:grid-cols-2">
        <div className="relative min-h-90 md:min-h-115">
          <Image
            src="/images/candle.jpg"
            alt="A candle glowing softly in an evening setting"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col items-start justify-center bg-accent px-7 py-14 md:px-12 lg:px-20">
          <Sun
            className="mb-7 size-10 text-primary"
            strokeWidth={1}
            aria-hidden="true"
          />
          <p className="mb-5 text-[10px] tracking-[0.2em] uppercase">
            The Daymark point of view
          </p>
          <h2 className="max-w-md font-editorial text-4xl leading-[1.1] tracking-[-0.04em] lg:text-5xl">
            A good life is made
            <br />
            of little things.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
            Not more stuff. More meaning in the stuff you choose. We’re
            imagining a home for everyday pieces that make the ordinary feel a
            little more special.
          </p>
          <Link
            href="/about"
            className="mt-7 flex items-center gap-8 border-b border-foreground pb-2 text-xs"
          >
            Get to know Daymark{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
