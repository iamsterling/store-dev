"use client";

import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useBag } from "./bag-provider";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { OverlayContext, rememberOverlayOrigin } from "./overlay-link";

export function AddToBag({
  productId,
  option,
  name,
  compact = false,
}: {
  productId: string;
  option: string;
  name: string;
  compact?: boolean;
}) {
  const { add } = useBag();
  const router = useRouter();
  const insideOverlay = useContext(OverlayContext);
  return (
    <Button
      variant={compact ? "outline" : "default"}
      size={compact ? "icon" : "lg"}
      className={
        compact
          ? "size-11 rounded-full border-foreground/10 bg-card shadow-sm hover:bg-primary hover:text-primary-foreground"
          : "h-13 w-full"
      }
      aria-label={compact ? `Add ${name} to bag` : undefined}
      onClick={(event) => {
        if (!insideOverlay) rememberOverlayOrigin(event.currentTarget);
        add(productId, option);
        // Replace product → bag, rather than stacking two modals/history entries.
        if (insideOverlay) router.replace("/bag", { scroll: false });
        else router.push("/bag", { scroll: false });
      }}
    >
      {compact ? (
        <Plus className="size-4" aria-hidden="true" />
      ) : (
        <>
          Add to bag <Plus aria-hidden="true" />
        </>
      )}
    </Button>
  );
}
