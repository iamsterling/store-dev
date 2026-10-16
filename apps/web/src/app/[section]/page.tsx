import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { sections, type Section } from "@/lib/sections";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}
function getSection(key: string) {
  return Object.hasOwn(sections, key) ? sections[key as Section] : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const section = getSection((await params).section);
  return { title: section?.title ?? "Not found" };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const section = getSection((await params).section);
  if (!section) notFound();
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Operations / {section.label}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {section.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {section.description}
        </p>
      </div>
      <Card className="shadow-none">
        <CardContent className="flex flex-col items-center px-6 py-20 text-center">
          <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent">
            <PackageOpen className="size-7 text-primary" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-medium tracking-tight">
            {section.empty}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            {section.detail}
          </p>
          <p className="mt-6 max-w-md rounded-lg bg-muted p-4 text-xs leading-6 text-muted-foreground">
            <strong className="font-medium text-foreground">
              Next backend milestone:
            </strong>{" "}
            {section.next}
          </p>
          <Button asChild className="mt-7">
            <Link href="/setup">
              View project setup <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
