import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="mb-5 text-xs tracking-widest text-primary uppercase">
        A little off the beaten path
      </p>
      <h1 className="font-editorial text-5xl tracking-tight">
        This one got away.
      </h1>
      <p className="mt-6 text-sm leading-7 text-muted-foreground">
        We couldn’t find that page. There are still plenty of good things to
        explore.
      </p>
      <Button asChild className="mt-8">
        <Link href="/shop">
          Back to the collection <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
