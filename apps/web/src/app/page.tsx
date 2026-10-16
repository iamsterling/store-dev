import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Package,
  ShoppingBag,
  Truck,
  Database,
  Code2,
  Layers,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";

const areas = [
  {
    label: "Products",
    icon: Package,
    href: "/catalog",
    detail: "Your future product catalog",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/orders",
    detail: "Your future fulfillment pipeline",
  },
  {
    label: "Suppliers",
    icon: Truck,
    href: "/suppliers",
    detail: "Your future supplier network",
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            The big picture
          </p>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            Let’s build your next chapter.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            One workspace for your products, partners, and operations.
          </p>
        </div>
        <Button asChild>
          <Link href="/setup">
            Set up your workspace <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <section
        aria-labelledby="foundation-heading"
        className="relative overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground lg:p-9"
      >
        <div className="relative z-10 max-w-xl">
          <Badge variant="outline" className="border-white/30 text-white">
            A strong foundation
          </Badge>
          <h2
            id="foundation-heading"
            className="mt-5 text-2xl font-medium tracking-tight"
          >
            Big ambitions. Thoughtful beginnings.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80">
            Your platform starts here. We’re laying the backend groundwork
            before connecting the catalog, suppliers, and orders that power your
            business.
          </p>
          <p className="mt-6 flex items-center gap-2 text-xs text-white/80">
            <Code2 className="size-4" aria-hidden="true" />
            Next.js <span className="mx-1 text-white/40">/</span> Supabase{" "}
            <span className="mx-1 text-white/40">/</span> shadcn/ui
          </p>
        </div>
        <Boxes
          className="absolute -right-8 -bottom-10 size-64 rotate-[-12deg] text-white/10"
          strokeWidth={0.75}
          aria-hidden="true"
        />
      </section>
      <section
        aria-label="Operations modules"
        className="grid gap-4 sm:grid-cols-3"
      >
        {areas.map(({ label, icon: Icon, href, detail }) => (
          <Card key={label} className="shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-medium text-muted-foreground"
                aria-label="Not connected"
              >
                —
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
              <Link
                href={href}
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary"
              >
                Explore {label.toLowerCase()}{" "}
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Make it yours</CardTitle>
            <CardDescription>
              A clear path from foundation to your first order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                number: "01",
                title: "Connect your data foundation",
                detail: "Configure Supabase and establish your access model.",
              },
              {
                number: "02",
                title: "Build your product pipeline",
                detail: "Model suppliers, products, and inventory syncs.",
              },
              {
                number: "03",
                title: "Bring your operations to life",
                detail:
                  "Connect orders, fulfillment, and reliable background jobs.",
              },
            ].map(({ number, title, detail }) => (
              <div key={number} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs text-muted-foreground">
                  {number}
                </span>
                <div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Under the hood</CardTitle>
            <CardDescription>Small surface. Room to grow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Layers
                className="mt-0.5 size-4 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium">A shared design language</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Owned shadcn components, shared tokens, and accessible
                  primitives.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Database
                className="mt-0.5 size-4 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium">
                  Backend-ready, not connected
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This preview contains no live business data. Database setup is
                  a separate step.
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/setup">
                Open project setup <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        An intentional starting point. No live sales, integrations, or inventory
        yet.
      </p>
    </div>
  );
}
