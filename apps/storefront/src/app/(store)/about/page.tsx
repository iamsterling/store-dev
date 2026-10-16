import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sun } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export const metadata: Metadata = { title: "Our point of view" };
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-360 px-5 pt-14 md:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl py-8 text-center">
        <Sun
          className="mx-auto mb-8 size-10 text-primary"
          strokeWidth={1}
          aria-hidden="true"
        />
        <p className="mb-6 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          Our point of view
        </p>
        <h1 className="font-editorial text-5xl leading-[1.05] tracking-[-0.05em] md:text-7xl">
          Less noise.
          <br />
          <em>More everyday joy.</em>
        </h1>
        <p className="mx-auto mt-7 max-w-md text-sm leading-8 text-muted-foreground">
          A favorite cup. A softly lit corner. A bag that comes along for the
          ride. We think the pieces you live with should earn their place in
          your day.
        </p>
      </div>
      <div className="relative my-10 aspect-[16/8] min-h-70">
        <Image
          src="/images/hero.jpg"
          alt="A considered living space filled with natural light"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="mx-auto max-w-xl py-6 text-center">
        <h2 className="font-editorial text-3xl">
          Something worth making room for.
        </h2>
        <p className="mt-6 text-sm leading-8 text-muted-foreground">
          Daymark is our starting point for a considered everyday shop. The
          collection you see today is illustrative: an exploration of the kinds
          of pieces, textures, and little rituals we’d like to bring together.
        </p>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">
          We’re building the experience first. Real products, verified supplier
          details, shipping policies, and ordering will come later. For now,
          have a look around and make yourself at home.
        </p>
        <Button asChild className="mt-8 h-12 px-6">
          <Link href="/shop">
            Meet the collection <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
