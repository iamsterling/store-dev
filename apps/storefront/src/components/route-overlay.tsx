"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@repo/ui/components/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/components/sheet";
import { OverlayContext, restoreOverlayFocus } from "./overlay-link";

function subscribeViewport(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function mobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}
function serverSnapshot() {
  return false;
}

export function RouteOverlay({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const mobile = useSyncExternalStore(
    subscribeViewport,
    mobileSnapshot,
    serverSnapshot,
  );
  const close = () => router.back();
  const closeButton = (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-3 right-3 size-11 rounded-full"
      aria-label="Close preview"
      onClick={close}
    >
      <X className="size-5" aria-hidden="true" />
    </Button>
  );
  // Only one modal primitive is mounted: no duplicate content or competing focus traps.
  return (
    <OverlayContext.Provider value={true}>
      {mobile ? (
        <Drawer
          open
          onOpenChange={(open) => {
            if (!open) close();
          }}
          autoFocus
        >
          <DrawerContent
            onCloseAutoFocus={restoreOverlayFocus}
            className="h-[94dvh] data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[94dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl"
          >
            <DrawerHeader className="relative shrink-0 border-b px-6 py-3 text-left! pr-16">
              <DrawerTitle className="text-sm font-medium">{title}</DrawerTitle>
              <DrawerDescription className="text-xs">
                {description}
              </DrawerDescription>
              {closeButton}
            </DrawerHeader>
            <div
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
              data-testid="overlay-scroll"
            >
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) close();
          }}
        >
          <SheetContent
            showCloseButton={false}
            onCloseAutoFocus={restoreOverlayFocus}
            className="w-full gap-0 sm:max-w-2xl"
          >
            <SheetHeader className="relative shrink-0 border-b px-7 py-5 pr-16">
              <SheetTitle className="text-sm font-medium">{title}</SheetTitle>
              <SheetDescription className="text-xs">
                {description}
              </SheetDescription>
              {closeButton}
            </SheetHeader>
            <div
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
              data-testid="overlay-scroll"
            >
              {children}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </OverlayContext.Provider>
  );
}
