# Contextual shopping routes

## Decision

The storefront `(store)` route group owns its header, footer, and safe-area-aware mobile
navigation. One `@overlay` parallel slot intercepts product and bag navigation. Soft visits
open a shadcn Drawer on mobile or Sheet on desktop; direct visits and refreshes use canonical
pages. Shared product and bag content avoids separate implementations of shopping behavior.

The slot has null root, default, and catch-all routes. Default alone cannot clear an active
slot during soft navigation. Product-to-bag transitions replace history rather than stacking
modals, so dismissal returns to the originating collection. Product links inside the bag
also replace the preview. Originating controls receive focus when a preview closes.

Editorial `/edits` routes use existing catalog fixtures. They add discovery structure, not
new supplier, inventory, payment, or authentication capabilities. Checkout remains disabled.

## Trade-offs and verification

Responsive modal selection mounts only one focus trap. The mobile drawer supports swipe and
keyboard dismissal; desktop uses a side sheet. The canonical pages remain usable independently
of intercepted navigation. Browser coverage exercises Back/Forward, focus and scroll recovery,
slot clearing, refresh/deep links, local bag persistence, and both viewport presentations.
Real-device Safari and screen-reader testing remain separate manual verification work.
