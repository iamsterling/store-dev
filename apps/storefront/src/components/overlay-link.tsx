"use client";

import Link from "next/link";
import { createContext, useContext } from "react";

export const OverlayContext = createContext(false);
let origin: HTMLElement | null = null;

export function rememberOverlayOrigin(element: HTMLElement) {
  origin = element;
}
export function restoreOverlayFocus(event: Event) {
  event.preventDefault();
  if (origin?.isConnected) origin.focus({ preventScroll: true });
}

export function OverlayLink({
  children,
  replace,
  ...props
}: React.ComponentProps<typeof Link>) {
  const insideOverlay = useContext(OverlayContext);
  return (
    <Link
      {...props}
      replace={replace ?? insideOverlay}
      scroll={false}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          !insideOverlay &&
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        )
          rememberOverlayOrigin(event.currentTarget);
      }}
    >
      {children}
    </Link>
  );
}
