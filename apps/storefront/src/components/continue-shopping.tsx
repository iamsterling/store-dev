"use client";

import { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { OverlayContext } from "./overlay-link";

export function ContinueShopping() {
  const insideOverlay = useContext(OverlayContext);
  const router = useRouter();
  return insideOverlay ? (
    <Button
      variant="ghost"
      className="min-h-11 w-full"
      onClick={() => router.back()}
    >
      Continue exploring
    </Button>
  ) : (
    <Button variant="ghost" asChild className="min-h-11 w-full">
      <Link href="/shop">Continue exploring</Link>
    </Button>
  );
}
